import { useEffect, useState } from "react";
import { useInput } from "../../../utils/useInput/useInput.js";
import { CONST_NAMES } from "../../../consts/consts.js";
import axiosInstance from "../../../helpers/axios.js";
import {toast} from "react-toastify";

export const usePortfolioForm = ({ addPortfolio }) => {
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const portfolioNameInput = useInput("");
    const portfolioInitialInvestInput = useInput(0);
    const portfolioSelect = useInput(sectors[0]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const portfolioName = portfolioNameInput.value;
        const portfolioInitialInvest = portfolioInitialInvestInput.value;
        const select = portfolioSelect.value;

        if (Number(portfolioInitialInvest) < 1) {
            toast.error("Portfolio balance must be at least 1.");
            return;
        }

        if (!portfolioName.length) {
            toast.error("Portfolio must have a name.");
            return;
        }

        addPortfolio({
            portfolioName,
            wallet: portfolioInitialInvest,
            type: select,
        });

        portfolioNameInput.onChange("");
        portfolioSelect.onChange(CONST_NAMES.MILITARY);
        portfolioInitialInvestInput.onChange(0);

        closeModal();
    };

    useEffect(() => {
        const fetchSectors = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get("http://localhost:5125/api/stocks/sectors");
                if (res.status === 200) {
                    setSectors(Object.keys(res.data));
                }
            } catch (err) {
                setError("Failed to fetch sectors. Please try again later.");
                console.error("Failed to fetch sectors:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSectors();
    }, []);

    return {
        isModalOpen,
        portfolioNameInput,
        portfolioSelect,
        portfolioInitialInvestInput,
        sectors,
        loading,
        error,
        openModal,
        closeModal,
        handleSubmit,
    };
};