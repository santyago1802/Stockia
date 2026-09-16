const usuarioModel = require("../models/usuario.model");

// Obtener usuarios
const obtenerUsuarios = async () => {
  return await usuarioModel.obtenerUsuarios();
};

module.exports = {
  obtenerUsuarios,
};