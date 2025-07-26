import React, { useState, useEffect } from 'react'
import useMaingobal from '../../store/maingobal'
import { getCurrentDriver } from '../api/auth'
import LoadingToRedirect from './LoadingToRedirect'


const ProtectRouteDriver = ({ element }) => {
    const [ok, setOk] = useState(false)
    const user = useMaingobal((state) => state.user)
    const token = useMaingobal((state) => state.token)

    useEffect(() => {
        if (user && token) {
            // send to back
            getCurrentDriver(token)
                .then((res) => setOk(true))
                .catch((err) => setOk(false))
        }
    }, [])

    return ok ? element : <LoadingToRedirect />
}

export default ProtectRouteDriver