import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from '../components';
import { URL, DataType } from '../constants/config';
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom';

function MetadataTable({ columns, onColumnChange }) {
  const [editableColumns, setEditableColumns] = useState(columns);

  const handleSdtypeChange = (columnName, value) => {
    setEditableColumns(prevColumns => ({
      ...prevColumns,
      [columnName]: { ...prevColumns[columnName], sdtype: value }
    }));
    onColumnChange(columnName, { ...editableColumns[columnName], sdtype: value });
  };

  const handlePiiChange = (columnName, value) => {
    setEditableColumns(prevColumns => ({
      ...prevColumns,
      [columnName]: { ...prevColumns[columnName], pii: value }
    }));
    onColumnChange(columnName, { ...editableColumns[columnName], pii: value });
  };

  return (
    <table className="table-auto w-full bg-gray-800 text-white">
      <thead>
        <tr>
          <th className="px-4 py-2">Column Name</th>
          <th className="px-4 py-2">SDType</th>
          <th className="px-4 py-2">PII</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(editableColumns).map(([columnName, columnData]) => {
          const dataType = DataType.find(option => option.sdtype === columnData.sdtype) || {};
          const isPiiEnabled = dataType.pii || false;

          return (
            <tr key={columnName}>
              <td className="border px-4 py-2">{columnName}</td>
              <td className="border px-4 py-2">
                <select
                  value={columnData.sdtype}
                  onChange={e => handleSdtypeChange(columnName, e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded"
                >
                  {DataType.map(option => (
                    <option key={option.sdtype} value={option.sdtype}>
                      {option.sdtype}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border px-4 py-2">
                <input
                  type="checkbox"
                  checked={columnData.pii || false}
                  onChange={e => handlePiiChange(columnName, e.target.checked)}
                  disabled={!isPiiEnabled}
                  className="bg-gray-700 text-white p-2 rounded"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}


function Metadata() {
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [updatedColumns, setUpdatedColumns] = useState({});
  const [updating, setUpdating] = useState(false);
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${URL}/api/generate-metadata`);
        // Ensure all columns have a pii property
        const columnsWithPii = Object.fromEntries(
          Object.entries(response.data.metadata.columns).map(([columnName, columnData]) => [
            columnName,
            { ...columnData, pii: columnData.pii || false }
          ])
        );
        setMetadata({ ...response.data.metadata, columns: columnsWithPii });
      } catch (error) {
        setError('Error fetching metadata');
        console.error(error);
      } finally {
        console.log(metadata)
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleColumnChange = (columnName, columnData) => {
    setUpdatedColumns(prevColumns => ({
      ...prevColumns,
      [columnName]: columnData
    }));
  };

  const handleUpdateMetadata = async () => {
    console.log(updatedColumns);
    setUpdating(true);
    try {
      await axios.post(`${URL}/api/update-metadata`, updatedColumns);
      enqueueSnackbar('Metadata updated Successfully!',{variant:'success'})
      setUpdating(false);
      // alert('Metadata updated successfully!');
    } catch (error) {
      console.error('Error updating metadata:', error);
      // alert('Failed to update metadata.');
      enqueueSnackbar('Faled to update metadata.',{variant:'error'})
    }
  };


  const handleProceed = () => {
    // Handle proceed logic here
    navigate('/synthesize')
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Metadata</h1>
      {loading ? (
        <Spinner />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="metadata-display w-full md:w-2/3 lg:w-1/2">
          <MetadataTable columns={metadata.columns} onColumnChange={handleColumnChange} />
        </div>
      )}
          <button
            onClick={handleUpdateMetadata}
            className={`px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition duration-300 ${updating ? 'opacity-50 cursor-not-allowed' : ''} mt-4`}
          >
            {updating ? 'Updating Metadata...' : 'Update Metadata'}
          </button>
          <button
          onClick={handleProceed}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300 mt-4"
        >
          Proceed
        </button>
    </div>
  );
}

export default Metadata;
