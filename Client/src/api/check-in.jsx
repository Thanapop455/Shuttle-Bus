import axios from "axios";

export const checkIn = async (token, busStopId, people) => {
    return axios.post("http://localhost:5001/api/check-in", { busStopId, people }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  
  export const getCheckIns = async (token) => {
    return axios.get("http://localhost:5001/api/check-ins", {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  
  export const getCheckInsByBusStop = async (token, stopId) => {
    return axios.get(`http://localhost:5001/api/check-ins/bus-stop/${stopId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  
  export const respondToCheckIn = async (token, checkInId, response) => {
    return axios.put(`http://localhost:5001/api/check-in/${checkInId}/respond`, { response }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

export const getCheckInStatus = async (checkInId) => {
  return axios.get(`http://localhost:5001/api/check-in/${checkInId}/status`);
};
