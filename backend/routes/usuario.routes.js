
const express = require("express");

const verificarRol = require("../middleware/rol.middleware");
const verificarToken = require("../middleware/auth.middleware");

const {
  obtenerUsuarios,
  crearUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasena,
} = require("../controllers/usuario.controller");

const router = express.Router();

// ==========================================
// ADMINISTRACIÓN DE USUARIOS
// ==========================================

// Consultar usuarios: solo Coordinador
router.get(
  "/",
  verificarRol("Coordinador"),
  obtenerUsuarios
);

// Crear usuarios: solo Coordinador
router.post(
  "/",
  verificarRol("Coordinador"),
  crearUsuario
);

// ==========================================
// MI PERFIL
// ==========================================

// Consultar perfil: Coordinador e Instructor
router.get(
  "/perfil",
  verificarToken,
  obtenerPerfil
);

// Actualizar nombre, apellido y correo
router.put(
  "/perfil",
  verificarToken,
  actualizarPerfil
);

// Cambiar contraseña
router.put(
  "/perfil/contrasena",
  verificarToken,
  cambiarContrasena
);

module.exports = router;
