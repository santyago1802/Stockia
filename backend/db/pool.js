const path = require("path");

// Cargar el .env ubicado en la carpeta backend
require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

const { Pool } = require("pg");

// Verificar que las variables necesarias estén cargadas
const requiredVariables = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
];

const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
    throw new Error(
        `Faltan variables de entorno: ${missingVariables.join(", ")}`
    );
}

const isLocalHost =
    process.env.DB_HOST === "127.0.0.1" || process.env.DB_HOST === "localhost";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: isLocalHost ? false : { rejectUnauthorized: false },
});

module.exports = pool;