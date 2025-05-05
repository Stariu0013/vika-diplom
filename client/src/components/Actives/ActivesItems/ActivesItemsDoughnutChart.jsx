import {Button, Paper, Modal, Box, TextField, Typography} from "@mui/material";
import {Doughnut} from "react-chartjs-2";
import {useMemo} from "react";

const exportChart = (chartRef, fileName) => {
    if (chartRef) {
        const imageURL = chartRef.toBase64Image();
        const link = document.createElement("a");
        link.href = imageURL;
        link.download = `${fileName}.png`;
        link.click();
    } else {
        console.error("Chart reference is null or undefined");
    }
};

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

export const ActivesItemsDoughnutChart = ({
                                              items,
                                              doughnutChartRef,
                                              chartDataTemplate,
                                              defaultChartOptions,
                                              handleClose,
                                              handleOpen,
                                              handleOptimizeClick,
                                              open,
                                              inputValue,
                                              maxVolatility,
                                              minVolatility,
                                              setInputValue,
                                              loading,
                                          }) => {
    const memoizedChartData = useMemo(() => {
        return items && chartDataTemplate(items)
    }, [chartDataTemplate, items]);

    return items?.length === 0 ? null : (
        <>
            <Paper sx={{height: 300, width: "100%", marginTop: 2, padding: 2}}>
                {
                    memoizedChartData && <Doughnut
                        ref={doughnutChartRef}
                        data={memoizedChartData}
                        options={defaultChartOptions}
                    />
                }
            </Paper>

            <Button
                variant="contained"
                sx={{mt: 2, mr: 2}}
                onClick={handleOpen}
            >
                Модальне вікно для оптимізації
            </Button>

            <Button
                variant="contained"
                sx={{mt: 2}}
                onClick={() => exportChart(doughnutChartRef?.current, "DoughnutChart")}
            >
                Експортувати графік
            </Button>

            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    <h2>Очікувана дохідність</h2>
                    <TextField
                        type="number"
                        label="Volatility"
                        value={inputValue}
                        onChange={(e) => setInputValue(Number(e.target.value))}
                        InputProps={{
                            inputProps: {
                                min: minVolatility * 100,
                                max: maxVolatility * 100,
                                step: 0.01,
                            },
                        }}
                        fullWidth
                        sx={{mb: 2, mt: 2}}
                    />

                    <Typography variant="h6">
                        Мінімальне значення - {minVolatility}
                    </Typography>
                    <Typography variant="h6">
                        Максимальне значення - {maxVolatility}
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleOptimizeClick}
                        disabled={loading}
                    >
                        {loading ? "Оптимізація..." : "Оптимізувати портфель"}
                    </Button>
                </Box>
            </Modal>
        </>
    );
};