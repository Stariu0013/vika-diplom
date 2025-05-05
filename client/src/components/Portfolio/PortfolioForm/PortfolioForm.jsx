import {memo} from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
    FormControl,
    FormControlLabel,
    FormLabel,
    Input,
    InputLabel,
    Modal,
    Radio,
    RadioGroup,
    Typography,
    CircularProgress
} from "@mui/material";
import {usePortfolioForm} from "./usePortfolioForm.jsx";

const PortfolioForm = memo(function PortfolioForm({addPortfolio}) {
    const {
        isModalOpen,
        portfolioNameInput,
        portfolioInitialInvestInput,
        portfolioSelect,
        sectors,
        error,
        loading,
        handleSubmit,
        openModal,
        closeModal,
    } = usePortfolioForm({addPortfolio});

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
                        marginBottom: '12px',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        boxShadow: 2,
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                        '&:active': {
                            transform: 'scale(0.98)',
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
                            <FormLabel id="demo-radio-buttons-group-label" sx={{ fontWeight: 'bold' }}>
                                Кактегорія портфеля
                            </FormLabel>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                defaultValue="military"
                                name="radio-buttons-group"
                                {...portfolioSelect}
                            >
                                {sectors.map((sector, i) => (
                                    <FormControlLabel
                                        value={sector}
                                        key={i}
                                        control={<Radio />}
                                        label={sector}
                                    />
                                ))}
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

                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        {error && (
                            <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>
                                {error}
                            </Typography>
                        )}

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
                            disabled={loading}
                        >
                            {loading ? 'Зачекайте...' : 'Створити портфель'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </>
    );
});

export default PortfolioForm;