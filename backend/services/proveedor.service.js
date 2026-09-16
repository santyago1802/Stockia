const proveedorModel = require("../models/proveedor.model");

// Obtener proveedores
const obtenerProveedores = async () => {
  return await proveedorModel.obtenerProveedores();
};

module.exports = {
  obtenerProveedores,
};