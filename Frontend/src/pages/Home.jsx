import React, { useState } from 'react';
import axios from 'axios';
import {URL} from "../constants/config"
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom';

function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(false);
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    event.preventDefault();
    // console.log(event.target.files[0])
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    
    
    try {
      // Get the upload URL from the server
      const response = await axios.post(`${URL}/api/put-object-url`, {
        filename: file.name,
      });

      const uploadUrl = response.data.url;
      // console.log(uploadUrl)

      const formData = new FormData();
      formData.append('file', file);

      // Upload the file to the S3 URL
      const responsePUT = await axios.put(
        uploadUrl, file, {
          headers: {
            'Content-Type': file.type, 
          },
        }
      );
      // console.log(responsePUT)
      setProgress(true)
      enqueueSnackbar('File Uploaded Successfully!',{variant:'success'})
      // alert("File uploaded successfully!");
    } catch (error) {
      console.error("File upload failed:", error);
      enqueueSnackbar('File Upload Failed. Please try again.',{variant:'error'})
      // alert("File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleProceed = () => {
    // Handle proceed logic here
    if(progress){
      navigate('/metadata')
    } else {
      // alert("Please upload a file first.")
      enqueueSnackbar('Please Upload a File First',{variant:'error'})
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col items-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Excel File</h1>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="text-white mb-4"
        />
        <button
          onClick={handleUpload}
          className={`px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          onClick={handleProceed}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300 mt-4"
        >
          Proceed
        </button>
        <p className="text-red-500 mt-4">NOTE: Only Single Table Allowed</p>
      </div>
    </div>
  );
}

export default Home;





