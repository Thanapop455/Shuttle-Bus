import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

const LoadingToRedirect = () => {
  const [count, setCount] = useState(5)
  const [redirect, setRedirect] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((currentCount) => {
        if (currentCount === 1) {
          clearInterval(interval)
          setRedirect(true)
        }
        return currentCount - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (redirect) {
    return <Navigate to="/" />
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="bg-white shadow-2xl rounded-2xl px-10 py-8 text-center max-w-md w-full animate-fade-in-up">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-pink-600 mb-2">
          ไม่มีสิทธิ์เข้าหน้านี้นะจ๊ะ 💋
        </h1>
        <p className="text-gray-700 text-lg">
          กำลังพากลับไปหน้าหลักใน 
          <span className="font-bold text-blue-600 animate-pulse"> {count} </span> วินาที
        </p>
      </div>
    </div>
  )
}

export default LoadingToRedirect
