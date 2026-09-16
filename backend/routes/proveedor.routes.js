const express = require("express");

const {
  obtenerProveedores,
} = require("../controllers/proveedor.controller");

const router = express.Router();

// GET /api/proveedores
router.get("/", obtenerProveedores);

module.exports = router;