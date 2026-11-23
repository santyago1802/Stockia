
const movimientoModel = require("../models/movimiento.model");

// ==========================================
// CONSULTAR MOVIMIENTOS
// ==========================================

const obtenerMovimientos = async (filtros) => {
  return await movimientoModel.obtenerMovimientos(filtros);
};

// ==========================================
// CONSULTAR RESUMEN DE MOVIMIENTOS
// ==========================================

const obtenerResumenMovimientos = async (filtros) => {
  return await movimientoModel.obtenerResumenMovimientos(filtros);
};

// ==========================================
// REGISTRAR ENTRADA DE INVENTARIO
// ==========================================

const registrarEntrada = async (datos) => {
  return await movimientoModel.registrarEntrada(datos);
};

// ==========================================
// MOVIMIENTOS RECIENTES PARA MI PERFIL
// ==========================================

const obtenerMovimientosPorUsuario = async (id_usuario) => {
  return await movimientoModel.obtenerMovimientosPorUsuario(
    id_usuario
  );
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
  obtenerMovimientos,
  obtenerResumenMovimientos,
  registrarEntrada,
  obtenerMovimientosPorUsuario,
};
