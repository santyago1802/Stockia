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

module.exports = {
  iniciarSesion,
};