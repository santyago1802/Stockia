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

    if (prestamo.rows.length === 0) {
      const error = new Error("No se pudo crear el préstamo");
      error.status = 500;
      throw error;
    }

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
      [
        idPrestamo,
        id_material,
        cantidad,
      ]
    );

    // Registrar salida.
    // El trigger de PostgreSQL actualizará el stock.
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
        idPrestamo,
        id_material,
        cantidad,
        "Salida por préstamo",
        id_usuario,
        2,
      ]
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
const obtenerPrestamos = async (
  id_usuario,
  rol
) => {
  let consulta = `
    SELECT
      p.id_prestamo,
      p.id_usuario,
      u.nombre_usuario,
      p.fecha_prestamo,
      p.fecha_devolucion,
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
  `;

  const parametros = [];

  // Los instructores solo pueden consultar sus propios préstamos
  if (rol === "Instructor") {
    consulta += `
      WHERE p.id_usuario = $1
    `;

    parametros.push(id_usuario);
  }

  consulta += `
    ORDER BY p.id_prestamo DESC
  `;

  const resultado = await pool.query(
    consulta,
    parametros
  );

  return resultado.rows;
};

// Devolver un préstamo
const devolverPrestamo = async (
  id,
  id_usuario
) => {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    // Buscar y bloquear el préstamo durante la transacción
    const prestamo = await cliente.query(
      `
      SELECT
        estado,
        id_usuario
      FROM prestamo
      WHERE id_prestamo = $1
      FOR UPDATE
      `,
      [id]
    );

    if (prestamo.rows.length === 0) {
      const error = new Error("Préstamo no encontrado");
      error.status = 404;
      throw error;
    }

    // Verificar que el préstamo pertenezca al usuario autenticado
    if (
      Number(prestamo.rows[0].id_usuario) !==
      Number(id_usuario)
    ) {
      const error = new Error(
        "No tienes permisos para devolver este préstamo"
      );
      error.status = 403;
      throw error;
    }

    // Verificar que no esté devuelto
    if (prestamo.rows[0].estado === "devuelto") {
      const error = new Error(
        "Este préstamo ya fue devuelto"
      );
      error.status = 400;
      throw error;
    }

    // Obtener materiales del préstamo
    const detalle = await cliente.query(
      `
      SELECT
        id_material,
        cantidad
      FROM detalle_prestamo
      WHERE id_prestamo = $1
      `,
      [id]
    );

    if (detalle.rows.length === 0) {
      const error = new Error(
        "El préstamo no tiene materiales asociados"
      );
      error.status = 400;
      throw error;
    }

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
          id_usuario,
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