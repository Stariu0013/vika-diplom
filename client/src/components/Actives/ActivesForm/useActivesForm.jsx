import {useInput} from "../../../utils/useInput/useInput.js";
import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../../helpers/axios.js";
import { toast } from 'react-toastify';

export const useActivesForm = ({type, portfolioSum, addActiveItems}) => {
    const activeCount = useInput(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const [activesData, setActivesData] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axiosInstance.get(`http://localhost:5125/api/stocks/${type}`)
            .then(res => {
                if (res.status === 200) {
                    const data = res.data;

                    setActivesData(data);
                    setSelectedSymbol(Object.keys(data)[0]);
                }
            })
            .catch(err => setError("Failed to fetch data"))
            .finally(() => setLoading(false));
    }, [type]);

    const selectedActiveNewestDataIndex =
        activesData[selectedSymbol]?.data?.length
            ? activesData[selectedSymbol].data.length - 1
            : 0;

    const selectedActiveData =
        activesData[selectedSymbol]?.data &&
        activesData[selectedSymbol]?.data[selectedActiveNewestDataIndex]
            ? activesData[selectedSymbol].data[selectedActiveNewestDataIndex]
            : {};

    const {
        volatility = 0,
        open: price = 0,
        riskScore = 0,
        expectedReturn = 0,
        dailyReturns = 0
    } = selectedActiveData;

    const maxActivesToBuy = useMemo(() => {
        return Math.floor(portfolioSum / price)
    }, [portfolioSum, price]);

    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        activeCount?.setDefaultValue();
        setIsModalOpen(false);
    };
    const handleSelectChange = (event) => {
        setSelectedSymbol(event.target.value);
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        if (Number(activeCount.value) < 1) {
            toast.error("Active quantity must be at least 1.");

            return;
        }
        if (
            volatility === 0
            && price === 0
            && riskScore === 0
            && expectedReturn === 0
            && dailyReturns === 0
        ) {
            toast.error("Active data is not available.");

            return;
        }

        const data = {
            activeCount: Number(activeCount.value),
            riskScore,
            volatility,
            name: selectedSymbol,
            price,
            dailyReturns,
            expectedReturn,
            // id: Math.random().toString(36).substr(2, 10)
        };

        addActiveItems(data);
        setSelectedSymbol(Object.keys(activesData)[0]);

        closeModal();
    };

    const removePortfolioItem = () => {
        const userConfirmation = confirm('Are you sure you want to remove this portfolio?');

        if (userConfirmation) {
            const id = JSON.parse(localStorage.getItem('selectedPortfolio'));

            axiosInstance.delete(`http://localhost:5125/api/portfolios/delete/${id}`).then(res => {
                if (res.status === 200) {
                    localStorage.removeItem('selectedPortfolio');
                    navigate('/');
                }
            })
        }
    };

    return {
        activesData,
        isModalOpen,
        activeCount,
        selectedSymbol,
        maxActivesToBuy,
        price,
        volatility,
        expectedReturn,
        openModal,
        closeModal,
        handleSubmit,
        handleSelectChange,
        removePortfolioItem,
        loading,
        error
    }
}