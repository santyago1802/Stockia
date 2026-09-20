const express = require("express");

const verificarToken = require("../middleware/auth.middleware");

const {
  obtenerProveedores,
} = require("../controllers/proveedor.controller");

const router = express.Router();

// GET /api/proveedores
router.get("/", verificarToken, obtenerProveedores);

module.exports = router;