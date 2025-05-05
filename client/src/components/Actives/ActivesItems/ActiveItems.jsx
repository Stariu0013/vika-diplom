import React, {useMemo, useRef} from "react";
import {Button, Paper, CircularProgress, Box, Grid, Typography} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
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
import {useActivesItems} from "./useActivesItems.jsx";
import {ActivesItemsDoughnutChart} from "./ActivesItemsDoughnutChart.jsx";
import {ActiveItemsLineCharts} from "./ActiveItemsLineCharts.jsx";
import {Doughnut} from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    LinearScale,
    PointElement,
    LineElement,
    CategoryScale
);

const ActiveItems = ({items, selectedActives, deleteActiveItem, setSelectedActives}) => {
    const doughnutChartRef = useRef(null);

    const {
        error,
        lineChartData,
        loading,
        defaultChartOptions,
        scatterChartOptions,
        weightComparisonOptions,
        chartComparisonInitialData,
        chartComparisonOptimizedData,
        chartOptimizationData,
        columns,
        doughnutChartOptimizedData,
        doughnutChartOptimizedPercentsData,
        minVolatility,
        maxVolatility,
        inputValue,
        open,
        setInputValue,
        chartDataTemplate,
        handleClose,
        handleOpen,
        handleOptimizeClick,
    } = useActivesItems({items});

    const memoizedChartData = useMemo(
        () => doughnutChartOptimizedData && chartDataTemplate(doughnutChartOptimizedData),
        [chartDataTemplate, doughnutChartOptimizedData]
    );

    if (loading) {
        return (
            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <>
            <Button
                variant="contained"
                color="error"
                onClick={deleteActiveItem}
                disabled={selectedActives?.length === 0}
                sx={{
                    marginTop: 2,
                    visibility: selectedActives?.length === 0 ? "hidden" : "visible",
                }}
            >
                Delete Selected
            </Button>
            <Paper sx={{height: 400, width: "100%", marginTop: 2}}>
                <DataGrid
                    rows={items}
                    columns={columns}
                    initialState={{
                        pagination: {paginationModel: {page: 0, pageSize: 5}},
                    }}
                    pageSizeOptions={[5, 10]}
                    onRowSelectionModelChange={(newSelectionModel) => {
                        setSelectedActives(newSelectionModel);
                    }}
                    sx={{border: 0}}
                />
            </Paper>
            <ActivesItemsDoughnutChart
                doughnutChartRef={doughnutChartRef}
                items={items}
                handleClose={handleClose}
                handleOpen={handleOpen}
                handleOptimizeClick={handleOptimizeClick}
                open={open}
                inputValue={inputValue}
                minVolatility={minVolatility}
                maxVolatility={maxVolatility}
                setInputValue={setInputValue}
                chartDataTemplate={chartDataTemplate}
                defaultChartOptions={defaultChartOptions}
                loading={loading}
            />

            <ActiveItemsLineCharts
                chartComparisionInitialData={chartComparisonInitialData}
                lineChartData={lineChartData}
                chartComparisionOptimizedData={chartComparisonOptimizedData}
                weightComparisonOptions={weightComparisonOptions}
                chartOptimizationData={chartOptimizationData}
                scatterChartOptions={scatterChartOptions}
            />

            <Grid container spacing={2} sx={{marginTop: 2}}>
                <Grid item xs={12} lg={6}>
                    <Typography variant="h6" xs={{ textAlign: 'center'}}>Оптимальний перерозподіл балансу</Typography>
                    {
                        doughnutChartOptimizedData && <Paper sx={{height: 300, width: "100%", marginTop: 2, padding: 2}}>
                            <Doughnut data={memoizedChartData} options={defaultChartOptions}/>
                        </Paper>
                    }
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Typography variant="h6" xs={{ textAlign: 'center'}}>Оптимізовані ваги у відсотковому співвідношенні</Typography>
                    {
                        doughnutChartOptimizedPercentsData && <Paper sx={{height: 300, width: "100%", marginTop: 2, padding: 2}}>
                            <Doughnut data={doughnutChartOptimizedPercentsData} options={defaultChartOptions}/>
                        </Paper>
                    }
                </Grid>
            </Grid>

            {error && <p style={{color: "red"}}>Error: {error}</p>}
        </>
    );
};

export default ActiveItems;