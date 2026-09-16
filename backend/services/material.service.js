const materialModel = require("../models/material.model");

// Obtener materiales
const obtenerMateriales = async () => {
  return await materialModel.obtenerMateriales();
};

// Crear material
const crearMaterial = async (
  nombre_material,
  descripcion_material,
  id_categoria,
  id_proveedor,
  stock_minimo,
  cantidad
) => {
  return await materialModel.crearMaterial(
    nombre_material,
    descripcion_material,
    id_categoria,
    id_proveedor,
    stock_minimo,
    cantidad
  );
};

// Actualizar material
const actualizarMaterial = async (
  id,
  nombre_material,
  descripcion_material,
  id_categoria,
  stock_minimo
) => {
  return await materialModel.actualizarMaterial(
    id,
    nombre_material,
    descripcion_material,
    id_categoria,
    stock_minimo
  );
};

module.exports = {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
};