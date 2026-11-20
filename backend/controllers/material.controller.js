const materialService = require("../services/material.service");

// Obtener materiales
const obtenerMateriales = async (req, res) => {
  try {
    const materiales = await materialService.obtenerMateriales();

    res.json(materiales);
  } catch (error) {
    console.error("Error al obtener materiales:", error);

    res.status(error.status || 500).json({
      mensaje: error.message || "No se pudieron consultar los materiales",
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

    // Validar nombre
    if (
      typeof nombre_material !== "string" ||
      nombre_material.trim().length === 0
    ) {
      return res.status(400).json({
        mensaje: "El nombre del material es obligatorio",
      });
    }

    // Validar categoría
    if (
      !Number.isInteger(Number(id_categoria)) ||
      Number(id_categoria) <= 0
    ) {
      return res.status(400).json({
        mensaje: "La categoría seleccionada no es válida",
      });
    }

    // Validar proveedor
    if (
      !Number.isInteger(Number(id_proveedor)) ||
      Number(id_proveedor) <= 0
    ) {
      return res.status(400).json({
        mensaje: "El proveedor seleccionado no es válido",
      });
    }

    // Validar stock mínimo
    if (
      !Number.isInteger(Number(stock_minimo)) ||
      Number(stock_minimo) < 0
    ) {
      return res.status(400).json({
        mensaje: "El stock mínimo debe ser un número entero mayor o igual a 0",
      });
    }

    // Validar cantidad
    if (
      !Number.isInteger(Number(cantidad)) ||
      Number(cantidad) < 0
    ) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser un número entero mayor o igual a 0",
      });
    }

    const id_material = await materialService.crearMaterial(
      nombre_material.trim(),
      descripcion_material?.trim() || "",
      Number(id_categoria),
      Number(id_proveedor),
      Number(stock_minimo),
      Number(cantidad)
    );

    res.status(201).json({
      mensaje: "Material registrado correctamente",
      id_material,
    });
  } catch (error) {
    console.error("Error al registrar material:", error);

    res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo registrar el material",
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

    // Validar ID
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "El ID del material no es válido",
      });
    }

    // Validar nombre
    if (
      typeof nombre_material !== "string" ||
      nombre_material.trim().length === 0
    ) {
      return res.status(400).json({
        mensaje: "El nombre del material es obligatorio",
      });
    }

    // Validar categoría
    if (
      !Number.isInteger(Number(id_categoria)) ||
      Number(id_categoria) <= 0
    ) {
      return res.status(400).json({
        mensaje: "La categoría seleccionada no es válida",
      });
    }

    // Validar stock mínimo
    if (
      !Number.isInteger(Number(stock_minimo)) ||
      Number(stock_minimo) < 0
    ) {
      return res.status(400).json({
        mensaje: "El stock mínimo debe ser un número entero mayor o igual a 0",
      });
    }

    await materialService.actualizarMaterial(
      Number(id),
      nombre_material.trim(),
      descripcion_material?.trim() || "",
      Number(id_categoria),
      Number(stock_minimo)
    );

    res.json({
      mensaje: "Material actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al editar material:", error);

    res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo actualizar el material",
    });
  }
};

module.exports = {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
};