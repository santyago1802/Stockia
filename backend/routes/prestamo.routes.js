const express = require("express");

const {
  crearPrestamo,
  obtenerPrestamos,
  devolverPrestamo,
} = require("../controllers/prestamo.controller");

const router = express.Router();

// GET /api/prestamos
router.get("/", obtenerPrestamos);

// POST /api/prestamos
router.post("/", crearPrestamo);

// PUT /api/prestamos/:id/devolver
router.put("/:id/devolver", devolverPrestamo);

module.exports = router;