import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
import {Route, Routes, useNavigate} from "react-router-dom";
import Footer from "./components/Footer/Footer.jsx";
import SettingsPage from "./pages/SettingsPage/SettingsPage.jsx";
import MainPage from "./pages/MainPage/MainPage.jsx";
import PortfolioItem from "./components/Portfolio/PortfolioItem.jsx";
import {useState} from "react";
import axios from "axios";
import SignUpForm from "./pages/AuthPage/SignUpForm.jsx";
import SignInForm from "./pages/AuthPage/SignInForm.jsx";
import {Button, Typography} from "@mui/material";

function App() {
    const [isAuth, setIsAuth] = useState(JSON.parse(localStorage.getItem('isAuth')) || false);
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();

    const signUp = (data) => {
        return axios.post("http://localhost:5125/api/auth/signup", data).then(res => {
            if(res.status === 201) {
                navigate('/');
            }
        });
    };
    const signIn = (data) => {
        return axios.post("http://localhost:5125/api/auth/signin", data).then(res => {
            if(res.status === 200) {
                setIsAuth(true);
                localStorage.setItem('userName', res.data.user.username);
            }
        });
    };

    const toggleAuthForms = () => {
        setIsSignUp(!isSignUp);

        if(!isSignUp){
            navigate("/signup");
        } else {
            navigate("/");
        }
    };

    return (
        <>
            {
                isAuth ? <Navbar/> : null
            }
            <main>
                {
                    !isAuth
                        ? (
                            <>
                                <Routes>
                                    <Route path="/" element={<SignInForm signIn={signIn} />}></Route>
                                    <Route path="/signup" element={<SignUpForm signUp={signUp} />}></Route>
                                </Routes>

                                <Typography align="center">
                                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                                    <Button onClick={toggleAuthForms} color="primary">
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </Button>
                                </Typography>
                            </>
                        )
                        : (
                            <Routes>
                                <Route path="/" element={<MainPage/>}></Route>
                                <Route path="/settings" element={<SettingsPage/>}></Route>
                                <Route path="/portfolio/:id" element={<PortfolioItem/>}></Route>
                            </Routes>
                        )

                }
            </main>

            {
                isAuth ? <Footer/> : null
            }
        </>
    )
}

export default App
