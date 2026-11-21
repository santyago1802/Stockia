const authService = require("../services/auth.service");

// Iniciar sesión
const iniciarSesion = async (req, res) => {
  try {
    const { documento, contrasena } = req.body || {};

    if (!documento || !contrasena) {
      return res.status(400).json({
        mensaje: "Documento y contraseña son obligatorios",
      });
    }

    const resultado = await authService.iniciarSesion(
      documento,
      contrasena
    );

    res.json({
      mensaje: "Login exitoso",
      token: resultado.token,
      usuario: resultado.usuario,
    });
  } catch (error) {
    console.error("Error en login:", error);

    res.status(error.status || 500).json({
      mensaje: error.message || "Error interno del servidor",
    });
  }
};

// Recuperar contraseña
const recuperarPassword = async (req, res) => {
  try {
    const { documento, nuevaContrasena } = req.body || {};

    if (!documento || !nuevaContrasena) {
      return res.status(400).json({
        mensaje: "El documento y la nueva contraseña son obligatorios",
      });
    }

    if (String(nuevaContrasena).length < 6) {
      return res.status(400).json({
        mensaje: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    await authService.recuperarPassword(
      String(documento).trim(),
      String(nuevaContrasena)
    );

    res.json({
      mensaje: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al recuperar contraseña:", error);

    res.status(error.status || 500).json({
      mensaje: error.message || "Error interno del servidor",
    });
  }
};

module.exports = {
  iniciarSesion,
  recuperarPassword,
};