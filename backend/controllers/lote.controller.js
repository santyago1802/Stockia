
const loteService = require("../services/lote.service");

// ==========================================
// VALIDAR FECHA YYYY-MM-DD
// ==========================================

const validarFecha = (fecha) => {
  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    return false;
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);

  const fechaComprobacion = new Date(
    Date.UTC(anio, mes - 1, dia)
  );

  return (
    fechaComprobacion.getUTCFullYear() === anio &&
    fechaComprobacion.getUTCMonth() === mes - 1 &&
    fechaComprobacion.getUTCDate() === dia
  );
};

// ==========================================
// CONSULTAR LOTES DE UN MATERIAL
// ==========================================

const obtenerLotesPorMaterial = async (req, res) => {
  try {
    const { id_material } = req.params;

    if (
      !Number.isInteger(Number(id_material)) ||
      Number(id_material) <= 0
    ) {
      return res.status(400).json({
        mensaje: "El ID del material no es válido",
      });
    }

    const lotes = await loteService.obtenerLotesPorMaterial(
      Number(id_material)
    );

    return res.json({
      mensaje: "Lotes consultados correctamente",
      lotes,
    });

  } catch (error) {
    console.error("Error al consultar lotes:", error);

    return res.status(error.status || 500).json({
      mensaje: error.message || "No se pudieron consultar los lotes",
    });
  }
};

// ==========================================
// BUSCAR LOTES POR CÓDIGO
// ==========================================

const buscarLotesPorCodigo = async (req, res) => {
  try {
    const { codigo_producto } = req.params;

    if (
      typeof codigo_producto !== "string" ||
      codigo_producto.trim().length === 0
    ) {
      return res.status(400).json({
        mensaje: "Debes proporcionar un código de producto",
      });
    }

    const lotes = await loteService.buscarLotesPorCodigo(
      codigo_producto.trim()
    );

    if (lotes.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron lotes asociados a este código",
        lotes: [],
      });
    }

    return res.json({
      mensaje: "Código identificado correctamente",
      lotes,
    });

  } catch (error) {
    console.error("Error al buscar código:", error);

    return res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo buscar el código",
    });
  }
};

// ==========================================
// REGISTRAR LOTE
// ==========================================

const crearLote = async (req, res) => {
  try {
    const {
      id_detalle_proveedor,
      codigo_producto,
      tipo_codigo,
      fecha_vencimiento,
      cantidad_disponible,
    } = req.body;

    // Validar registro del proveedor y material.
    if (
      !Number.isInteger(Number(id_detalle_proveedor)) ||
      Number(id_detalle_proveedor) <= 0
    ) {
      return res.status(400).json({
        mensaje: "El proveedor y material seleccionados no son válidos",
      });
    }

    // Validar código original.
    if (
      typeof codigo_producto !== "string" ||
      codigo_producto.trim().length === 0 ||
      codigo_producto.trim().length > 150
    ) {
      return res.status(400).json({
        mensaje: "El código del producto es obligatorio y no puede superar 150 caracteres",
      });
    }

    // Validar tipo de código.
    const tipoCodigo = String(tipo_codigo || "").toLowerCase();

    if (!["qr", "barras"].includes(tipoCodigo)) {
      return res.status(400).json({
        mensaje: "El tipo de código debe ser QR o barras",
      });
    }

    // Validar fecha de vencimiento.
    if (!validarFecha(fecha_vencimiento)) {
      return res.status(400).json({
        mensaje: "La fecha de vencimiento no tiene un formato válido",
      });
    }

    // Validar cantidad.
    if (
      !Number.isInteger(Number(cantidad_disponible)) ||
      Number(cantidad_disponible) <= 0
    ) {
      return res.status(400).json({
        mensaje: "La cantidad del lote debe ser un número entero mayor que cero",
      });
    }

    const lote = await loteService.crearLote({
      id_detalle_proveedor: Number(id_detalle_proveedor),
      codigo_producto: codigo_producto.trim(),
      tipo_codigo: tipoCodigo,
      fecha_vencimiento,
      cantidad_disponible: Number(cantidad_disponible),
    });

    return res.status(201).json({
      mensaje: "Lote registrado correctamente",
      lote,
    });

  } catch (error) {
    console.error("Error al registrar lote:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje: "El registro del proveedor o material no existe",
      });
    }

    if (error.code === "23514") {
      return res.status(400).json({
        mensaje: "Los datos del lote no cumplen las restricciones de la base de datos",
      });
    }

    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "Ya existe un registro con esos datos únicos",
      });
    }

    return res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo registrar el lote",
    });
  }
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
  obtenerLotesPorMaterial,
  buscarLotesPorCodigo,
  crearLote,
};
