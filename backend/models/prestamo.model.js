const pool = require("../db/pool");

// Registrar un préstamo
const crearPrestamo = async (
  id_usuario,
  id_material,
  cantidad
) => {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    // Crear el préstamo
    const prestamo = await cliente.query(
      `
      INSERT INTO prestamo (
        id_usuario,
        fecha_prestamo,
        estado
      )
      VALUES ($1, CURRENT_TIMESTAMP, 'pendiente')
      RETURNING id_prestamo
      `,
      [id_usuario]
    );

    const idPrestamo = prestamo.rows[0].id_prestamo;

    // Crear detalle del préstamo
    await cliente.query(
      `
      INSERT INTO detalle_prestamo (
        id_prestamo,
        id_material,
        cantidad
      )
      VALUES ($1, $2, $3)
      `,
      [idPrestamo, id_material, cantidad]
    );

    // Registrar salida
    await cliente.query(
      `
      INSERT INTO movimiento (
        id_prestamo,
        id_material,
        cantidad,
        observacion,
        id_usuario,
        id_tipo_movimiento
      )
      VALUES ($1, $2, $3, 'Salida por préstamo', $4, 2)
      `,
      [idPrestamo, id_material, cantidad, id_usuario]
    );

    await cliente.query("COMMIT");

    return idPrestamo;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

// Consultar préstamos
const obtenerPrestamos = async () => {
  const resultado = await pool.query(`
    SELECT
      p.id_prestamo,
      p.id_usuario,
      u.nombre_usuario,
      p.fecha_prestamo,
      p.estado,
      dp.id_material,
      m.nombre_material,
      dp.cantidad
    FROM prestamo p
    INNER JOIN usuario u
      ON p.id_usuario = u.id_usuario
    INNER JOIN detalle_prestamo dp
      ON p.id_prestamo = dp.id_prestamo
    INNER JOIN material m
      ON dp.id_material = m.id_material
    ORDER BY p.id_prestamo DESC
  `);

  return resultado.rows;
};

// Devolver un préstamo
const devolverPrestamo = async (id) => {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    // Buscar el préstamo
    const prestamo = await cliente.query(
      `
      SELECT estado, id_usuario
      FROM prestamo
      WHERE id_prestamo = $1
      `,
      [id]
    );

    if (prestamo.rows.length === 0) {
      const error = new Error("Préstamo no encontrado");
      error.status = 404;
      throw error;
    }

    // Verificar que no esté devuelto
    if (prestamo.rows[0].estado === "devuelto") {
      const error = new Error("Este préstamo ya fue devuelto");
      error.status = 400;
      throw error;
    }

    // Obtener materiales del préstamo
    const detalle = await cliente.query(
      `
      SELECT id_material, cantidad
      FROM detalle_prestamo
      WHERE id_prestamo = $1
      `,
      [id]
    );

    // Registrar entrada por devolución
    for (const item of detalle.rows) {
      await cliente.query(
        `
        INSERT INTO movimiento (
          id_prestamo,
          id_material,
          cantidad,
          observacion,
          id_usuario,
          id_tipo_movimiento
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          id,
          item.id_material,
          item.cantidad,
          "Entrada por devolución",
          prestamo.rows[0].id_usuario,
          1,
        ]
      );
    }

    // Cambiar estado del préstamo
    await cliente.query(
      `
      UPDATE prestamo
      SET
        estado = 'devuelto',
        fecha_devolucion = CURRENT_TIMESTAMP
      WHERE id_prestamo = $1
      `,
      [id]
    );

    await cliente.query("COMMIT");
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

module.exports = {
  crearPrestamo,
  obtenerPrestamos,
  devolverPrestamo,
};