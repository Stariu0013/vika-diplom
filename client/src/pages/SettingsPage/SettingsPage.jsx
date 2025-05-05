import React from "react";
import {Box, Typography, Button} from "@mui/material";

const SettingsPage = ({handleLogout}) => {
    const username = localStorage.getItem("userName");

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "background.default",
                padding: 2,
            }}
        >
            <Typography variant="h4" component="h2" gutterBottom>
                {username}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleLogout}
                sx={{mt: 2}}
            >
                Logout
            </Button>
        </Box>
    );
};

export default SettingsPage;