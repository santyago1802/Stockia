const proveedorService = require("../services/proveedor.service");

// Obtener proveedores
const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await proveedorService.obtenerProveedores();

    res.json(proveedores);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);

    res.status(500).json({
      mensaje: "No se pudieron obtener los proveedores",
    });
  }
};

module.exports = {
  obtenerProveedores,
};