
const pool = require("../db/pool");

// ==========================================
// CONSULTAR MOVIMIENTOS CON FILTROS
// ==========================================

const obtenerMovimientos = async ({ mes, anio, tipo }) => {
  let consulta = `
    SELECT
      m.id_movimiento,
      m.id_prestamo,
      m.cantidad,
      m.observacion,
      m.fecha_movimiento,
      ma.id_material,
      ma.nombre_material,
      u.id_usuario,
      CONCAT(u.nombre_usuario, ' ', u.apellido_usuario) AS nombre_usuario,
      tm.tipo_movimiento,
      c.nombre_categoria
    FROM movimiento m
    INNER JOIN material ma
      ON m.id_material = ma.id_material
    INNER JOIN usuario u
      ON m.id_usuario = u.id_usuario
    INNER JOIN tipo_movimiento tm
      ON m.id_tipo_movimiento = tm.id_tipo_movimiento
    INNER JOIN categoria c
      ON ma.id_categoria = c.id_categoria
    WHERE 1 = 1
  `;

  const valores = [];

  if (mes) {
    valores.push(Number(mes));
    consulta += ` AND EXTRACT(MONTH FROM m.fecha_movimiento) = $${valores.length}`;
  }

  if (anio) {
    valores.push(Number(anio));
    consulta += ` AND EXTRACT(YEAR FROM m.fecha_movimiento) = $${valores.length}`;
  }

  if (tipo) {
    valores.push(tipo.toLowerCase());
    consulta += ` AND LOWER(tm.tipo_movimiento) = $${valores.length}`;
  }

  consulta += ` ORDER BY m.fecha_movimiento DESC, m.id_movimiento DESC`;

  const resultado = await pool.query(consulta, valores);

  return resultado.rows;
};

// ==========================================
// OBTENER RESUMEN DE MOVIMIENTOS
// ==========================================

const obtenerResumenMovimientos = async ({ mes, anio, tipo }) => {
  let consulta = `
    SELECT
      COUNT(*)::INTEGER AS total_movimientos,

      COALESCE(
        SUM(
          CASE
            WHEN LOWER(tm.tipo_movimiento) = 'entrada'
            THEN m.cantidad
            ELSE 0
          END
        ), 0
      )::INTEGER AS total_entradas,

      COALESCE(
        SUM(
          CASE
            WHEN LOWER(tm.tipo_movimiento) = 'salida'
            THEN m.cantidad
            ELSE 0
          END
        ), 0
      )::INTEGER AS total_salidas

    FROM movimiento m
    INNER JOIN tipo_movimiento tm
      ON m.id_tipo_movimiento = tm.id_tipo_movimiento
    WHERE 1 = 1
  `;

  const valores = [];

  if (mes) {
    valores.push(Number(mes));
    consulta += ` AND EXTRACT(MONTH FROM m.fecha_movimiento) = $${valores.length}`;
  }

  if (anio) {
    valores.push(Number(anio));
    consulta += ` AND EXTRACT(YEAR FROM m.fecha_movimiento) = $${valores.length}`;
  }

  if (tipo) {
    valores.push(tipo.toLowerCase());
    consulta += ` AND LOWER(tm.tipo_movimiento) = $${valores.length}`;
  }

  const resultado = await pool.query(consulta, valores);

  return resultado.rows[0];
};

// ==========================================
// REGISTRAR ENTRADA DE INVENTARIO
// ==========================================

const registrarEntrada = async ({
  id_material,
  cantidad,
  observacion,
  id_usuario,
}) => {
  const consulta = `
    INSERT INTO movimiento (
      id_prestamo,
      id_material,
      cantidad,
      observacion,
      fecha_movimiento,
      id_usuario,
      id_tipo_movimiento
    )
    SELECT
      NULL,
      $1,
      $2,
      $3,
      CURRENT_TIMESTAMP,
      $4,
      tm.id_tipo_movimiento
    FROM tipo_movimiento tm
    WHERE LOWER(tm.tipo_movimiento) = 'entrada'
    RETURNING
      id_movimiento,
      id_material,
      cantidad,
      observacion,
      fecha_movimiento,
      id_usuario,
      id_tipo_movimiento
  `;

  const valores = [
    id_material,
    cantidad,
    observacion || "Reposición de inventario",
    id_usuario,
  ];

  const resultado = await pool.query(consulta, valores);

  if (resultado.rowCount === 0) {
    throw new Error("No se encontró el tipo de movimiento Entrada");
  }

  return resultado.rows[0];
};

// ==========================================
// MOVIMIENTOS RECIENTES PARA MI PERFIL
// ==========================================

const obtenerMovimientosPorUsuario = async (id_usuario) => {
  const resultado = await pool.query(
    `
    SELECT
      m.id_movimiento,
      m.id_prestamo,
      m.cantidad,
      m.observacion,
      m.fecha_movimiento,
      ma.id_material,
      ma.nombre_material,
      tm.tipo_movimiento,
      c.nombre_categoria
    FROM movimiento m
    INNER JOIN material ma
      ON m.id_material = ma.id_material
    INNER JOIN tipo_movimiento tm
      ON m.id_tipo_movimiento = tm.id_tipo_movimiento
    INNER JOIN categoria c
      ON ma.id_categoria = c.id_categoria
    WHERE m.id_usuario = $1
    ORDER BY
      m.fecha_movimiento DESC,
      m.id_movimiento DESC
    LIMIT 10
    `,
    [id_usuario]
  );

  return resultado.rows;
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
