import {useState} from "react";

export const useNavbar = () => {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const userName = localStorage.getItem('userName');

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return {
        anchorElNav,
        userName,
        handleOpenNavMenu,
        handleCloseNavMenu
    }
}