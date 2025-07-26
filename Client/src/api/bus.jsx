import axios from "axios";

export const getBuses = async (token) => {
  return axios.get("http://localhost:5001/api/buses", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getBusById = async (token, busId) => {
  return axios.get(`http://localhost:5001/api/buses/${busId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addBus = async (token, busData) => {
  return axios.post("http://localhost:5001/api/buses", busData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateBusStatus = async (token, driverId, status) => {
  return axios.put(`http://localhost:5001/api/buses/${driverId}/status`, 
    { status },
    { headers: { Authorization: `Bearer ${token}` } } // ✅ ตรวจสอบว่ามี Token หรือไม่
  );
};
export const assignDriver = async (token, busId, driverId) => {
  return axios.put(`http://localhost:5001/api/buses/${busId}/assign-driver`, { driverId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteBus = async (token, busId) => {
  return axios.delete(`http://localhost:5001/api/buses/${busId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
