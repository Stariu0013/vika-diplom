import React from 'react';
import {Card, CardActionArea, CardContent, Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import {CONST_NAMES} from "../../consts/consts.js";

const PortfolioItems = ({items}) => {
    const navigate = useNavigate();

    if (!items.length) {
        return <Typography>No items found.</Typography>;
    }

    const onItemClick = (item) => {
        localStorage.setItem(CONST_NAMES.PORTFOLIO, JSON.stringify(item));

        navigate(`/${CONST_NAMES.PORTFOLIO}/${item.id}`);
    };

    return (
        <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
            {
                items.map((item) => {
                    const {
                        portfolioName,
                        wallet,
                        type,
                        id
                    } = item;

                    return <Grid item xs={4} key={id}>
                        <Card sx={{maxWidth: 345}} onClick={() => onItemClick(item)}>
                            <CardActionArea>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {portfolioName}
                                    </Typography>
                                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                        Type: {type}
                                    </Typography>
                                    <Typography>
                                        Balance: {wallet}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                })
            }
        </Grid>
    );
};

export default PortfolioItems;