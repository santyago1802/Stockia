
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Devoluciones from "../pages/Devoluciones";
import Usuarios from "../pages/Usuarios";
import Productos from "../pages/Productos";
import Homepages from "../pages/Homepages";
import ProtectedRoute from "./ProtectedRoute";
import Movimientos from "../pages/Movimientos";
import Perfil from "../pages/Perfil";

function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>

        {/* Inicio de sesión */}
        <Route path="/" element={<Login />} />

        {/* Dashboard: solo Coordinador */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute rolPermitido="Coordinador">
              <Homepages />
            </ProtectedRoute>
          }
        />

        {/* Usuarios: solo Coordinador */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute rolPermitido="Coordinador">
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Devoluciones: solo Instructor */}
        <Route
          path="/devoluciones"
          element={
            <ProtectedRoute rolPermitido="Instructor">
              <Devoluciones />
            </ProtectedRoute>
          }
        />

        {/* Materiales: ambos roles */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />

        {/* Movimientos: solo Coordinador */}
        <Route
          path="/movimientos"
          element={
            <ProtectedRoute rolPermitido="Coordinador">
              <Movimientos />
            </ProtectedRoute>
          }
        />

        {/* Mi perfil: Coordinador e Instructor */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
