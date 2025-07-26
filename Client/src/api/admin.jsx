import axios from "axios";

export const getListAllUsers = async (token) => {
    // code body
    return axios.get("http://localhost:5001/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  
  export const changeUserStatus = async (token,value) => {
    // code body
    return axios.post("http://localhost:5001/api/change-status",value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  
  export const changeUserRole = async (token,value) => {
    // code body
    return axios.post("http://localhost:5001/api/change-role",value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };