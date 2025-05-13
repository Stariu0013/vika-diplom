import { useEffect, useState } from "react";
import axiosInstance from "../../../helpers/axios.js";

export const usePortfolioItem = () => {
    const portfolioId = JSON.parse(localStorage.getItem("selectedPortfolio"));

    const [portfolioData, setPortfolioData] = useState(null);
    const [portfolioSum, setPortfolioSum] = useState(0);
    const [activeItems, setActiveItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedActives, setSelectedActives] = useState([]);

    const fetchData = async (url, onSuccess, onError) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(url);
            if (response.status === 200) {
                onSuccess(response.data);
                setError(null);
            } else {
                setError(onError);
            }
        } catch (err) {
            console.error(onError, err?.response?.data);
            setError(onError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(
            `http://localhost:5125/api/portfolios/${portfolioId}`,
            (data) => {
                setPortfolioData(data);
                setPortfolioSum(Number(data.wallet));
            },
            "Error fetching portfolio data."
        );

        fetchData(
            `http://localhost:5125/api/actives/${portfolioId}/actives`,
            setActiveItems,
            "Error fetching active items."
        );
    }, [portfolioId]);

    if (!portfolioData && !loading && !error) {
        return <h1>No portfolio selected</h1>;
    }

    const { portfolioName, dateCreated, type, id } = portfolioData || {};

    const updatePortfolioSum = (amount) => {
        setPortfolioSum((prev) => {
            const newSum = prev - amount;
            if (newSum >= 0) {
                const updatedPortfolio = { ...portfolioData, wallet: newSum };
                setPortfolioData(updatedPortfolio);
                return newSum;
            }
            return prev;
        });
    };

    const addActiveItems = (item) => {
        setLoading(true);
        const { price, activeCount } = item;
        const activesSum = price * activeCount;

        updatePortfolioSum(activesSum);

        axiosInstance
            .post(`http://localhost:5125/api/actives/${id}/actives/create`, item)
            .then((response) => {
                console.log("Active created:", response.data);
                setActiveItems((prevItems) => [...prevItems, response.data]);
            })
            .catch((error) => {
                console.error("Error creating active:", error?.response?.data);
                setError("Error creating active item.");
            }).finally(() => {
                setLoading(false);
            });
    };

    const deleteActiveItem = async () => {
        setLoading(true);

        try {
            const deleteRequests = selectedActives.map((activeId) =>
                axiosInstance.delete(
                    `http://localhost:5125/api/actives/${portfolioId}/actives/delete/${activeId}`
                )
            );

            const responses = await Promise.all(deleteRequests);

            const allSucceeded = responses.every((res) => res.status === 200);

            if (allSucceeded) {
                setActiveItems((prevItems) =>
                    prevItems.filter(
                        (item) => !selectedActives.includes(item.id)
                    )
                );

                setSelectedActives([]);
            } else {
                console.error("Failed to delete all selected actives.");
                setError("Error deleting some active items.");
            }
        } catch (error) {
            console.error(
                "Error deleting active items:",
                error?.response?.data || error.message
            );
            setError("Error deleting active items.");
        } finally {
            setLoading(false);
        }
    };


    return {
        activeItems,
        portfolioName,
        type,
        dateCreated,
        portfolioSum,
        loading,
        error,
        selectedActives,
        setSelectedActives,
        deleteActiveItem,
        updatePortfolioSum,
        addActiveItems,
    };
};