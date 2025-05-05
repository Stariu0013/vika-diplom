import {useAuth} from "../../context/AuthProvide.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import {useState, useEffect, useMemo, useCallback} from "react";
import axiosInstance from "../../helpers/axios.js";

export const useApp = () => {
    const {logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsAuth(!!token);
    }, []);

    const signUp = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post("/auth/signup", data);
            if (response.status === 201) {
                navigate("/");
            }
        } catch (error) {
            console.error("Sign up error:", error.response?.data || error.message);
        }
    }, [navigate]);

    const signIn = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post("/auth/signin", data);

            if (response.status === 200) {
                const {token, refreshToken, username} = response.data;

                setIsAuth(true);
                localStorage.setItem("accessToken", token);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("userName", username);
            }
        } catch (error) {
            console.error("Sign in error:", error.response?.data || error.message);
        }
    }, []);

    const isSignUpPage = useMemo(() => location.pathname === "/signup", [location.pathname]);

    const toggleAuthForm = useCallback(() => {
        navigate(isSignUpPage ? "/" : "/signup");
    }, [navigate, isSignUpPage]);

    return {
        isAuth,
        signUp,
        signIn,
        logout,
        isSignUpPage,
        toggleAuthForm,
    };
};