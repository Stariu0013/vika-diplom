import { useNavigate } from "react-router-dom";
import { CONST_NAMES } from "../../../consts/consts.js";

export const usePortfolioItems = () => {
    const navigate = useNavigate();

    const onItemClick = (item) => {
        localStorage.setItem('selectedPortfolio', JSON.stringify(item.id));
        navigate(`/${CONST_NAMES.PORTFOLIO}/${item.id}`);
    };

    return {
        onItemClick
    };
};