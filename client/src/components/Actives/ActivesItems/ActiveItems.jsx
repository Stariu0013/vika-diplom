import React, {useMemo, useRef} from "react";
import {Button, Paper, CircularProgress, Box} from "@mui/material";
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

            {
                doughnutChartOptimizedData && <Paper sx={{height: 300, width: "100%", marginTop: 2, padding: 2}}>
                    <Doughnut ref={doughnutChartRef} data={memoizedChartData}
                              options={defaultChartOptions}/>
                </Paper>
            }

            {error && <p style={{color: "red"}}>Error: {error}</p>}
        </>
    );
};

export default ActiveItems;