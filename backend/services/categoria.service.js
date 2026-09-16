const categoriaModel = require("../models/categoria.model");

// Obtener categorías
const obtenerCategorias = async () => {
  return await categoriaModel.obtenerCategorias();
};

module.exports = {
  obtenerCategorias,
};