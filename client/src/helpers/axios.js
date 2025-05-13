import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5125/api',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token stored');

                const response = await axios.post('http://localhost:5125/api/auth/refresh', {
                    refreshToken,
                });

                const { token, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', token);
                localStorage.setItem('refreshToken', newRefreshToken);

                error.config.headers.Authorization = `Bearer ${token}`;
                return axios(error.config);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;