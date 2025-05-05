import {Grid, Paper} from "@mui/material";
import {Line, Scatter} from "react-chartjs-2";

export const ActiveItemsLineCharts = ({
                                          chartComparisionOptimizedData,
                                          chartComparisionInitialData,
                                          lineChartData,
                                          weightComparisonOptions,
                                          chartOptimizationData,
                                          scatterChartOptions
                                      }) => {
    return (
        <Grid container spacing={2} sx={{marginTop: 2}}>
            {chartComparisionOptimizedData.length > 0 && chartComparisionInitialData.length > 0 && (
                <Grid item xs={12} md={6}>
                    <Paper sx={{height: 300, padding: 2}}>
                        <Line
                            data={lineChartData}
                            options={{
                                ...weightComparisonOptions,
                                maintainAspectRatio: true,
                                plugins: {
                                    ...weightComparisonOptions.plugins,
                                    legend: {position: "top", labels: {font: {size: 12}}},
                                },
                            }}
                        />
                    </Paper>
                </Grid>
            )}
            {chartOptimizationData && (
                <Grid item xs={12} md={6}>
                    <Paper sx={{height: 300, padding: 2}}>
                        <Scatter
                            data={chartOptimizationData}
                            options={{
                                ...scatterChartOptions,
                                maintainAspectRatio: true,
                                plugins: {
                                    ...scatterChartOptions.plugins,
                                    legend: {position: "right", labels: {font: {size: 12}}},
                                },
                                scales: {
                                    x: {
                                        ...scatterChartOptions.scales.x,
                                        title: {...scatterChartOptions.scales.x.title, font: {size: 12}},
                                    },
                                    y: {
                                        ...scatterChartOptions.scales.y,
                                        title: {...scatterChartOptions.scales.y.title, font: {size: 12}},
                                    },
                                },
                            }}
                        />
                    </Paper>
                </Grid>
            )}
        </Grid>
    )
}