import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getBusStops } from "../src/api/bus-stop";
import { getDrivers } from "../src/api/user";

const maingobal = (set) => ({
  user: null,
  token: null,
  busstops: [],
  drivers: [],
  logout: () => {
    set({
      user: null,
      token: null,
    });
    localStorage.removeItem("SadStore");
  },
  actionLogin: async (form) => {
    const res = await axios.post("http://localhost:5001/api/login", form);
    set({
      user: res.data.payload,
      token: res.data.token,
    });
    return res;
  },
  getBusStops: async (token) => {
    try {
      const res = await getBusStops(token);
      set({busstops: res.data});
    }catch (err) {
      console.log(err);
    }
  },
  getDrivers: async (token) => {  
    try {
      const res = await getDrivers(token);
      set({ drivers: res.data });
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  },
});

const usePersist = {
  name: "SadStore",
  // storage: createJSONStorage(() => localStorage),
  storage: createJSONStorage(() => sessionStorage),
};
const useMaingobal = create(persist(maingobal, usePersist));

export default useMaingobal;
