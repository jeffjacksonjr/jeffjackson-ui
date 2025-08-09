import React from "react";

const TableLoader = ({ columns = 6, rows = 5 }) => {
  // Calculate minimum width based on columns (approx 200px per column)
  const minWidth = `${columns * 200}px`;

  return (
    <div className="w-full overflow-x-auto">
      <div className="animate-pulse space-y-4" style={{ minWidth }}>
        {/* Header row */}
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={`header-${i}`}
              className="h-4 bg-gradient-to-r from-purple-900 to-purple-800 rounded"
              style={{ width: "200px" }} // Fixed column width
            />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`h-4 rounded ${
                  rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                }`}
                style={{ width: "200px" }} // Fixed column width
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableLoader;