const express = require("express");

const {
  iniciarSesion,
} = require("../controllers/auth.controller");

const router = express.Router();

// POST /api/login
router.post("/", iniciarSesion);

module.exports = router;