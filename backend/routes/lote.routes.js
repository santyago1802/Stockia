
const express = require("express");

const verificarToken = require("../middleware/auth.middleware");
const verificarRol = require("../middleware/rol.middleware");

const loteController = require("../controllers/lote.controller");

const router = express.Router();

// ==========================================
// CONSULTAR LOTES DE UN MATERIAL
// Coordinador e Instructor
// ==========================================

router.get(
  "/material/:id_material",
  verificarToken,
  loteController.obtenerLotesPorMaterial
);

// ==========================================
// BUSCAR POR CÓDIGO QR O DE BARRAS
// Coordinador e Instructor
// ==========================================

router.get(
  "/codigo/:codigo_producto",
  verificarToken,
  loteController.buscarLotesPorCodigo
);

// ==========================================
// REGISTRAR LOTE
// Solo Coordinador
// ==========================================

router.post(
  "/",
  verificarToken,
  verificarRol("Coordinador"),
  loteController.crearLote
);

module.exports = router;
