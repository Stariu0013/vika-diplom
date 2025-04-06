import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
import {Route, Routes} from "react-router-dom";
import Footer from "./components/Footer/Footer.jsx";
import SettingsPage from "./pages/SettingsPage/SettingsPage.jsx";
import MainPage from "./pages/MainPage/MainPage.jsx";
import PortfolioItem from "./components/Portfolio/PortfolioItem.jsx";
import {useState} from "react";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";

function App() {
    const [isAuth, setIsAuth] = useState(JSON.parse(localStorage.getItem('isAuth')) || false);

    const auth = () => {
        setIsAuth(true);
        localStorage.setItem('isAuth', JSON.stringify(true));
    }

    return (
        <>
            <Navbar/>
            <main>
                {
                    !isAuth
                        ? (
                            <Routes>
                                <Route path="/" element={<AuthPage auth={auth}/>}></Route>
                            </Routes>
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

            <Footer/>
        </>
    )
}

export default App
