import { Card, CardActionArea, CardContent, Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { usePortfolioItems } from "./usePortfolioItems.jsx";
import { memo, useCallback } from "react";

const PortfolioCard = memo(function PortfolioCard({ item, onItemClick }) {
    const { portfolioName, wallet, type, id } = item;

    return (
        <Grid item xs={12} md={6} lg={4} key={id}>
            <Card sx={{ maxWidth: 345 }} onClick={() => onItemClick(item)}>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {portfolioName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Тип портфелю: {type}
                        </Typography>
                        <Typography>
                            Баланс: {wallet.toFixed(2)}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    );
});

const PortfolioItems = memo(function PortfolioItems({ items }) {
    const { onItemClick } = usePortfolioItems({ items });

    const handleItemClick = useCallback(
        (item) => {
            onItemClick(item);
        },
        [onItemClick]
    );

    if (!items.length) {
        return <Typography>No items found.</Typography>;
    }

    return (
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            {items.map((item) => (
                <PortfolioCard
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                />
            ))}
        </Grid>
    );
});

export default PortfolioItems;