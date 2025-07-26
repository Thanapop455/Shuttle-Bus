import React, { useState, useEffect } from 'react'
import useMaingobal from '../../store/maingobal'
import { getCurrentAdmin } from '../api/auth'
import LoadingToRedirect from './LoadingToRedirect'


const ProtectRouteAdmin = ({ element }) => {
    const [ok, setOk] = useState(false)
    const user = useMaingobal((state) => state.user)
    const token = useMaingobal((state) => state.token)

    useEffect(() => {
        if (user && token) {
            // send to back
            getCurrentAdmin(token)
                .then((res) => setOk(true))
                .catch((err) => setOk(false))
        }
    }, [])

    return ok ? element : <LoadingToRedirect />
}

export default ProtectRouteAdmin