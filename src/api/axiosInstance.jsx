import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle 401 Unauthorized errors
//     if (error.response && error.response.status === 401) {
//       localStorage.clear();
//       window.location.href = "/login"; 
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;


// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });


// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default axiosInstance;
// axiosInstance.js