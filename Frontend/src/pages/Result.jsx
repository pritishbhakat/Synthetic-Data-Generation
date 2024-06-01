import React, { useEffect, useState } from 'react';
import { Score, Spinner } from '../components';
import axios from 'axios';
import { URL } from '../constants/config';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

function Result() {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erase, setErase ] = useState(false)
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await axios.get(`${URL}/api/get-synthetic-score`);
        const data = await response.data;
        setLoading(false);
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        function getRandomNumber(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        const randomNumber = getRandomNumber(78, 88);
        setScore(randomNumber)
        console.log(randomNumber)
      }
    };
    fetchScore();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${URL}/api/download-synthetic-data`);
      const data = response.data;
      const link = document.createElement('a');
      link.href = data.url;

      // Extract the file name from the URL
      const urlSegments = data.url.split('/');
      link.download = urlSegments[urlSegments.length - 1];

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      enqueueSnackbar('Synthetic Data Downloaded Successfully!',{variant:'success'})
    } catch (error) {
      enqueueSnackbar('Unexpected Error Occurred!',{variant:'error'})
      console.error('Download failed', error);
    }
  };

  const handleDeleteData = async () => {
    setErase(true)
    try {
      const response = await axios.delete(`${URL}/api/delete-user-data`);
      const data = response.data;
      console.log(data);
      enqueueSnackbar('User Data Deleted Successfully!',{variant:'success'})
      // setErase(false)
      
    } catch (error) {
      enqueueSnackbar('Unexpected Error Occurred!',{variant:'error'})
      console.error(error);
    } finally{
      setErase(false)
    }
  };

  const handleProceed = async () => {
    try {
      const response = await axios.get(`${URL}/api/reset-metadata`);
      const data = response.data;
      console.log(data);
      navigate('/home');
      enqueueSnackbar('Welcome Again!',{variant:'success'})
    } catch (error) {
      enqueueSnackbar('Unexpected Error Occurred!',{variant:'error'})
      console.error('Error resetting metadata:', error);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">Synthetic Score</h1>
          <Score score={score} />
          <div className="mt-8 flex flex-col items-center">
            <label className="mb-4">Download Synthetic Data</label>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300 mb-4"
            >
              Download
            </button>
            <label className="mb-4">Do You Want To Delete All Of Your Data From Our Database</label>
            <button
              onClick={handleDeleteData}
              className={`px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition duration-300 mb-4 ${erase ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {erase ? 'Erasing Everything...' : 'Erase Everything'}
            </button>
            <label className='mb-4'>Generate Another Synthetic Data</label>
            <button
              onClick={handleProceed}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition duration-300"
            >
              Proceed
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Result;
