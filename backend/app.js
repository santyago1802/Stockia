require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./db/pool");

const materialRoutes = require("./routes/material.routes");
const prestamoRoutes = require("./routes/prestamo.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const authRoutes = require("./routes/auth.routes");
const categoriaRoutes = require("./routes/categoria.routes");
const proveedorRoutes = require("./routes/proveedor.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de la aplicación
app.use("/api/materiales", materialRoutes);
app.use("/api/prestamos", prestamoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/login", authRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/proveedores", proveedorRoutes);

// Comprobar conexión con PostgreSQL
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

// Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(
    `Backend activo en http://localhost:${process.env.PORT}`
  );
});