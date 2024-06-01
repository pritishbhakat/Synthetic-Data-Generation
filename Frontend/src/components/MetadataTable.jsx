import React, { useState} from 'react';


function MetadataTable({ columns }) {
  const [editableColumns, setEditableColumns] = useState(columns);

  const handleInputChange = (columnName, value) => {
    setEditableColumns(prevColumns => ({
      ...prevColumns,
      [columnName]: { ...prevColumns[columnName], sdtype: value }
    }));
  };

  return (
    <table className="table-auto w-full bg-gray-800 text-white">
      <thead>
        <tr>
          <th className="px-4 py-2">Column Name</th>
          <th className="px-4 py-2">SDType</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(editableColumns).map(([columnName, columnData]) => (
          <tr key={columnName}>
            <td className="border px-4 py-2">{columnName}</td>
            <td className="border px-4 py-2">
              <input
                type="text"
                value={columnData.sdtype}
                onChange={e => handleInputChange(columnName, e.target.value)}
                className="bg-gray-700 text-white p-2 rounded"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MetadataTable