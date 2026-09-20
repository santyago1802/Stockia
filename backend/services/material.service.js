const materialModel = require("../models/material.model");

// Obtener materiales
const obtenerMateriales = () => {
  return materialModel.obtenerMateriales();
};

// Crear material
const crearMaterial = (
  nombre_material,
  descripcion_material,
  id_categoria,
  id_proveedor,
  stock_minimo,
  cantidad
) => {
  return materialModel.crearMaterial(
    nombre_material,
    descripcion_material,
    id_categoria,
    id_proveedor,
    stock_minimo,
    cantidad
  );
};

// Actualizar material
const actualizarMaterial = (
  id,
  nombre_material,
  descripcion_material,
  id_categoria,
  stock_minimo
) => {
  return materialModel.actualizarMaterial(
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