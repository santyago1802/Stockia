
const movimientoModel = require("../models/movimiento.model");

// Consultar historial de movimientos
const obtenerMovimientos = async (filtros) => {
  return await movimientoModel.obtenerMovimientos(filtros);
};

// Consultar resumen de movimientos
const obtenerResumenMovimientos = async (filtros) => {
  return await movimientoModel.obtenerResumenMovimientos(filtros);
};

// Registrar entrada de inventario
const registrarEntrada = async (datos) => {
  return await movimientoModel.registrarEntrada(datos);
};

module.exports = {
  obtenerMovimientos,
  obtenerResumenMovimientos,
  registrarEntrada,
};
