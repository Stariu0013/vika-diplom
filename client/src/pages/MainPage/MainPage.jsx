import { useMainPage } from "./useMainPage.jsx";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import React, {Suspense} from "react";

const PortfolioForm = React.lazy(() =>
    import("../../components/Portfolio/PortfolioForm/PortfolioForm.jsx")
);
const PortfolioItems = React.lazy(() =>
    import("../../components/Portfolio/PortfolioItems/PortfolioItems.jsx")
);


const MainPage = () => {
    const {
        portfolios,
        addPortfolio,
        loading,
        error,
    } = useMainPage();

    const loadingComponent = React.useMemo(
        () => (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <CircularProgress />
                <Typography>Завантаження портфелів...</Typography>
            </div>
        ),
        []
    );

    const errorComponent = React.useMemo(
        () => (
            <Typography
                color="error"
                style={{ textAlign: "center", marginTop: "20px" }}
            >
                {error?.message || "An error occurred while fetching portfolios."}
            </Typography>
        ),
        [error]
    );

    if (loading) {
        return loadingComponent;
    }

    if (error) {
        return errorComponent;
    }

    return (
        <Suspense fallback={<CircularProgress />}>
            <div>
                <PortfolioForm addPortfolio={addPortfolio} />
                <PortfolioItems items={portfolios} />
            </div>
        </Suspense>

    );
};

export default MainPage;