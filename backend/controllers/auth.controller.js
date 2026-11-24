
const authService = require("../services/auth.service");

// ==========================================
// INICIAR SESIÓN
// ==========================================
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

    return res.json({
      mensaje: "Login exitoso",
      token: resultado.token,
      usuario: resultado.usuario,
    });

  } catch (error) {
    console.error("Error en login:", error);

    return res.status(error.status || 500).json({
      mensaje:
        error.status === 401
          ? "Documento o contraseña incorrectos"
          : "No se pudo iniciar sesión. Intenta nuevamente.",
    });
  }
};

// ==========================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ==========================================
const solicitarRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body || {};

    if (!correo || !String(correo).trim()) {
      return res.status(400).json({
        mensaje: "El correo electrónico es obligatorio",
      });
    }

    const correoLimpio = String(correo).trim();

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoLimpio)) {
      return res.status(400).json({
        mensaje: "Ingresa un correo electrónico válido",
      });
    }

    const resultado = await authService.solicitarRecuperacion(
      correoLimpio
    );

    return res.status(200).json({
      mensaje: resultado.mensaje,
    });

  } catch (error) {
    console.error("Error al solicitar recuperación:", error);

    // No revelar errores internos al usuario
    return res.status(200).json({
      mensaje:
        "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.",
    });
  }
};

// ==========================================
// RESTABLECER CONTRASEÑA
// ==========================================
const restablecerContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body || {};

    if (!token || !nuevaContrasena) {
      return res.status(400).json({
        mensaje: "El token y la nueva contraseña son obligatorios",
      });
    }

    if (String(nuevaContrasena).length < 6) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const resultado = await authService.restablecerContrasena(
      String(token).trim(),
      String(nuevaContrasena)
    );

    return res.json({
      mensaje: resultado.mensaje,
    });

  } catch (error) {
    console.error("Error al restablecer contraseña:", error);

    return res.status(error.status || 500).json({
      mensaje:
        error.status === 400
          ? error.message
          : "No se pudo restablecer la contraseña. Intenta nuevamente.",
    });
  }
};

// ==========================================
// EXPORTAR CONTROLADORES
// ==========================================
module.exports = {
  iniciarSesion,
  solicitarRecuperacion,
  restablecerContrasena,
};
