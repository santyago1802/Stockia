
const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  iniciarSesion,
  solicitarRecuperacion,
  restablecerContrasena,
} = require("../controllers/auth.controller");

const router = express.Router();

// ==========================================
// LIMITADOR DE SOLICITUDES DE RECUPERACIÓN
// ==========================================

const limiteRecuperacion = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5, // Máximo 5 solicitudes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    mensaje:
      "Demasiadas solicitudes. Intenta nuevamente en 15 minutos.",
  },
});

// ==========================================
// INICIAR SESIÓN
// ==========================================

router.post("/", iniciarSesion);

// ==========================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ==========================================

router.post(
  "/forgot-password",
  limiteRecuperacion,
  solicitarRecuperacion
);

// ==========================================
// RESTABLECER CONTRASEÑA
// ==========================================

router.post(
  "/reset-password",
  limiteRecuperacion,
  restablecerContrasena
);

// ==========================================
// EXPORTAR RUTAS
// ==========================================

module.exports = router;
