import axios from "axios";

const api = axios.create({
    baseURL: "https://expense-tracker-8v57.onrender.com",
});
export default api;