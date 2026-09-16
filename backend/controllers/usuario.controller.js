const usuarioService = require("../services/usuario.service");

// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();

    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    res.status(500).json({
      mensaje: "No se pudieron consultar los usuarios",
    });
  }
};

module.exports = {
  obtenerUsuarios,
};