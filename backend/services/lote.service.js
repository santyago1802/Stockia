
const loteModel = require("../models/lote.model");

// ==========================================
// CONSULTAR LOTES DE UN MATERIAL
// ==========================================

const obtenerLotesPorMaterial = (id_material) => {
  return loteModel.obtenerLotesPorMaterial(id_material);
};

// ==========================================
// BUSCAR LOTES POR CÓDIGO
// ==========================================

const buscarLotesPorCodigo = (codigo_producto) => {
  return loteModel.buscarLotesPorCodigo(codigo_producto);
};

// ==========================================
// REGISTRAR LOTE
// ==========================================

const crearLote = (datos) => {
  return loteModel.crearLote(datos);
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
  obtenerLotesPorMaterial,
  buscarLotesPorCodigo,
  crearLote,
};
