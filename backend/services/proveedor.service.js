const proveedorModel = require("../models/proveedor.model");

// Obtener proveedores
const obtenerProveedores = () => {
  return proveedorModel.obtenerProveedores();
};

module.exports = {
  obtenerProveedores,
};