import React from 'react';
import { Link } from 'react-router-dom';

const Settings = () => {
  return (
    <div className="w-full h-full rounded-xl flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-4">Hotkey configuration coming soon!</p>
      <Link to="/" className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Player
      </Link>
    </div>
  );
};

export default Settings; 