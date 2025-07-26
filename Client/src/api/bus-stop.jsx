import axios from "axios";

export const getBusStops = async () => {
  return axios.get("http://localhost:5001/api/bus-stops");
};

export const getBusStopById = async (token, stopId) => {
  return axios.get(`http://localhost:5001/api/bus-stops/${stopId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};


  
  export const addBusStop = async (token, busStopData) => {
    return axios.post("http://localhost:5001/api/bus-stops", busStopData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  
  export const updateBusStop = async (token, stopId, busStopData) => {
    return axios.put(`http://localhost:5001/api/bus-stops/${stopId}`, busStopData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  
  export const deleteBusStop = async (token, stopId) => {
    return axios.delete(`http://localhost:5001/api/bus-stops/${stopId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  