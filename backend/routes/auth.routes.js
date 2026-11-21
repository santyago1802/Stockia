const express = require("express");

const {
  iniciarSesion,
  recuperarPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

// POST /api/login
router.post("/", iniciarSesion);

// POST /api/login/recuperar-password
router.post("/recuperar-password", recuperarPassword);

module.exports = router;