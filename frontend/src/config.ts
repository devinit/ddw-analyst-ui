import axios from 'axios';

const axiosConfig = axios.create({
  baseURL: process.env.BASE_URL,
});

export default axiosConfig;
