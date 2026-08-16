require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ mensaje: "Backend y PostgreSQL conectados" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al conectar PostgreSQL" });
  }
});

app.get("/api/usuarios", async (_req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id_usuario, name_usuario, apellido_usuario, rol_usuario
        FROM usuario
        ORDER BY id_usuario`
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "No se pudieron consultar los usuarios" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend activo en http://localhost:${process.env.PORT}`);
});