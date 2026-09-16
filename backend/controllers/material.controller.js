const materialService = require("../services/material.service");

// Obtener materiales
const obtenerMateriales = async (req, res) => {
  try {
    const materiales = await materialService.obtenerMateriales();

    res.json(materiales);
  } catch (error) {
    console.error("Error al obtener materiales:", error);

    res.status(500).json({
      mensaje: "No se pudieron consultar los materiales",
    });
  }
};

// Registrar material
const crearMaterial = async (req, res) => {
  try {
    const {
      nombre_material,
      descripcion_material,
      id_categoria,
      id_proveedor,
      stock_minimo,
      cantidad,
    } = req.body;

    if (
      !nombre_material ||
      !id_categoria ||
      !id_proveedor ||
      stock_minimo === undefined ||
      cantidad === undefined
    ) {
      return res.status(400).json({
        mensaje: "Los datos del material son obligatorios",
      });
    }

    const id_material = await materialService.crearMaterial(
      nombre_material,
      descripcion_material,
      id_categoria,
      id_proveedor,
      stock_minimo,
      cantidad
    );

    res.status(201).json({
      mensaje: "Material registrado correctamente",
      id_material,
    });
  } catch (error) {
    console.error("Error al registrar material:", error);

    res.status(500).json({
      mensaje: "No se pudo registrar el material",
    });
  }
};

// Editar material
const actualizarMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre_material,
      descripcion_material,
      id_categoria,
      stock_minimo,
    } = req.body;

    if (
      !nombre_material ||
      !id_categoria ||
      stock_minimo === undefined
    ) {
      return res.status(400).json({
        mensaje: "Los datos del material son obligatorios",
      });
    }

    await materialService.actualizarMaterial(
      id,
      nombre_material,
      descripcion_material,
      id_categoria,
      stock_minimo
    );

    res.json({
      mensaje: "Material actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al editar material:", error);

    res.status(500).json({
      mensaje: "No se pudo actualizar el material",
    });
  }
};

module.exports = {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
};