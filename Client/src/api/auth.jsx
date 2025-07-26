import axios from "axios";

export const currentUser = async (token) => await axios.post('http://localhost:5001/api/current-user', {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})

export const getCurrentAdmin = async (token) => {
  return await axios.post("http://localhost:5001/api/current-admin", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCurrentDriver = async (token) => {
  return axios.post("http://localhost:5001/api/current-driver", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
