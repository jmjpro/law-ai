import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createClientDb,
  getCaseServer,
  getCaseOnClient,
  type Case,
  CaseTableClient,
  addCaseOnClient,
} from './data'
import Loader from './Loader'
import App from './App'

export default function FetchAppData() {
  const queryClient = useQueryClient()
  const clientDb = createClientDb()
  const [isClientCaseAdded, setClientCaseAdded] = useState(false)

  const {
    data: serverCase,
    isLoading: isLoadingCaseServer,
    isError: isErrorCaseServer,
  } = useQuery<Case | null>({
    queryKey: ['case-server'],
    queryFn: getCaseServer,
  })

  const clientQuery = useQuery<Case | null>({
    queryKey: ['case-on-client'],
    queryFn: () => getCaseOnClient(clientDb, serverCase?.caseNumber),
    enabled:
      clientDb !== undefined &&
      !isLoadingCaseServer &&
      serverCase?.caseNumber !== undefined &&
      serverCase?.caseNumber.length > 1,
  })
  const {
    data: clientCase,
    isLoading: isLoadingCaseClient,
    isError: isErrorCaseClient,
  } = clientQuery

  const addCaseClient = useMutation({
    mutationFn: ({ db, theCase }: { db: CaseTableClient; theCase: Case }) =>
      addCaseOnClient(db, theCase),
    onSuccess: () => {
      setClientCaseAdded(true)
      queryClient.invalidateQueries({ queryKey: ['case-on-client'] })
    },
    onError: (err) => {
      console.error(err)
      setClientCaseAdded(false)
    },
  })

  if (
    serverCase &&
    !isLoadingCaseClient &&
    !isErrorCaseClient &&
    clientCase === null &&
    !isClientCaseAdded
  ) {
    addCaseClient.mutate({ db: clientDb, theCase: serverCase })
  } else {
    console.log('skipping the addition of case to clientDb')
  }

  if (isLoadingCaseServer || isLoadingCaseClient) {
    return <Loader />
  }

  if (
    isErrorCaseServer ||
    isErrorCaseClient ||
    clientCase === null ||
    clientCase === undefined
  ) {
    return <p>Oops, failed to load</p>
  }

  return <App clientDb={clientDb} clientQuery={clientQuery} />
}
