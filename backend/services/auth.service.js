
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authModel = require("../models/auth.model");
const emailService = require("./email.service");

// ==========================================
// INICIAR SESIÓN
// ==========================================
const iniciarSesion = async (documento, contrasena) => {
  const usuario = await authModel.obtenerUsuarioPorDocumento(documento);

  if (!usuario) {
    const error = new Error("Documento o contraseña incorrectos");
    error.status = 401;
    throw error;
  }

  const contraseñaCorrecta = await bcrypt.compare(
    contrasena,
    usuario.contrasena_hash
  );

  if (!contraseñaCorrecta) {
    const error = new Error("Documento o contraseña incorrectos");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre_usuario,
      apellido: usuario.apellido_usuario,
      rol: usuario.rol,
    },
  };
};

// ==========================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ==========================================
const solicitarRecuperacion = async (correo) => {
  const respuesta = {
    mensaje:
      "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.",
  };

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("No está configurada la variable FRONTEND_URL");
  }

  // Buscar usuario por correo
  const usuario = await authModel.obtenerUsuarioPorCorreo(correo);

  // Si el correo no existe, devolver respuesta neutral
  if (!usuario) {
    return respuesta;
  }

  // Invalidar solicitudes anteriores
  await authModel.invalidarTokensAnteriores(usuario.id_usuario);

  // Generar token aleatorio seguro
  const token = crypto.randomBytes(32).toString("hex");

  // Guardar solamente el hash SHA-256
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Expiración de 15 minutos
  const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

  // Crear registro del token
  const registro = await authModel.crearTokenRecuperacion(
    usuario.id_usuario,
    tokenHash,
    fechaExpiracion
  );

  // Crear enlace de recuperación
  const enlaceRecuperacion =
    `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

  try {
    // Enviar correo de recuperación
    await emailService.enviarCorreoRecuperacion(
      usuario.correo_usuario,
      usuario.nombre_usuario,
      enlaceRecuperacion
    );

    console.log("Solicitud de recuperación procesada correctamente.");

  } catch (error) {
    console.error("Error enviando correo de recuperación:", error);

    // Invalidar el token si falla el envío
    try {
      await authModel.invalidarTokenPorId(registro.id);

      console.log("Token de recuperación invalidado por fallo del correo.");

    } catch (errorInvalidacion) {
      console.error(
        "No se pudo invalidar el token después del fallo del correo:",
        errorInvalidacion
      );
    }
  }

  // Devolver siempre el mismo mensaje público
  return respuesta;
};

// ==========================================
// RESTABLECER CONTRASEÑA
// ==========================================
const restablecerContrasena = async (token, nuevaContrasena) => {
  // Calcular hash del token recibido
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Buscar token válido
  const registroToken = await authModel.obtenerTokenValido(tokenHash);

  if (!registroToken) {
    const error = new Error(
      "El enlace de recuperación no es válido o ha expirado"
    );
    error.status = 400;
    throw error;
  }

  // Hashear nueva contraseña con bcrypt
  const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, 10);

  // Actualizar contraseña y consumir token en una transacción
  await authModel.actualizarContrasenaConToken(
    registroToken.id_usuario,
    registroToken.id,
    nuevaContrasenaHash
  );

  return {
    mensaje: "Contraseña actualizada correctamente",
  };
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================
module.exports = {
  iniciarSesion,
  solicitarRecuperacion,
  restablecerContrasena,
};
