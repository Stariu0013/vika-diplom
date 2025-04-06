import React, {memo, useState} from 'react';
import {useInput} from "../../utils/useInput/useInput.js";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {FormControl, FormControlLabel, FormLabel, Input, InputLabel, Modal, Radio, RadioGroup} from "@mui/material";
import Typography from "@mui/material/Typography";
import {CONST_NAMES} from "../../consts/consts.js";

const PortfolioForm = memo(function PortfolioForm({addPortfolio}) {
    const portfolioNameInput = useInput("");
    const portfolioInitialInvestInput = useInput(0);
    const portfolioSelect = useInput(CONST_NAMES.MILITARY);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const portfolioName = portfolioNameInput.value;
        const portfolioInitialInvest = portfolioInitialInvestInput.value;
        const select = portfolioSelect.value;

        //todo: ADD VALIDATION

        addPortfolio({
            portfolioName,
            wallet: portfolioInitialInvest,
            type: select
        });

        portfolioNameInput.onChange("");
        portfolioSelect.onChange(CONST_NAMES.MILITARY);
        portfolioInitialInvestInput.onChange(0);

        closeModal();
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <Button
                    onClick={openModal}
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        boxShadow: 2, // Add a subtle shadow for a floating effect
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                        '&:active': {
                            transform: 'scale(0.98)', // Add a small "click" effect on button press
                        },
                    }}
                >
                    Створити портфрель
                </Button>
            </Box>


            <Modal
                open={isModalOpen}
                onClose={closeModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    bgcolor: 'background.paper',
                    borderRadius: '8px',
                    boxShadow: 24,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <form onSubmit={handleSubmit}>

                        <InputLabel htmlFor="name" sx={{ fontWeight: 'bold' }}>
                            <Typography variant="h6">Введіть назву портфеля</Typography>
                        </InputLabel>
                        <Input
                            name="name"
                            id="name"
                            {...portfolioNameInput}
                            placeholder="Введіть назву портфеля"
                            sx={{
                                mb: 2,
                                p: 1,
                                borderRadius: 2,
                                border: '1px solid #ccc',
                                '&:focus': { borderColor: 'primary.main' }
                            }}
                        />

                        <FormControl sx={{ mb: 2 }}>
                            <FormLabel id="demo-radio-buttons-group-label" sx={{ fontWeight: 'bold' }}>Кактегорія портфеля</FormLabel>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                defaultValue="military"
                                name="radio-buttons-group"
                                {...portfolioSelect}
                            >
                                <FormControlLabel value={CONST_NAMES.MILITARY} control={<Radio />} label="Військовий сектор" />
                                <FormControlLabel value={CONST_NAMES.CIVIL} control={<Radio />} label="Цивільне відновлення" />
                            </RadioGroup>
                        </FormControl>

                        <InputLabel htmlFor="price" sx={{ fontWeight: 'bold' }}>
                            <Typography variant="h6">Введіть початкову суму внеску</Typography>
                        </InputLabel>
                        <Input
                            type="number"
                            {...portfolioInitialInvestInput}
                            name="price"
                            id="price"
                            placeholder="Введіть початкову суму внеску"
                            sx={{
                                mb: 2,
                                p: 1,
                                borderRadius: 2,
                                border: '1px solid #ccc',
                                '&:focus': { borderColor: 'primary.main' }
                            }}
                        />

                        <Button
                            type="submit"
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' },
                                p: 1.5,
                                border: '1px solid transparent',
                                borderRadius: 2,
                                fontWeight: 'bold',
                            }}
                        >
                            Створити портфель
                        </Button>
                    </form>
                </Box>
            </Modal>
        </>
    );
});

export default PortfolioForm;