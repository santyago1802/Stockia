const pool = require("./db/pool");

async function diagnostico() {
  try {
    const resultado = await pool.query(`
      SELECT
        current_database() AS base_datos,
        current_schema() AS esquema,
        inet_server_port() AS puerto,
        to_regclass('public.lote_material') AS tabla_lotes
    `);

    console.table(resultado.rows);
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

diagnostico();
