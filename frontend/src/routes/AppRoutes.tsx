import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Productos from "../pages/Productos";

function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/productos" element={<Productos />} />
        </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;