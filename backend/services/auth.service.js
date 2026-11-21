const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authModel = require("../models/auth.model");

// Iniciar sesión
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

// Recuperar / restablecer contraseña
const recuperarPassword = async (documento, nuevaContrasena) => {
  const usuario = await authModel.obtenerUsuarioPorDocumento(documento);

  if (!usuario) {
    const error = new Error("No se encontró un usuario con ese documento");
    error.status = 404;
    throw error;
  }

  const rondasSalt = 10;
  const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, rondasSalt);

  const actualizado = await authModel.actualizarContrasenaPorDocumento(
    documento,
    nuevaContrasenaHash
  );

  if (!actualizado) {
    const error = new Error("No se pudo actualizar la contraseña");
    error.status = 500;
    throw error;
  }

  return {
    documento: actualizado.documento_usuario,
  };
};

module.exports = {
  iniciarSesion,
  recuperarPassword,
};