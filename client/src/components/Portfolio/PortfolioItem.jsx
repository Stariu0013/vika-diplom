import {useEffect, useState} from 'react';
import ActivesForm from "../Actives/ActivesForm.jsx";
import ActiveItems from "../Actives/ActiveItems.jsx";
import {CONST_NAMES} from "../../consts/consts.js";

const PortfolioItem = () => {
    const portfolioData = JSON.parse(localStorage.getItem(CONST_NAMES.PORTFOLIO));
    const {
        portfolioName,
        wallet,
        dateCreated,
        type,
        id
    } = portfolioData;

    const [portfolioSum, setPortfolioSum] = useState(Number(wallet));
    const [activeItems, setActiveItems] = useState(JSON.parse(localStorage.getItem(`actives-${id}`)) || []);

    const addActiveItems = (item) => {
        const {
            price,
            activeCount
        } = item;

        const activesSum = price * activeCount;

        buyActives(activesSum);

        setActiveItems([...activeItems, item]);
    };
    const buyActives = (activesSum) => {
        setPortfolioSum(prevState => {
            if (prevState > activesSum) {
                const newSum = prevState - activesSum;

                const newPortfolioData = {
                    ...portfolioData,
                    wallet: newSum
                };

                const allPortfolios = JSON.parse(localStorage.getItem(CONST_NAMES.PORTFOLIOS));
                const newPortfolios = allPortfolios.map(el => {
                    if (el.id === newPortfolioData.id) {
                        el = newPortfolioData;
                    }

                    return el;
                });
                localStorage.setItem(CONST_NAMES.PORTFOLIOS, JSON.stringify(newPortfolios));
                localStorage.setItem(CONST_NAMES.PORTFOLIO, JSON.stringify(newPortfolioData));

                return newSum;
            }
        });
    };

    useEffect(() => {
        localStorage.setItem(`actives-${id}`, JSON.stringify(activeItems));
    }, [activeItems]);

    return (
        <div>
            <ActivesForm type={type} portfolioSum={portfolioSum} addActiveItems={addActiveItems}/>
            <h1>NAME : {portfolioName}</h1>
            <p>Balance: {portfolioSum}</p>
            <p>Creation date - {new Date(dateCreated).toLocaleDateString()}</p>

            <ActiveItems items={activeItems}/>
        </div>
    );
};

export default PortfolioItem;