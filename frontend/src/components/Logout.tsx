import React from 'react'
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");

        sessionStorage.clear();

        navigate("/login", { replace: true });
    };
}

export default Logout