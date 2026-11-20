const pool = require("../db/pool");

// Consultar materiales e inventario
const obtenerMateriales = async () => {
  const resultado = await pool.query(`
    SELECT
      m.id_material,
      m.nombre_material,
      m.descripcion_material,
      m.id_categoria,
      c.nombre_categoria,
      COALESCE(SUM(dp.cantidad), 0) AS stock_actual,
      COALESCE(MAX(dp.stock_minimo), 0) AS stock_minimo
    FROM material m
    INNER JOIN categoria c
      ON m.id_categoria = c.id_categoria
    LEFT JOIN detalle_proveedor dp
      ON m.id_material = dp.id_material
    GROUP BY
      m.id_material,
      m.nombre_material,
      m.descripcion_material,
      m.id_categoria,
      c.nombre_categoria
    ORDER BY
      c.nombre_categoria,
      m.nombre_material
  `);

  return resultado.rows;
};

// Registrar material
const crearMaterial = async (
  nombre_material,
  descripcion_material,
  id_categoria,
  id_proveedor,
  stock_minimo,
  cantidad
) => {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    const resultadoMaterial = await cliente.query(
      `
      INSERT INTO material (
        nombre_material,
        descripcion_material,
        id_categoria
      )
      VALUES ($1, $2, $3)
      RETURNING id_material
      `,
      [
        nombre_material,
        descripcion_material,
        id_categoria,
      ]
    );

    const id_material = resultadoMaterial.rows[0].id_material;

    await cliente.query(
      `
      INSERT INTO detalle_proveedor (
        id_material,
        id_proveedor,
        stock_minimo,
        cantidad
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        id_material,
        id_proveedor,
        stock_minimo,
        cantidad,
      ]
    );

    await cliente.query("COMMIT");

    return id_material;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

// Editar material
const actualizarMaterial = async (
  id,
  nombre_material,
  descripcion_material,
  id_categoria,
  stock_minimo
) => {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    const resultadoMaterial = await cliente.query(
      `
      UPDATE material
      SET
        nombre_material = $1,
        descripcion_material = $2,
        id_categoria = $3
      WHERE id_material = $4
      RETURNING id_material
      `,
      [
        nombre_material,
        descripcion_material,
        id_categoria,
        id,
      ]
    );

    if (resultadoMaterial.rows.length === 0) {
      const error = new Error("Material no encontrado");
      error.status = 404;
      throw error;
    }

    await cliente.query(
      `
      UPDATE detalle_proveedor
      SET stock_minimo = $1
      WHERE id_material = $2
      `,
      [
        stock_minimo,
        id,
      ]
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
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
};