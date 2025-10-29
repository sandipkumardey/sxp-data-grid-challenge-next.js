// Mock for AG Grid Community module
module.exports = {
  ...jest.requireActual('@ag-grid-community/core'),
  GridApi: jest.fn().mockImplementation(() => ({
    setGridOption: jest.fn(),
    getColumns: jest.fn(() => []),
    setColumnVisible: jest.fn(),
    getSortModel: jest.fn(() => []),
    setSortModel: jest.fn(),
    setFilterModel: jest.fn(),
    setRowData: jest.fn(),
    setColumnDefs: jest.fn(),
    setDomLayout: jest.fn(),
    sizeColumnsToFit: jest.fn(),
    setColumnState: jest.fn(),
    getColumnState: jest.fn(() => []),
    onFilterChanged: jest.fn(),
    onSortChanged: jest.fn(),
    onPaginationChanged: jest.fn(),
    onGridReady: jest.fn(),
  })),
  ColumnApi: jest.fn().mockImplementation(() => ({
    setColumnsVisible: jest.fn(),
    getColumnState: jest.fn(() => []),
    setColumnState: jest.fn(),
  })),
  ModuleRegistry: {
    registerModules: jest.fn(),
  },
};

// Mock for AG Grid React component
const AgGridReact = jest.fn().mockImplementation(({ rowData, columnDefs, onGridReady }) => {
  // Call onGridReady with the mock API when the component mounts
  React.useEffect(() => {
    if (onGridReady) {
      onGridReady({
        api: {
          setGridOption: jest.fn(),
          getColumns: jest.fn(() => []),
          setColumnVisible: jest.fn(),
          getSortModel: jest.fn(() => []),
          setSortModel: jest.fn(),
          setFilterModel: jest.fn(),
          setRowData: jest.fn(),
          setColumnDefs: jest.fn(),
          setDomLayout: jest.fn(),
          sizeColumnsToFit: jest.fn(),
          setColumnState: jest.fn(),
          getColumnState: jest.fn(() => []),
          onFilterChanged: jest.fn(),
          onSortChanged: jest.fn(),
          onPaginationChanged: jest.fn(),
        },
        columnApi: {
          setColumnsVisible: jest.fn(),
          getColumnState: jest.fn(() => []),
          setColumnState: jest.fn(),
        },
      });
    }
  }, [onGridReady]);

  return (
    <div data-testid="ag-grid">
      <div role="grid">
        <div role="rowgroup">
          <div role="row" className="ag-header-row">
            {columnDefs?.map((col, index) => (
              <div 
                key={col.field} 
                role="columnheader" 
                className="ag-header-cell"
                aria-colindex={index + 1}
              >
                {col.headerName}
              </div>
            ))}
          </div>
        </div>
        <div role="rowgroup">
          {rowData?.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              role="row" 
              className="ag-row"
              aria-rowindex={rowIndex + 2}
            >
              {columnDefs?.map((col, colIndex) => (
                <div 
                  key={col.field} 
                  role="gridcell" 
                  className="ag-cell"
                  aria-colindex={colIndex + 1}
                >
                  {String(row[col.field] ?? '')}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

module.exports.AgGridReact = AgGridReact;
