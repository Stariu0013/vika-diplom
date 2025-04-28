import PortfolioForm from "../../components/Portfolio/PortfolioForm.jsx";
import {useCallback, useEffect, useState} from "react";
import PortfolioItems from "../../components/Portfolio/PortfolioItems.jsx";
import {CONST_NAMES} from "../../consts/consts.js";
import axios from "axios";

const MainPage = () => {
    const [portfolios, setPortfolios] = useState(JSON.parse(localStorage.getItem(CONST_NAMES.PORTFOLIOS)) || []);

    const addPortfolio = useCallback((item) => {
        const newItem = {
            ...item,
            dateCreated: new Date(),
            actives: [],
            id: Math.random().toString(36).substr(2, 10)
        }

        setPortfolios(prevState => [...prevState, newItem]);
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5125/api/portfolios/all').then(res => {
            console.log(res);
        })
    });

    useEffect(() => {
        localStorage.setItem(CONST_NAMES.PORTFOLIOS, JSON.stringify(portfolios));
    }, [portfolios]);

    return (
        <div>
            <PortfolioForm addPortfolio={addPortfolio}/>
            <PortfolioItems items={portfolios}/>
        </div>
    );
};

export default MainPage;