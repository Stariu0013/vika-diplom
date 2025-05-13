import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../helpers/axios.js";

export const useMainPage = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateState = useCallback((updater) => {
        setLoading(true);
        setError(null);
        updater()
            .catch((error) => {
                setError(error.response?.data || error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const addPortfolio = useCallback(
        async (item) => {
            const newItem = {
                ...item,
                dateCreated: new Date(),
                actives: [],
            };

            updateState(async () => {
                const response = await axiosInstance.post(
                    "https://vika-diplom-api.onrender.com/api/portfolios/create",
                    newItem
                );

                setPortfolios((prevState) => [...prevState, response.data]);
            });
        },
        [updateState]
    );

    const removePortfolio = useCallback(
        (id) => {
            updateState(() =>
                axiosInstance.delete(
                    `https://vika-diplom-api.onrender.com/api/portfolios/${id}/delete`
                ).then(() => {
                    setPortfolios((prev) =>
                        prev.filter((portfolio) => portfolio.id !== id)
                    );
                })
            );
        },
        [updateState]
    );

    useEffect(() => {
        updateState(() =>
            axiosInstance.get("https://vika-diplom-api.onrender.com/api/portfolios/all").then((res) => {
                if (res.status === 200) {
                    setPortfolios(res.data);
                }
            })
        );
    }, [updateState]);

    return {
        portfolios,
        addPortfolio,
        removePortfolio,
        loading,
        error,
    };
};