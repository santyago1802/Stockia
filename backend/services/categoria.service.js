const categoriaModel = require("../models/categoria.model");

// Obtener categorías
const obtenerCategorias = () => {
  return categoriaModel.obtenerCategorias();
};

module.exports = {
  obtenerCategorias,
};