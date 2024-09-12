import React from 'react';
import { useNavigate } from 'react-router-dom';

function Intro() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate('/home');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="flex flex-col flex-grow items-center justify-center p-4">
        <div className="flex flex-col md:flex-row items-center w-full md:w-2/3 lg:w-1/2 space-y-4 md:space-y-0 md:space-x-8">
          <div className="w-full md:w-1/2 flex justify-center">
            <img src="assets/Intro-img.png" alt="Synthetic Data" className="w-full h-auto object-cover rounded-md shadow-lg" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start md:ml-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Welcome to the World of Synthetic Data</h1>
            <p className="text-base md:text-lg">
              Explore the limitless possibilities of synthetic data generation. Click the button below to proceed.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center">
          <h2 className="mt-8 text-xl md:text-2xl font-bold">Generate Synthetic Data</h2>
          <button
            onClick={handleProceed}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300"
          >
            Proceed
          </button>
        </div>
      </div>
      <footer className="text-center py-4">
        <p className="text-sm">
          Developed with <span className="text-red-500">&hearts;</span> by <span className="font-bold">PRiTiSh</span>
        </p>
      </footer>
    </div>
  );
}

export default Intro;
