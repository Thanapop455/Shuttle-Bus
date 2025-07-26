import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Layout = () => {
  return (
    <div>

      <Navbar />

      <main className='h-full px-4 mt-2'>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout