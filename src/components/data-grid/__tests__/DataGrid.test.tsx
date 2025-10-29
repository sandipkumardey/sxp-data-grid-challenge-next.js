import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataGrid } from '../DataGrid';

// Mock AG Grid React
jest.mock('@ag-grid-community/react', () => {
  const MockAgGridReact = ({ 
    rowData, 
    columnDefs, 
    onGridReady, 
    onSortChanged, 
    onFilterChanged 
  }: any) => {
    React.useEffect(() => {
      if (onGridReady) {
        onGridReady({
          api: {
            setGridOption: jest.fn(),
            setRowData: jest.fn(),
            setColumnDefs: jest.fn(),
            setSortModel: jest.fn(),
            setFilterModel: jest.fn(),
            setColumnState: jest.fn(),
            sizeColumnsToFit: jest.fn(),
            onSortChanged: onSortChanged || jest.fn(),
            onFilterChanged: onFilterChanged || jest.fn(),
          },
          columnApi: {
            setColumnsVisible: jest.fn(),
            setColumnState: jest.fn(),
          },
        });
      }
    }, [onGridReady, onSortChanged, onFilterChanged]);

    return (
      <div data-testid="ag-grid">
        <div role="grid">
          <div role="rowgroup">
            <div role="row" className="ag-header-row">
              {columnDefs?.map((col: any) => (
                <div 
                  key={col.field} 
                  role="columnheader" 
                  className="ag-header-cell"
                  data-testid={`header-${col.field}`}
                >
                  {col.headerName}
                </div>
              ))}
            </div>
          </div>
          <div role="rowgroup">
            {rowData?.map((row: any, rowIndex: number) => (
              <div 
                key={rowIndex} 
                role="row" 
                className="ag-row"
                data-testid={`row-${rowIndex}`}
              >
                {columnDefs?.map((col: any) => (
                  <div 
                    key={col.field} 
                    role="gridcell" 
                    className="ag-cell"
                    data-testid={`cell-${rowIndex}-${col.field}`}
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
  };

  return {
    AgGridReact: MockAgGridReact,
  };
});

describe('DataGrid', () => {
  const mockData = [
    { 
      id: 1, 
      name: 'John Doe', 
      position: 'Developer', 
      experience: 5, 
      availability: 'Full-time', 
      location: 'Remote',
      skills: ['React', 'TypeScript']
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      position: 'Designer', 
      experience: 3, 
      availability: 'Part-time', 
      location: 'On-site',
      skills: ['UI/UX', 'Figma']
    }
  ];

  const columnDefs = [
    { field: 'name', headerName: 'Name' },
    { field: 'position', headerName: 'Position' },
    { field: 'experience', headerName: 'Experience (Years)' },
    { field: 'availability', headerName: 'Availability' },
    { field: 'location', headerName: 'Location' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the data grid with correct number of rows', () => {
    render(
      <DataGrid 
        rowData={mockData} 
        columnDefs={columnDefs} 
        onGridReady={jest.fn()}
      />
    );
    
    // Check if the grid is rendered
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();

    // Check if the correct number of rows are rendered (data rows + header row)
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(mockData.length + 1);
  });

  it('renders the correct column headers', () => {
    render(
      <DataGrid 
        rowData={mockData} 
        columnDefs={columnDefs} 
        onGridReady={jest.fn()}
      />
    );

    // Check if all column headers are rendered
    columnDefs.forEach(column => {
      expect(screen.getByTestId(`header-${column.field}`)).toHaveTextContent(column.headerName);
    });
  });

  it('calls onGridReady with grid API', () => {
    const onGridReady = jest.fn();
    
    render(
      <DataGrid 
        rowData={mockData} 
        columnDefs={columnDefs} 
        onGridReady={onGridReady}
      />
    );

    // Check if onGridReady was called with the mock API
    expect(onGridReady).toHaveBeenCalledWith({
      api: expect.any(Object),
      columnApi: expect.any(Object)
    });
  });

  it('renders the correct data in cells', () => {
    render(
      <DataGrid 
        rowData={mockData} 
        columnDefs={columnDefs} 
        onGridReady={jest.fn()}
      />
    );

    // Check if the data is rendered correctly
    mockData.forEach((row, rowIndex) => {
      Object.entries(row).forEach(([key, value]) => {
        if (columnDefs.some(col => col.field === key)) {
          const cell = screen.getByTestId(`cell-${rowIndex}-${key}`);
          expect(cell).toHaveTextContent(String(value));
        }
      });
    });
  });
});
