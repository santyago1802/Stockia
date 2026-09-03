import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Devoluciones from "../pages/Devoluciones";
import Usuarios from "../pages/Usuarios";
import Productos from "../pages/Productos";
import Homepages from "../pages/Homepages";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute rolPermitido="Coordinador">
              <Homepages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute rolPermitido="Coordinador">
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/devoluciones"
          element={
            <ProtectedRoute rolPermitido="Instructor">
              <Devoluciones />
            </ProtectedRoute>
          }
        />

        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;