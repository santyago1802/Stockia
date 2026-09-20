const express = require("express");

const verificarToken = require("../middleware/auth.middleware");
const verificarRol = require("../middleware/rol.middleware");

const {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
} = require("../controllers/material.controller");

const router = express.Router();

// GET /api/materiales
// Coordinador e Instructor pueden consultar materiales
router.get("/", verificarToken, obtenerMateriales);

// POST /api/materiales
// Solo Coordinador puede registrar materiales
router.post(
  "/",
  verificarToken,
  verificarRol("Coordinador"),
  crearMaterial
);

// PUT /api/materiales/:id
// Solo Coordinador puede editar materiales
router.put(
  "/:id",
  verificarToken,
  verificarRol("Coordinador"),
  actualizarMaterial
);

module.exports = router;