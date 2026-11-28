
const pool = require("../db/pool");

// ==========================================
// CONSULTAR LOTES DE UN MATERIAL
// ==========================================

const obtenerLotesPorMaterial = async (id_material) => {
  const resultado = await pool.query(
    `
    SELECT
      l.id_lote,
      l.id_detalle_proveedor,
      dp.id_material,
      m.nombre_material,
      p.nombre_proveedor,
      l.codigo_producto,
      l.tipo_codigo,
      l.fecha_ingreso,
      l.fecha_vencimiento,
      l.cantidad_disponible,
      l.estado_revision,
      l.fecha_revision,
      l.fecha_registro,

      CASE
        WHEN l.fecha_vencimiento < CURRENT_DATE
          THEN 'vencido'
        WHEN l.fecha_vencimiento <= CURRENT_DATE + 15
          THEN 'por_vencer'
        ELSE 'vigente'
      END AS estado_vencimiento

    FROM lote_material l

    INNER JOIN detalle_proveedor dp
      ON l.id_detalle_proveedor = dp.id_detalle_proveedor

    INNER JOIN material m
      ON dp.id_material = m.id_material

    INNER JOIN proveedor p
      ON dp.id_proveedor = p.id_proveedor

    WHERE dp.id_material = $1

    ORDER BY
      l.fecha_vencimiento ASC,
      l.id_lote ASC
    `,
    [id_material]
  );

  return resultado.rows;
};

// ==========================================
// BUSCAR LOTES POR CÓDIGO QR O DE BARRAS
// ==========================================

const buscarLotesPorCodigo = async (codigo_producto) => {
  const resultado = await pool.query(
    `
    SELECT
      l.id_lote,
      l.id_detalle_proveedor,
      dp.id_material,
      m.nombre_material,
      p.nombre_proveedor,
      l.codigo_producto,
      l.tipo_codigo,
      l.fecha_ingreso,
      l.fecha_vencimiento,
      l.cantidad_disponible,
      l.estado_revision,

      CASE
        WHEN l.fecha_vencimiento < CURRENT_DATE
          THEN 'vencido'
        WHEN l.fecha_vencimiento <= CURRENT_DATE + 15
          THEN 'por_vencer'
        ELSE 'vigente'
      END AS estado_vencimiento,

      CASE
        WHEN l.fecha_vencimiento < CURRENT_DATE
          THEN FALSE
        WHEN l.estado_revision <> 'activo'
          THEN FALSE
        WHEN l.cantidad_disponible <= 0
          THEN FALSE
        ELSE TRUE
      END AS disponible_para_solicitud

    FROM lote_material l

    INNER JOIN detalle_proveedor dp
      ON l.id_detalle_proveedor = dp.id_detalle_proveedor

    INNER JOIN material m
      ON dp.id_material = m.id_material

    INNER JOIN proveedor p
      ON dp.id_proveedor = p.id_proveedor

    WHERE l.codigo_producto = $1
      AND m.controla_vencimiento = TRUE

    ORDER BY
      l.fecha_vencimiento ASC,
      l.id_lote ASC
    `,
    [codigo_producto]
  );

  return resultado.rows;
};

// ==========================================
// REGISTRAR UN LOTE
// ==========================================

const crearLote = async ({
  id_detalle_proveedor,
  codigo_producto,
  tipo_codigo,
  fecha_vencimiento,
  cantidad_disponible,
}) => {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    // Verificar proveedor, material y control de vencimiento.
    // Se bloquea el registro para evitar asignaciones simultáneas
    // que superen las existencias disponibles.

    const detalle = await cliente.query(
      `
      SELECT
        dp.id_detalle_proveedor,
        dp.id_material,
        dp.cantidad,
        m.nombre_material,
        m.controla_vencimiento

      FROM detalle_proveedor dp

      INNER JOIN material m
        ON dp.id_material = m.id_material

      WHERE dp.id_detalle_proveedor = $1

      FOR UPDATE OF dp
      `,
      [id_detalle_proveedor]
    );

    if (detalle.rows.length === 0) {
      const error = new Error(
        "No se encontró el registro del proveedor y material"
      );

      error.status = 404;
      throw error;
    }

    const material = detalle.rows[0];

    if (!material.controla_vencimiento) {
      const error = new Error(
        "Este material no tiene activado el control de vencimiento"
      );

      error.status = 400;
      throw error;
    }

    // Consultar cantidades que ya están distribuidas en lotes.
    // No se suman nuevamente al inventario general.

    const asignacion = await cliente.query(
      `
      SELECT
        COALESCE(SUM(cantidad_disponible), 0)::INTEGER
          AS cantidad_asignada

      FROM lote_material

      WHERE id_detalle_proveedor = $1
      `,
      [id_detalle_proveedor]
    );

    const cantidadAsignada = Number(
      asignacion.rows[0].cantidad_asignada
    );

    const cantidadGeneral = Number(material.cantidad);

    const cantidadNueva = Number(cantidad_disponible);

    if (
      cantidadAsignada + cantidadNueva >
      cantidadGeneral
    ) {
      const error = new Error(
        `No puedes asignar ${cantidadNueva} unidades. ` +
        `El inventario general tiene ${cantidadGeneral} unidades ` +
        `y ya hay ${cantidadAsignada} asignadas a otros lotes.`
      );

      error.status = 400;
      throw error;
    }

    // Los lotes que ya llegan vencidos quedan bloqueados.
    const resultado = await cliente.query(
      `
      INSERT INTO lote_material (
        id_detalle_proveedor,
        codigo_producto,
        tipo_codigo,
        fecha_ingreso,
        fecha_vencimiento,
        cantidad_disponible,
        estado_revision
      )
      VALUES (
        $1,
        $2,
        $3,
        CURRENT_DATE,
        $4,
        $5,
        CASE
          WHEN $4::DATE < CURRENT_DATE
            THEN 'bloqueado'
          ELSE 'activo'
        END
      )
      RETURNING *
      `,
      [
        id_detalle_proveedor,
        codigo_producto,
        tipo_codigo,
        fecha_vencimiento,
        cantidad_disponible,
      ]
    );

    await cliente.query("COMMIT");

    return resultado.rows[0];

  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;

  } finally {
    cliente.release();
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
