import { type UseQueryResult } from '@tanstack/react-query'
import { type CaseEvent, type Case } from '../data'
import { MRT_TableOptions } from 'material-react-table'

export default function getBaseConfig(
  clientQuery: UseQueryResult<Case | null, Error>,
  caseEvents: CaseEvent[],
) {
  const {
    isLoading: isLoadingCaseClient,
    isRefetching: isRefetchingCaseClient,
    isError: isErrorCaseClient,
  } = clientQuery

  const baseConfig: Omit<
    MRT_TableOptions<{
      summary: string
      type: string
      date: string
      id: string
      name: string
      data: string
      medicalOrg: string
      careProvider: string
      enabled: boolean
      duplicate: boolean
    }>,
    'columns'
  > = {
    isMultiSortEvent: () => true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnOrdering: true, //enable a feature for all columns
    enableGlobalFilter: false, //turn off a feature
    enableGrouping: true,
    enableStickyHeader: true,
    enableMultiSort: true,
    muiToolbarAlertBannerProps: isErrorCaseClient
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    state: {
      isLoading: isLoadingCaseClient,
      showAlertBanner: isErrorCaseClient,
      showProgressBars: isRefetchingCaseClient,
    },
    enableGlobalFilterModes: true,
    positionGlobalFilter: 'left',
    initialState: {
      showGlobalFilter: true,
    },
    data: caseEvents, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // onRowSelectionChange: setSelectedRows,
    enableEditing: true,
    editDisplayMode: 'row',
  }
  return baseConfig
}
