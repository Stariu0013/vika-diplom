import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isCheckingToken, setIsCheckingToken] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp < currentTime) {
                        await handleTokenRefresh();
                    } else {
                        setUser(decodedToken.user);
                    }
                } catch (err) {
                    console.error('Invalid token:', err);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setIsCheckingToken(false);
        };

        initializeAuth();
    }, []);

    const handleTokenRefresh = async () => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            logout();
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post('http://localhost:5125/api/auth/refresh-token', {
                refreshToken,
            });

            const { token, refreshToken: newRefreshToken, user } = response.data;

            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', newRefreshToken);
            setUser(user);
        } catch (err) {
            console.error('Failed to refresh token:', err);
            logout();
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    if (isCheckingToken) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, setUser, logout, handleTokenRefresh }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);