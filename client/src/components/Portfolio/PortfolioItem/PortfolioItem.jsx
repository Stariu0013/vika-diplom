import ActivesForm from "../../Actives/ActivesForm/ActivesForm.jsx";
import ActiveItems from "../../Actives/ActivesItems/ActiveItems.jsx";
import { usePortfolioItem } from "./usePortfolioItem.jsx";
import { Box, Typography } from "@mui/material";

const PortfolioItem = () => {
    const {
        activeItems,
        portfolioSum,
        dateCreated,
        type,
        error,
        portfolioName,
        selectedActives,
        setSelectedActives,
        deleteActiveItem,
        addActiveItems,
    } = usePortfolioItem();

    if (error) {
        return (
            <Typography color="error" variant="body1">
                Error: {error.message || "Something went wrong. Please try again later."}
            </Typography>
        );
    }

    return (
        <Box sx={{ padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
            <ActivesForm
                type={type}
                portfolioSum={portfolioSum}
                addActiveItems={addActiveItems}
            />
            <Typography variant="h4" gutterBottom>
                Назва портфелю: {portfolioName}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Баланс: {portfolioSum?.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Дата створення - {new Date(dateCreated).toLocaleDateString()}
            </Typography>
            <ActiveItems
                selectedActives={selectedActives}
                setSelectedActives={setSelectedActives}
                deleteActiveItem={deleteActiveItem}
                items={activeItems}
            />
        </Box>
    );
};

export default PortfolioItem;