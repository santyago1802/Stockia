const categoriaService = require("../services/categoria.service");

// Obtener categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerCategorias();

    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);

    res.status(500).json({
      mensaje: "No se pudieron obtener las categorías",
    });
  }
};

module.exports = {
  obtenerCategorias,
};