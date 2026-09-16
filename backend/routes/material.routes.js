const express = require("express");

const {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
} = require("../controllers/material.controller");

const router = express.Router();

// GET /api/materiales
router.get("/", obtenerMateriales);

// POST /api/materiales
router.post("/", crearMaterial);

// PUT /api/materiales/:id
router.put("/:id", actualizarMaterial);

module.exports = router;