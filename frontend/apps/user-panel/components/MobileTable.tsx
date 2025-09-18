import React, { useState, useEffect } from 'react';

interface MobileTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any, index?: number) => React.ReactNode;
    mobileHide?: boolean;
    priority?: number; // Higher number = higher priority on mobile
  }[];
  onRowClick?: (row: any) => void;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  responsive?: boolean;
}

const MobileTable: React.FC<MobileTableProps> = ({
  data,
  columns,
  onRowClick,
  className = '',
  striped = true,
  hover = true,
  bordered = true,
  responsive = true
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(columns);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // On mobile, show only high priority columns or first 3 columns
      const priorityColumns = columns
        .filter(col => col.priority !== undefined)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, 3);
      
      if (priorityColumns.length > 0) {
        setVisibleColumns(priorityColumns);
      } else {
        setVisibleColumns(columns.slice(0, 3));
      }
    } else {
      setVisibleColumns(columns);
    }
  }, [isMobile, columns]);

  if (isMobile) {
    return (
      <div className={`mobile-table-container ${className}`}>
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="mobile-table-card card mb-3">
            <div className="card-body">
              {visibleColumns.map((column) => (
                <div key={column.key} className="mobile-table-row d-flex justify-content-between align-items-center mb-2">
                  <span className="mobile-table-label fw-bold text-muted">
                    {column.label}:
                  </span>
                  <span className="mobile-table-value text-end">
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </span>
                </div>
              ))}
              {onRowClick && (
                <div className="mobile-table-actions mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={() => onRowClick(row)}
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`table-responsive ${className}`}>
      <table className={`table ${striped ? 'table-striped' : ''} ${hover ? 'table-hover' : ''} ${bordered ? 'table-bordered' : ''}`}>
        <thead className="table-dark">
          <tr>
            {visibleColumns.map((column) => (
              <th key={column.key} className={column.mobileHide ? 'd-mobile-hide' : ''}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {visibleColumns.map((column) => (
                <td key={column.key} className={column.mobileHide ? 'd-mobile-hide' : ''}>
                  {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MobileTable;
