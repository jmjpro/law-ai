import {
  Button,
  Checkbox,
  Input,
  InputLabel,
  Stack,
  TextField,
  styled,
} from '@mui/material'
import {
  type UseQueryResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  MRT_RowSelectionState,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef, //if using TypeScript (optional, but recommended)
} from 'material-react-table'
import { useEffect, useMemo, useState } from 'react'
import {
  eventLabels,
  type Case,
  type CaseEvent,
  CaseTableClient,
  updateCaseOnClient,
} from './data'
import './App.css'
import getBaseConfig from './config'

const CaseInputLabel = styled(InputLabel)({
  marginTop: '16px',
})

function renderBooleanFieldAsCheckbox(
  eventLabels: MRT_ColumnDef<CaseEvent>[],
  fieldName: string,
) {
  const label = eventLabels.find((label) => label.accessorKey === fieldName)
  if (!label) {
    return
  }
  label.Cell = ({ cell }) => <Checkbox checked={cell.getValue<boolean>()} />
}

interface AppProps {
  clientDb: CaseTableClient
  clientQuery: UseQueryResult<Case | null, Error>
}
export default function App({ clientDb, clientQuery }: AppProps) {
  const clientCase = clientQuery.data

  const onUpdateCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!clientCase) {
      console.error("no client case to update")
      return
    }
    const newClientCase = {...clientCase, clientName, incidentOn, clientDOB, summary, note}
    updateCaseClient.mutate({ db: clientDb, theCase: newClientCase })
  }
  const onUpdateEvent = (updatedEvent: CaseEvent) => {
    //validate data
    if (!clientCase) {
      return
    }
    const eventIndex = clientCase.events.findIndex(
      (event) => event.id === updatedEvent.id,
    )
    clientCase.events[eventIndex] = updatedEvent
    updateCaseClient.mutate({ db: clientDb, theCase: clientCase })
    table.setEditingRow(null) //exit editing mode
  }

  const queryClient = useQueryClient()

  const updateCaseClient = useMutation({
    mutationFn: ({ db, theCase }: { db: CaseTableClient; theCase: Case }) =>
      updateCaseOnClient(db, theCase),
    onSuccess: () => {
      console.log('updated case on client')
      queryClient.invalidateQueries({ queryKey: ['case-on-client'] })
    },
  })

  const [incidentOn, setIncidentOn] = useState(clientCase?.incidentOn || '')
  const [caseNumber, setCaseNumber] = useState(clientCase?.caseNumber || '')
  const [clientName, setClientName] = useState(clientCase?.clientName || '')
  const [clientDOB, setClientDOB] = useState(clientCase?.clientDOB || '')
  const [summary, setSummary] = useState(clientCase?.summary || '')
  const [note, setNote] = useState(clientCase?.note || '')

  renderBooleanFieldAsCheckbox(eventLabels, 'enabled')
  renderBooleanFieldAsCheckbox(eventLabels, 'duplicate')
  const columns = useMemo<MRT_ColumnDef<CaseEvent>[]>(() => eventLabels, [])

  // const [selectedRows, setSelectedRows] = useState<MRT_RowSelectionState>({});
  const allEvents = clientCase?.events || []
  /* const withoutHiddenEvents = allEvents?.reduce((acc, event, i) => {
      if (!Object.keys(selectedRows).includes(i.toString())) {
          acc.push(event)
      }
      return acc;
  }, [] as CaseEvent[]) */
  // console.log({numEvents: withoutHiddenEvents.length})

  //pass table options to useMaterialReactTable
  const table = useMaterialReactTable({
    ...getBaseConfig(clientQuery, allEvents),
    columns,
    onEditingRowSave: ({ values: updatedEvent }) => onUpdateEvent(updatedEvent),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button onClick={() => table.resetSorting(true)}>
        Clear All Sorting
      </Button>
    ),
  })

  /* useEffect(() => {
      console.info({ selectedRows }); //read your managed row selection state
      // console.info(table.getState().rowSelection); //alternate way to get the row selection state
  }, [selectedRows]); */

  /* return (
    <div>
      {theCase?.incidentOn}-{theCase?.caseNumber}-{theCase?.clientName}
    </div>
  ) */

  return (
    <div id="root">
      <h1>Case</h1>
      <Stack sx={{ width: '800px' }}>
        <form onSubmit={onUpdateCase}>
          <CaseInputLabel>Case Number</CaseInputLabel>
          <Input
            disabled={true}
            name="caseNumber"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
          />
          <CaseInputLabel>Incident On</CaseInputLabel>
          <Input
            name="incidentOn"
            value={incidentOn}
            onChange={(e) => setIncidentOn(e.target.value)}
          />
          <CaseInputLabel>Client Name</CaseInputLabel>
          <Input
            name="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <CaseInputLabel>Client DOB</CaseInputLabel>
          <Input
            name="clientDOB"
            value={clientDOB}
            onChange={(e) => setClientDOB(e.target.value)}
          />
          <CaseInputLabel>Summary</CaseInputLabel>
          <TextField
            name="summary"
            fullWidth
            multiline
            maxRows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <CaseInputLabel>Note</CaseInputLabel>
          <TextField
            name="note"
            fullWidth
            multiline
            maxRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="submit" variant="contained">Update case</Button>
        </form>
      </Stack>

      {/* <div>Hidden row ids: {Object.keys(selectedRows).join(', ')}</div> */}
      <CaseInputLabel>Events</CaseInputLabel>
      <MaterialReactTable table={table} />
    </div>
  )
}
