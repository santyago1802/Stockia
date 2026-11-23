
const movimientoService = require("../services/movimiento.service");

// ==========================================
// CONSULTAR MOVIMIENTOS Y RESUMEN
// ==========================================

const obtenerMovimientos = async (req, res) => {
  try {
    const { mes, anio, tipo } = req.query;

    if (mes !== undefined) {
      const numeroMes = Number(mes);

      if (!Number.isInteger(numeroMes) || numeroMes < 1 || numeroMes > 12) {
        return res.status(400).json({
          mensaje: "El mes debe ser un número entre 1 y 12",
        });
      }
    }

    if (anio !== undefined) {
      const numeroAnio = Number(anio);

      if (!Number.isInteger(numeroAnio) || numeroAnio < 2000 || numeroAnio > 2100) {
        return res.status(400).json({
          mensaje: "El año no es válido",
        });
      }
    }

    if (
      tipo !== undefined &&
      !["entrada", "salida"].includes(String(tipo).toLowerCase())
    ) {
      return res.status(400).json({
        mensaje: "El tipo debe ser entrada o salida",
      });
    }

    const filtros = {
      mes: mes ? Number(mes) : null,
      anio: anio ? Number(anio) : null,
      tipo: tipo ? String(tipo).toLowerCase() : null,
    };

    const movimientos =
      await movimientoService.obtenerMovimientos(filtros);

    const resumen =
      await movimientoService.obtenerResumenMovimientos(filtros);

    return res.json({
      movimientos,
      resumen,
    });
  } catch (error) {
    console.error("Error al consultar movimientos:", error);

    return res.status(500).json({
      mensaje: "Error al consultar los movimientos",
    });
  }
};

// ==========================================
// REGISTRAR ENTRADA DE INVENTARIO
// ==========================================

const registrarEntrada = async (req, res) => {
  try {
    const { id_material, cantidad, observacion } = req.body;

    const idMaterial = Number(id_material);
    const cantidadEntrada = Number(cantidad);

    if (!Number.isInteger(idMaterial) || idMaterial <= 0) {
      return res.status(400).json({
        mensaje: "Debes seleccionar un material válido",
      });
    }

    if (!Number.isInteger(cantidadEntrada) || cantidadEntrada <= 0) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser un número entero mayor que cero",
      });
    }

    if (
      observacion !== undefined &&
      (typeof observacion !== "string" || observacion.length > 500)
    ) {
      return res.status(400).json({
        mensaje: "La observación no puede superar los 500 caracteres",
      });
    }

    const idUsuario = Number(req.usuario.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(401).json({
        mensaje: "No se pudo identificar al usuario de la sesión",
      });
    }

    const movimiento = await movimientoService.registrarEntrada({
      id_material: idMaterial,
      cantidad: cantidadEntrada,
      observacion: observacion?.trim() || "Reposición de inventario",
      id_usuario: idUsuario,
    });

    return res.status(201).json({
      mensaje: "Entrada de inventario registrada correctamente",
      movimiento,
    });
  } catch (error) {
    console.error("Error al registrar entrada:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje: "El material o el usuario seleccionado no existe",
      });
    }

    return res.status(500).json({
      mensaje: "No se pudo registrar la entrada de inventario",
    });
  }
};

// ==========================================
// MOVIMIENTOS RECIENTES PARA MI PERFIL
// ==========================================

const obtenerMovimientosPorUsuario = async (req, res) => {
  try {
    const id_usuario = Number(req.usuario.id_usuario);

    if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
      return res.status(401).json({
        mensaje: "No se pudo identificar al usuario de la sesión",
      });
    }

    const movimientos =
      await movimientoService.obtenerMovimientosPorUsuario(id_usuario);

    return res.json({
      mensaje: "Movimientos recientes consultados correctamente",
      movimientos,
    });
  } catch (error) {
    console.error("Error al consultar movimientos recientes:", error);

    return res.status(500).json({
      mensaje: "No se pudieron consultar los movimientos recientes",
    });
  }
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
  obtenerMovimientos,
  registrarEntrada,
  obtenerMovimientosPorUsuario,
};
