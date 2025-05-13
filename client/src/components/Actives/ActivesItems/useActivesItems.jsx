import { useState } from "react";
import axiosInstance from "../../../helpers/axios.js";
import {toast} from "react-toastify";

const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Назва", width: 300 },
    { field: "activeCount", headerName: "Кількість активів", width: 250 },
    { field: "price", headerName: "Ціна", type: "number", width: 90 },
    {
        field: "volatility",
        headerName: "Дохідність",
        description: "This column has a value getter and is not sortable.",
        sortable: false,
        width: 160,
        valueGetter: (value, row) => `${row.volatility.toFixed(2)}`,
    },
    { field: "riskScore", headerName: "Ризик", width: 130 },
];

const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: "right" },
        title: { display: true, text: "Active Items Distribution" },
    },
};

const chartDataTemplate = (items) => {
    return {
        labels: items.map((item) => item.name),
        datasets: [
            {
                data: items?.map((item) => item.activeCount),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
            },
        ],
    }
};

const scatterChartOptions = {
    responsive: true,
    plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
            callbacks: {
                label: (context) =>
                    `Risk: ${context.raw.x.toFixed(4)}, Return: ${context.raw.y.toFixed(4)}`,
            },
        },
    },
    scales: {
        x: { title: { display: true, text: "Portfolio Risk (Standard Deviation)" } },
        y: { title: { display: true, text: "Portfolio Expected Return" } },
    },
};

const weightComparisonOptions = {
    responsive: true,
    plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Weight Comparison: Initial vs Optimized" },
    },
    scales: {
        y: { beginAtZero: true, max: 1, title: { display: true, text: "Weight Value" } },
        x: { title: { display: true, text: "Assets" } },
    },
};

const createWeightComparisonData = (labels, initial, optimized) => ({
    labels,
    datasets: [
        {
            label: "Initial Weights",
            data: initial?.map((w) => w.weight),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
        },
        {
            label: "Optimized Weights",
            data: optimized?.map((w) => w.weight),
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            fill: true,
        },
    ],
});

const processOptimizationResponse = (data) => {
    const { optimizedWeights, initialWeights, frontier, finalStd, finalReturn, doughnutChartData } = data;
    return {
        optimizedWeights,
        initialWeights,
        doughnutChartData,
        chartOptimizationData: {
            datasets: [
                {
                    label: "Efficient Frontier",
                    data: frontier?.map((p) => ({ x: p.risk, y: p.return })),
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                    showLine: true,
                    tension: 0.1,
                    pointRadius: 4,
                },
                {
                    label: "Optimal Portfolio",
                    data: [{ x: finalStd, y: finalReturn }],
                    backgroundColor: "rgba(255, 99, 132, 1)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    pointRadius: 7,
                },
            ],
        },
    };
};

export const useActivesItems = ({ items }) => {
    const [chartComparisonInitialData, setChartComparisonInitialData] = useState([]);
    const [chartComparisonOptimizedData, setChartComparisonOptimizedData] = useState([]);
    const [chartOptimizationData, setChartOptimizationData] = useState(null);
    const [doughnutChartOptimizedData, setDoughnutChartOptimizedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(items?.volatility?.[0] || 0);

    let minVolatility = 0;
    let maxVolatility = 0;

    if (items?.length > 0) {
        minVolatility = items[0].volatility;
        maxVolatility = items[0].volatility;

        items.forEach(item => {
            minVolatility = Math.min(minVolatility, item.volatility);
            maxVolatility = Math.max(maxVolatility, item.volatility);

            minVolatility = minVolatility.toFixed(3);
            maxVolatility = maxVolatility.toFixed(3);
        });
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleOptimizeClick = () => {
        if (inputValue > minVolatility && inputValue < maxVolatility) {
            optimizePortfolio(inputValue);
            handleClose();
        } else {
            toast.error(`Volatility must be between ${minVolatility} and ${maxVolatility}`);
        }
    };

    const optimizePortfolio = async (inputValue) => {
        if (items.length < 2) {
            toast.error("Portfolio must contain at least 2 items");

            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                "https://vika-diplom-api.onrender.com/api/stocks/optimize",
                {
                    targetReturn: inputValue,
                    stocks: items,
                }
            );
            if (response.status === 200) {
                const result = processOptimizationResponse(response.data);

                setChartComparisonInitialData(result.initialWeights);
                setChartComparisonOptimizedData(result.optimizedWeights);
                setChartOptimizationData(result.chartOptimizationData);
                setDoughnutChartOptimizedData(result.doughnutChartData);
            } else {
                throw new Error(response.data.error || "Optimization failed");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const lineChartData = createWeightComparisonData(
        items?.map((item) => item.name),
        chartComparisonInitialData,
        chartComparisonOptimizedData
    );

    const doughnutChartOptimizedPercentsData = {
        labels: items?.map((item) => item?.name),
        datasets: [{
            label: 'Відсоток',
            data: chartComparisonOptimizedData?.map((item) => item?.weight * 100),
            backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
            ],
            hoverOffset: 4
        }],
        scales: {
            x: { title: { display: true, text: "Test" } },
        },
    }

    return {
        lineChartData,
        error,
        loading,
        scatterChartOptions,
        weightComparisonOptions,
        chartComparisonOptimizedData,
        chartComparisonInitialData,
        defaultChartOptions,
        chartOptimizationData,
        columns,
        doughnutChartOptimizedData,
        open,
        doughnutChartOptimizedPercentsData,
        inputValue,
        maxVolatility,
        minVolatility,
        handleOptimizeClick,
        setInputValue,
        handleOpen,
        handleClose,
        optimizePortfolio,
        chartDataTemplate,
    };
};