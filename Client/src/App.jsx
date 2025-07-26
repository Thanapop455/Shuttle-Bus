import React from 'react'
import { ToastContainer } from "react-toastify";
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <AppRoutes />
    </div>
  )
}

export default App
