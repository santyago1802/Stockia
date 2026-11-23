const bcrypt = require("bcrypt");
const usuarioModel = require("../models/usuario.model");

// Obtener usuarios
const obtenerUsuarios = () => {
  return usuarioModel.obtenerUsuarios();
};

// Crear usuario
const crearUsuario = async (datosUsuario) => {
  const contrasena_hash = await bcrypt.hash(
    datosUsuario.contrasena,
    10
  );

  const usuario = {
    nombre_usuario: datosUsuario.nombre_usuario.trim(),
    apellido_usuario: datosUsuario.apellido_usuario.trim(),
    documento_usuario: datosUsuario.documento_usuario.trim(),
    correo_usuario: datosUsuario.correo_usuario.trim().toLowerCase(),
    contrasena_hash,
    rol: datosUsuario.rol,
  };

  return usuarioModel.crearUsuario(usuario);
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
};