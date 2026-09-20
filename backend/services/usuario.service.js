const usuarioModel = require("../models/usuario.model");

// Obtener usuarios
const obtenerUsuarios = () => {
  return usuarioModel.obtenerUsuarios();
};

module.exports = {
  obtenerUsuarios,
};