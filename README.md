Use React to build a table to display the data with the json data provided the following guidelines:

    * Users should be able to group/collapse records by a specific column and then be able to do sub-groupings within that group (and sub-groupings within that group). Any grouping should be sortable by any column (including the entire table when there are no groupings).
        example: I want to group all events by medicalOrg and within that group, i would like to group and sort all events by date . I should have the option to further sub-sort and subgroup the events grouped by date.
    * Users should be able to reorder columns
    * Users should be able to click a button to jump to the earliest record of type injury
    * Users should be able to mark a record as "hidden". There should be a toggle button for "show hidden files (X)" where X is the number of files marked as hidden.
    * Records should not display more than 2 rows of text. If it goes past the 2 rows, we should indicate that its truncated and we should have some mechanism to show the full content (hover over, click to view more, etc.)
    * Users should be able to modify elements in a record
    * Users should be able to search in a search bar to filter on all data in in the table
    * Users should be able to filter date, diagnosis, medicalOrg, careProvider
    * Users should be able to add an remove columns from view