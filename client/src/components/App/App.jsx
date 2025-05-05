import '../../App.css';
import Navbar from "../Navbar/Navbar.jsx";
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import Footer from "../Footer/Footer.jsx";
import SettingsPage from "../../pages/SettingsPage/SettingsPage.jsx";
import MainPage from "../../pages/MainPage/MainPage.jsx";
import PortfolioItem from "../Portfolio/PortfolioItem/PortfolioItem.jsx";
import SignUpForm from "../../pages/AuthPage/SignUp/SignUpForm.jsx";
import SignInForm from "../../pages/AuthPage/SignIn/SignInForm.jsx";
import { Button, Typography } from "@mui/material";
import { useApp } from "./useApp.jsx";
import React from "react";
import {ToastContainer} from "react-toastify";

const MemoizedNavbar = React.memo(Navbar);
const MemoizedFooter = React.memo(Footer);
const AuthRoutes = React.memo(({ signIn, signUp, isSignUpPage, toggleAuthForm }) => (
    <>
        <Routes>
            <Route path="/" element={<SignInForm signIn={signIn} />} />
            <Route path="/signup" element={<SignUpForm signUp={signUp} />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Typography align="center">
            {isSignUpPage ? "Вже маєте аккаунт??" : "Немає аккаунту?"}{' '}
            <Button onClick={toggleAuthForm} color="primary">
                {isSignUpPage ? 'Логін' : 'Реєстрація'}
            </Button>
        </Typography>
    </>
));

const MainRoutes = React.memo(({ handleLogout }) => (
    <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage handleLogout={handleLogout}/>} />
        <Route path="/portfolio/:id" element={<PortfolioItem />} />
    </Routes>
));

function App() {
    const navigate = useNavigate();
    const { isAuth, isSignUpPage, signIn, signUp, toggleAuthForm, logout } = useApp();

    const handleLogout = () => {
        logout();

        const refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
        const token = JSON.parse(localStorage.getItem('accessToken'));

        if (!refreshToken && !token) {
            navigate('/');
        }
    }

    return (
        <>
            <ToastContainer />
            {isAuth && <MemoizedNavbar />}
            <main>
                {!isAuth ? (
                    <AuthRoutes
                        signIn={signIn}
                        signUp={signUp}
                        isSignUpPage={isSignUpPage}
                        toggleAuthForm={toggleAuthForm}
                    />
                ) : (
                    <MainRoutes handleLogout={handleLogout} />
                )}
            </main>
            {isAuth && <MemoizedFooter />}
        </>
    );
}

export default React.memo(App);