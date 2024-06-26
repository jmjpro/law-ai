import { Dexie, type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'
import { MRT_ColumnDef } from 'material-react-table'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const CaseEventDef = z.object({
  date: z.string(),
  type: z.string(),
  name: z.string(),
  data: z.string(),
  summary: z.string(),
  medicalOrg: z.string(),
  careProvider: z.string(),
  enabled: z.boolean(),
  duplicate: z.boolean(),
})

const CaseEventsDef = z.array(CaseEventDef)

const CaseDef = z.object({
  incidentOn: z.string(),
  clientName: z.string(),
  caseNumber: z.string(),
  clientDOB: z.string(),
  summary: z.string(),
  note: z.string(),
})

type CaseEvent = { id: string } & z.infer<typeof CaseEventDef>
type Case = z.infer<typeof CaseDef> & {events: CaseEvent[]}

const eventLabels: MRT_ColumnDef<CaseEvent>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    enableEditing: false,
    
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'data',
    header: 'Data',
  },
  {
    accessorKey: 'summary',
    header: 'Summary',
  },
  {
    accessorKey: 'medicalOrg',
    header: 'Medical Org',
  },
  {
    accessorKey: 'careProvider',
    header: 'Care Provider',
  },
  {
    accessorKey: 'enabled',
    header: 'Is Enabled?',
  },
  {
    accessorKey: 'duplicate',
    header: 'Is Duplicate?',
  },
]

type CaseTableClient = Dexie & {
  case: EntityTable<Case, 'caseNumber'>
}
function createClientDb(): CaseTableClient {
  const db = new Dexie('Case'/* , { addons: [dexieCloud] } */) as CaseTableClient
  db.version(1).stores({
    case: 'caseNumber',
  })

  /* db.cloud.configure({
    databaseUrl: 'https://zw09wvihu.dexie.cloud',
    requireAuth: true, // optional
  }) */

  return db
}

async function getCaseServer(): Promise<Case | null> {
  console.log('started getting case from server')
  const response = await fetch('/law-ai/winifred-weber-demo.json')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const json = (await response.json()) as Case
  let parsedCase: Omit<Case, 'events'>
  let parsedEvents: Array<Omit<CaseEvent, 'id'>>
  try {
    parsedCase = CaseDef.parse(json)
    parsedEvents = CaseEventsDef.parse(json.events)
  } catch (err) {
    console.error(`error ${err} parsing network response`)
    throw err
  }
  console.log('finished getting case from server')
  // assign a unique id to each event
  return {...parsedCase, events: parsedEvents.map(event => ({id: uuidv4(), ...event}))}
}

async function getCaseOnClient(
  db: CaseTableClient,
  caseNumber?: string,
): Promise<Case | null> {
  console.log('getting case from client')
  if (!db || !caseNumber) {
    return null
  }
  try {
    const existingCase = await db.case.get(caseNumber)
    if (!existingCase) {
      return null
    }
    console.log('Found case on client')
    return existingCase
  } catch (error) {
    console.error('Failed to get case on client. Error: ' + error)
  }
  return null
}

async function addCaseOnClient(
  db: CaseTableClient,
  theCase: Case,
): Promise<void> {
  console.log('adding case to clientDb')
  try {
    await db.case.add(theCase)
  } catch (error) {
    console.error('Failed to add case. Error: ' + error)
    return Promise.reject(error)
  }
  console.log('case successfully added to clientDb')
  return Promise.resolve()
}

async function updateCaseOnClient(
  db: CaseTableClient,
  theCase: Case,
): Promise<void> {
  console.log('updating case on clientDb')
  console.log(theCase)
  try {
    await db.case.update(theCase.caseNumber, theCase)
  } catch (error) {
    console.error('Failed to update case. Error: ' + error)
    return Promise.reject(error)
  }
  console.log('case successfully updated on clientDb')
  return Promise.resolve()
}

export {
  createClientDb,
  getCaseServer,
  getCaseOnClient,
  addCaseOnClient,
  updateCaseOnClient,
  eventLabels,
}
export type { Case, CaseEvent, CaseTableClient }
