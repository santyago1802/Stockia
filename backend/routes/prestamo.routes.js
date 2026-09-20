const express = require("express");
const verificarToken = require("../middleware/auth.middleware");


const {
  crearPrestamo,
  obtenerPrestamos,
  devolverPrestamo,
} = require("../controllers/prestamo.controller");

const router = express.Router();

// GET /api/prestamos
router.get("/", verificarToken, obtenerPrestamos);

// POST /api/prestamos
router.post("/", verificarToken, crearPrestamo);

// PUT /api/prestamos/:id/devolver
router.put("/:id/devolver", verificarToken, devolverPrestamo);

module.exports = router;