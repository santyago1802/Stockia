
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

// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log("PETICIÓN RECIBIDA:", req.method, req.url);
  next();
});

// ==========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ==========================================

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      mensaje: "Token requerido",
    });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
}

// ==========================================
// COMPROBAR CONEXIÓN CON POSTGRESQL
// ==========================================

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      mensaje: "Backend y PostgreSQL conectados",
    });
  } catch (error) {
    console.error("Error de conexión PostgreSQL:", error);

    res.status(500).json({
      mensaje: "Error al conectar PostgreSQL",
    });
  }
});

// ==========================================
// RUTAS PÚBLICAS
// ==========================================

app.use("/api/login", authRoutes);

// ==========================================
// RUTAS PROTEGIDAS
// ==========================================

app.use("/api/usuarios", verificarToken, usuarioRoutes);
app.use("/api/materiales", verificarToken, materialRoutes);
app.use("/api/prestamos", verificarToken, prestamoRoutes);
app.use("/api/categorias", verificarToken, categoriaRoutes);
app.use("/api/proveedores", verificarToken, proveedorRoutes);

// ==========================================
// MOVIMIENTOS
// ==========================================

app.use("/api/movimientos", movimientoRoutes);

// ==========================================
// MANEJO DE JSON INVÁLIDO
// ==========================================

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      mensaje: "El formato del JSON enviado no es válido",
    });
  }

  next(error);
});

// ==========================================
// EXPORTAR APLICACIÓN
// ==========================================

module.exports = app;
