import React, { useState } from 'react';
import axios from 'axios';
import { URL } from '../constants/config';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

function Synthesize() {
  const [rows, setRows] = useState('');
  const [proceed,setProceed] = useState(false);
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate()

  const handleInputChange = (event) => {
    setRows(event.target.value);
  };

  const handleProceed = async () => {
    console.log(`Number of rows: ${String(rows)}`);

    setProceed(true);

    try{
      const response = await axios.post(`${URL}/api/generate-synthetic-data`, {
        rows: String(rows)
      });
      const data = await response.data;
      console.log(data)
      enqueueSnackbar('Generated Synthetic Data Successfully!',{variant:'success'})
      setProceed(false);
      navigate('/result')
    }catch(error){
      enqueueSnackbar('Unexpected Error Occurred!',{variant:'error'})
      console.error(error);
    } 

  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-center w-full md:w-2/3 lg:w-1/2 space-y-4 md:space-y-0 md:space-x-8">
        <div className="w-full md:w-1/2 flex justify-center">
          <img src="src/assets/synthesize_img.png" alt="Synthetic Data" className="w-full h-auto object-cover rounded-md shadow-lg" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start md:ml-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Generate Synthetic Data</h1>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center">
        <div className="w-full flex flex-col items-center space-y-4">
          <label className="w-full text-left mb-2">
            Enter Number of Rows:
          </label>
          <input
            type="number"
            value={rows}
            onChange={handleInputChange}
            className="w-1/2 mt-2 p-2 text-black rounded-md"
          />
          <button
            onClick={handleProceed}
            className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-800 transition duration-300 ${proceed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {proceed ? 'Processing...' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Synthesize;
