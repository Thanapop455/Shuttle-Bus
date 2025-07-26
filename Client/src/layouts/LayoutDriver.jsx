import React from 'react';
import { Outlet } from 'react-router-dom';

const LayoutDriver = () => {
  return (
    <div>
      <header className="bg-blue-500 text-white p-4 text-center">
        🚍 Driver Dashboard
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutDriver;
