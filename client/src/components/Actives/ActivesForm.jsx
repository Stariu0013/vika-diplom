import React, {memo, useMemo, useState} from "react";
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
import {activesData} from "../../data/actives.js";

const getRiskStyles = (riskLevel) => {
    switch (riskLevel) {
        case 'low':
            return {
                backgroundColor: 'green',
                color: 'white',
                borderRadius: 1,
                padding: 2,
                fontWeight: 'bold',
                textAlign: 'center',
            };
        case 'medium':
            return {
                backgroundColor: 'orange',
                color: 'white',
                borderRadius: 1,
                padding: 2,
                fontWeight: 'bold',
                textAlign: 'center',
            };
        case 'high':
            return {
                backgroundColor: 'red',
                color: 'white',
                borderRadius: 1,
                padding: 2,
                fontWeight: 'bold',
                textAlign: 'center',
            };
        default:
            return {
                backgroundColor: 'gray',
                color: 'white',
                borderRadius: 1,
                padding: 2,
                fontWeight: 'bold',
                textAlign: 'center',
            };
    }
};

const ActivesForm = memo(function PortfolioForm({ type, portfolioSum, addActiveItems }) {
    const activeCount = useInput(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentActiveIndex, setCurrentActiveIndex] = useState(0);

    const selectedActiveData = activesData[type][currentActiveIndex];
    const {
        name: activeSelectName,
        risk: activeSelectRisk,
        percents,
        price,
    } = selectedActiveData;

    const maxActivesToBuy = useMemo(() => {
        return Math.floor(portfolioSum / price)
    }, [currentActiveIndex]);

    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const handleSelectChange = (_, child) => {
        const index = child.props["data-index"]

        setCurrentActiveIndex(index);
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            activeCount: Number(activeCount.value),
            risk: activeSelectRisk,
            percents,
            name: activeSelectName,
            price,
            id: Math.random().toString(36).substr(2, 10)
        };

        addActiveItems(data);
        setCurrentActiveIndex(0);

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
                                value={activeSelectName}
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
                                {activesData[type].map((item, ind) => (
                                    <MenuItem data-index={ind} value={item.name} key={item.name}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{
                            margin: '5px 0 10px',
                        }}>
                            Ціна - {price}
                        </Box>

                        <Box sx={getRiskStyles(activeSelectRisk)}>
                            Risk: {activeSelectRisk}
                        </Box>

                        <Box sx={{
                            margin: '10px 0',
                        }}>
                            Дохідність - {percents}%
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

                        <InputLabel htmlFor="price">
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Очікувана дохідність
                            </Typography>
                        </InputLabel>
                        <Input
                            type="number"
                            name="price"
                            id="price"
                            inputProps={{
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
