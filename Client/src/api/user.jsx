import axios from "axios";

export const getDrivers = async (token) => {
  return axios.get("http://localhost:5001/api/drivers", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
