import React from 'react';

interface Column {
  key: string;
  label: string | React.ReactNode;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data?: any[];
  rows?: any[];
  selectable?: boolean;
  onRowSelect?: (selectedRows: any[]) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  rows,
  selectable = false,
  onRowSelect,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  
  // Use rows if provided, otherwise fall back to data
  const tableData = rows || data || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(tableData.map((_, index) => index));
      setSelectedRows(allIndices);
      onRowSelect?.(tableData);
    } else {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    }
  };

  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    
    const selectedData = tableData.filter((_, i) => newSelected.has(i));
    onRowSelect?.(selectedData);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ 
      overflowX: 'auto', 
      maxHeight: '600px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px',
        backgroundColor: '#ffffff'
      }}>
        <thead>
          <tr style={{
            background: '#1e40af',
            color: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderBottom: '2px solid #1e40af'
          }}>
            {selectable && (
              <th style={{
                padding: '8px 6px',
                textAlign: 'center',
                width: '40px',
                color: '#ffffff',
                backgroundColor: '#1e40af'
              }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size === tableData.length && tableData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: '8px 6px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '12px',
                  width: column.width || 'auto',
                  color: '#ffffff',
                  backgroundColor: '#1e40af'
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              {selectable && (
                <td style={{
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={(e) => handleRowSelect(index, e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: '8px 6px',
                    fontSize: '12px',
                    color: '#374151'
                  }}
                >
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
