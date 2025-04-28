import {Button, Grid, Paper} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {Doughnut, Line, Scatter} from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    LinearScale,
    PointElement,
    LineElement,
    CategoryScale,
} from "chart.js";
import axios from "axios";
import {useState} from "react";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    LinearScale,
    PointElement,
    LineElement,
    CategoryScale
);

const columns = [
    {field: "id", headerName: "ID", width: 70},
    {field: "name", headerName: "Назва", width: 300},
    {field: "activeCount", headerName: "Кількість активів", width: 250},
    {field: "price", headerName: "Ціна", type: "number", width: 90},
    {
        field: "volatility",
        headerName: "Дохідність",
        description: "This column has a value getter and is not sortable.",
        sortable: false,
        width: 160,
    },
    {field: "riskScore", headerName: "Ризик", width: 130},
];

const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {position: "right"},
        title: {display: true, text: "Active Items Distribution"},
    },
};

const chartDataTemplate = (items) => ({
    labels: items.map((item) => item.name),
    datasets: [
        {
            data: items.map((item) => item.activeCount),
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
});

const scatterChartOptions = {
    responsive: true,
    plugins: {
        legend: {display: true, position: "top"},
        tooltip: {
            callbacks: {
                label: (context) =>
                    `Risk: ${context.raw.x.toFixed(4)}, Return: ${context.raw.y.toFixed(4)}`,
            },
        },
    },
    scales: {
        x: {title: {display: true, text: "Portfolio Risk (Standard Deviation)"}},
        y: {title: {display: true, text: "Portfolio Expected Return"}},
    },
};

const weightComparisonOptions = {
    responsive: true,
    plugins: {
        legend: {position: "top"},
        title: {display: true, text: "Weight Comparison: Initial vs Optimized"},
    },
    scales: {
        y: {beginAtZero: true, max: 1, title: {display: true, text: "Weight Value"}},
        x: {title: {display: true, text: "Assets"}},
    },
};

const createWeightComparisonData = (labels, initial, optimized) => ({
    labels,
    datasets: [
        {
            label: "Initial Weights",
            data: initial.map((w) => w.weight),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
        },
        {
            label: "Optimized Weights",
            data: optimized.map((w) => w.weight),
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            fill: true,
        },
    ],
});

const processOptimizationResponse = (data) => {
    const {optimizedWeights, initialWeights, frontier, finalStd, finalReturn} = data;
    return {
        optimizedWeights,
        initialWeights,
        chartOptimizationData: {
            datasets: [
                {
                    label: "Efficient Frontier",
                    data: frontier.map((p) => ({x: p.risk, y: p.return})),
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                    showLine: true,
                    tension: 0.1,
                    pointRadius: 4,
                },
                {
                    label: "Optimal Portfolio",
                    data: [{x: finalStd, y: finalReturn}],
                    backgroundColor: "rgba(255, 99, 132, 1)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    pointRadius: 7,
                },
            ],
        },
    };
};

const ActiveItems = ({items}) => {
    const [chartComparisionInitialData, setChartComparisionInitialData] = useState([]);
    const [chartComparisionOptimizedData, setChartComparisionOptimizedData] = useState([]);
    const [chartOptimizationData, setChartOptimizationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const optimizePortfolio = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5125/api/stocks/optimize", {
                targetReturn: 0.02,
                stocks: items,
            });

            if (response.status === 200) {
                console.log(response);
                const result = processOptimizationResponse(response.data);
                setChartComparisionInitialData(result.initialWeights);
                setChartComparisionOptimizedData(result.optimizedWeights);
                setChartOptimizationData(result.chartOptimizationData);
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
        items.map((item) => item.name),
        chartComparisionInitialData,
        chartComparisionOptimizedData
    );

    console.log({
        lineChartData
    })

    return (
        <>
            <Paper sx={{height: 400, width: "100%", marginTop: 2}}>
                <DataGrid
                    rows={items}
                    columns={columns}
                    initialState={{pagination: {paginationModel: {page: 0, pageSize: 5}}}}
                    pageSizeOptions={[5, 10]}
                    sx={{border: 0}}
                />
            </Paper>
            <Paper sx={{height: 300, width: "100%", marginTop: 2, padding: 2}}>
                <Doughnut data={chartDataTemplate(items)} options={defaultChartOptions}/>
            </Paper>
            <Button variant="contained" onClick={optimizePortfolio} disabled={loading}>
                {loading ? "Optimizing..." : "Optimize Portfolio"}
            </Button>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                {chartComparisionOptimizedData.length > 0 && chartComparisionInitialData.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ height: 300, padding: 2 }}>
                            <Line
                                data={lineChartData}
                                options={{
                                    ...weightComparisonOptions,
                                    maintainAspectRatio: true,
                                    plugins: {
                                        ...weightComparisonOptions.plugins,
                                        legend: { position: "top", labels: { font: { size: 12 } } },
                                    },
                                }}
                            />
                        </Paper>
                    </Grid>
                )}
                {chartOptimizationData && (
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ height: 300, padding: 2 }}>
                            <Scatter
                                data={chartOptimizationData}
                                options={{
                                    ...scatterChartOptions,
                                    maintainAspectRatio: true,
                                    plugins: {
                                        ...scatterChartOptions.plugins,
                                        legend: { position: "right", labels: { font: { size: 12 } } },
                                    },
                                    scales: {
                                        x: {
                                            ...scatterChartOptions.scales.x,
                                            title: { ...scatterChartOptions.scales.x.title, font: { size: 12 } },
                                        },
                                        y: {
                                            ...scatterChartOptions.scales.y,
                                            title: { ...scatterChartOptions.scales.y.title, font: { size: 12 } },
                                        },
                                    },
                                }}
                            />
                        </Paper>
                    </Grid>
                )}
            </Grid>


            {error && <p style={{color: "red"}}>Error: {error}</p>}
        </>
    );
};

export default ActiveItems;