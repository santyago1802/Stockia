
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const pool = require("./db/pool");

const materialRoutes = require("./routes/material.routes");
const prestamoRoutes = require("./routes/prestamo.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const authRoutes = require("./routes/auth.routes");
const categoriaRoutes = require("./routes/categoria.routes");
const proveedorRoutes = require("./routes/proveedor.routes");
const movimientoRoutes = require("./routes/movimiento.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Middleware de autenticación (BUG-004)
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ mensaje: "Token requerido" });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
}

// Comprobar conexión con PostgreSQL (pública)
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      mensaje: "Backend y PostgreSQL conectados",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al conectar PostgreSQL",
    });
  }
});

// Rutas públicas
app.use("/api/login", authRoutes);

// Rutas protegidas con token
app.use("/api/usuarios", verificarToken, usuarioRoutes);
app.use("/api/materiales", verificarToken, materialRoutes);
app.use("/api/prestamos", verificarToken, prestamoRoutes);
app.use("/api/categorias", verificarToken, categoriaRoutes);
app.use("/api/proveedores", verificarToken, proveedorRoutes);

// Movimientos: autenticación y autorización dentro de movimiento.routes.js
app.use("/api/movimientos", movimientoRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend activo en http://localhost:${PORT}`);
});

module.exports = app;
