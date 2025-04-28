import {memo, useEffect, useMemo, useState} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
    FormControl,
    Input,
    InputLabel,
    Modal,
    Select
} from "@mui/material";

import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import {useInput} from "../../utils/useInput/useInput.js";

const ActivesForm = memo(function PortfolioForm({ type, portfolioSum, addActiveItems }) {
    const activeCount = useInput(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activesData, setActivesData] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5125/api/stocks/${type}`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setActivesData(data);
                    setSelectedSymbol(Object.keys(data)[0]);
                }
            }).catch(err => console.error("Failed to fetch sectors:", err));
    }, []);

    const selectedActiveNewestDataIndex = activesData[selectedSymbol]?.data.length - 1;
    const selectedActiveData = activesData[selectedSymbol]?.data[selectedActiveNewestDataIndex];

    const {
        volatility,
        open: price,
        riskScore,
        expectedReturn,
        dailyReturns
    } = selectedActiveData || {};

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

        const data = {
            activeCount: Number(activeCount.value),
            riskScore,
            volatility,
            name: selectedSymbol,
            price,
            dailyReturns,
            expectedReturn,
            id: Math.random().toString(36).substr(2, 10)
        };

        addActiveItems(data);
        setSelectedSymbol(Object.keys(activesData)[0]);

        closeModal();
    };

    const maxActivesCountNode = maxActivesToBuy <= Number(activeCount.value)
        ?
        <Box sx={{
            color: 'warning.dark',
            backgroundColor: 'rgba(255, 165, 0, 0.1)', // Lightened orange background
            border: '1px solid',
            borderColor: 'warning.dark',
            padding: 1,
            marginBottom: 2,
            borderRadius: 1
        }}>
            Максимум доступних акцій - {maxActivesToBuy}
        </Box>
        : '';

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <Button sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                    boxShadow: 2,
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    '&:active': {
                        transform: 'scale(0.98)',
                    },
                }} onClick={openModal}>Додати актив</Button>
            </Box>

            <Modal
                open={isModalOpen}
                onClose={closeModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '400px',
                        bgcolor: 'background.paper',
                        borderRadius: '10px',
                        boxShadow: 24,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        outline: 'none',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Назва активу</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedSymbol}
                                label="Назва активу"
                                onChange={handleSelectChange}
                                sx={{
                                    marginBottom: 2,
                                    '& .MuiSelect-select': {
                                        padding: '12px 14px',
                                        borderRadius: 2,
                                        border: '1px solid #ccc',
                                        '&:hover': {
                                            borderColor: '#007BFF',
                                        },
                                    },
                                }}
                            >
                                {Object.keys(activesData).map((item) => {
                                    return <MenuItem value={item} key={item}>
                                        {item}
                                    </MenuItem>
                                })}
                            </Select>
                        </FormControl>

                        <Box sx={{
                            margin: '5px 0 10px',
                        }}>
                            Ціна - {price}
                        </Box>

                        <Box sx={{
                            margin: '10px 0',
                        }}>
                            Волатильність - {volatility?.toFixed(3)}
                        </Box>

                        <Box sx={{
                            margin: '10px 0',
                        }}>
                            Дохідність - {expectedReturn?.toFixed(2)} %
                        </Box>

                        <InputLabel htmlFor="price">
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Кількість активів
                            </Typography>
                        </InputLabel>
                        <Input
                            type="number"
                            {...activeCount}
                            name="price"
                            id="price"
                            inputProps={{
                                max: maxActivesToBuy,
                                min: 0,
                            }}
                            placeholder="Введіть суму інвестицій"
                            sx={{
                                marginBottom: 3,
                                padding: 1.5,
                                width: '100%',
                                borderRadius: 2,
                                border: '1px solid #ccc',
                                '&:hover': {
                                    borderColor: '#007BFF',
                                },
                            }}
                        />

                        {maxActivesCountNode}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{
                                display: 'block',
                                padding: '10px 20px',
                                borderRadius: 3,
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: '#0056b3',
                                },
                            }}
                        >
                            Додати
                        </Button>
                    </form>
                </Box>
            </Modal>

        </>
    );
});

export default ActivesForm;
