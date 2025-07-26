import React from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from '../layouts/Layout';
import BusStatus from '../pages/BusStatus';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/admin/Dashboard';
import LayoutAdmin from '../layouts/LayoutAdmin';
import UserManage from '../pages/admin/UserManage';
import BusManage from '../pages/admin/BusManage';
import BusStop from '../pages/admin/BusStop';
import AllMap from '../pages/AllMap';
import EditBusStop from '../pages/admin/EditBusStop';
import EditBus from '../pages/admin/EditBus';
import LayoutDriver from '../layouts/LayoutDriver';
import DriverMap from '../pages/DriverMap';
import Register from '../pages/admin/Register';
import ProtectRouteAdmin from './ProtectRouteAdmin';
import ProtectRouteDriver from './ProtectRouteDriver';

const router = createBrowserRouter([
  { path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <AllMap /> },
      { path:"map", element: <AllMap />},
      { path:"buses", element: <BusStatus /> },
      { path:"login", element: <Login /> },
    ],
  },

  {
    path: '/admin',
    element: <ProtectRouteAdmin element={<LayoutAdmin />}/>,
    children:[
      { index: true,element: <Dashboard />},
      { path: "manage",element: <UserManage />},
      { path: "bus",element: <BusManage />},
      { path: "bus/:id",element: <EditBus />},
      { path: "busstop",element: <BusStop />},
      { path: "busstop/:id",element: <EditBusStop />},
      { path: "register",element: <Register />},
    ]
  },

  {
    path: "/driver",
    element: <ProtectRouteDriver element={<LayoutDriver />}/>,
    children:[
      { index:true,element: <DriverMap />},
    ]
  }
])
const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default AppRoutes
