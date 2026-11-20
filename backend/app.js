require("dotenv").config();
 
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
 
const pool = require("./db/pool"); // conexión configurada en pool.js
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
// Middleware de autenticación (BUG-004)
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");
 
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ mensaje: "Token requerido" });
  }
 
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
}
 
// Rutas protegidas: /api/health y /api/login quedan públicas
app.use("/api/usuarios", verificarToken);
app.use("/api/materiales", verificarToken);
app.use("/api/prestamos", verificarToken);
 
// Comprobar conexión con PostgreSQL
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
 
    res.json({
      mensaje: "Backend y PostgreSQL conectados",
    });
  } catch (error) {
    console.error(error);
 
    res.status(500).json({
      mensaje: "Error al conectar PostgreSQL",
    });
  }
});
 
// Consultar usuarios
app.get("/api/usuarios", async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id_usuario,
        nombre_usuario,
        apellido_usuario,
        rol
      FROM usuario
      ORDER BY id_usuario
    `);
 
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
 
    res.status(500).json({
      mensaje: "No se pudieron consultar los usuarios",
    });
  }
});
 
// Login
app.post("/api/login", async (req, res) => {
  try {
    const { documento, contrasena } = req.body || {};
 
    if (!documento || !contrasena) {
      return res.status(400).json({
        mensaje: "Documento y contraseña son obligatorios",
      });
    }
 
    const resultado = await pool.query(
      `
      SELECT
        id_usuario,
        nombre_usuario,
        apellido_usuario,
        documento_usuario,
        contrasena_hash,
        rol
      FROM usuario
      WHERE documento_usuario = $1
      `,
      [documento]
    );
 
    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensaje: "Documento o contraseña incorrectos",
      });
    }
 
    const usuario = resultado.rows[0];
 
    const contraseñaCorrecta = await bcrypt.compare(
      contrasena,
      usuario.contrasena_hash
    );
 
    if (!contraseñaCorrecta) {
      return res.status(401).json({
        mensaje: "Documento o contraseña incorrectos",
      });
    }
 
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
 
    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        apellido: usuario.apellido_usuario,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
 
    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});
 
// Consultar materiales e inventario
app.get("/api/materiales", async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        m.id_material,
        m.nombre_material,
        m.descripcion_material,
        dp.cantidad AS stock_actual,
        dp.stock_minimo
      FROM material m
      INNER JOIN detalle_proveedor dp
        ON m.id_material = dp.id_material
      ORDER BY m.id_material
    `);
 
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
 
    res.status(500).json({
      mensaje: "No se pudieron consultar los materiales",
    });
  }
});
 
// Registrar un préstamo
app.post("/api/prestamos", async (req, res) => {
  const { id_usuario, id_material, cantidad } = req.body;
 
  if (!id_usuario || !id_material || !cantidad) {
    return res.status(400).json({
      mensaje: "Usuario, material y cantidad son obligatorios",
    });
  }
 
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({
      mensaje: "La cantidad debe ser un número entero mayor que cero",
    });
  }
 
  const cliente = await pool.connect();
 
  try {
    await cliente.query("BEGIN");
 
    // 1. Crear el préstamo
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
 
    // 2. Crear el detalle del préstamo
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
 
    // 3. Registrar el movimiento de salida
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
 
    res.status(201).json({
      mensaje: "Préstamo registrado correctamente",
      id_prestamo: idPrestamo,
    });
  } catch (error) {
    await cliente.query("ROLLBACK");
 
    console.error(error);
 
    // BUG-002: mensaje genérico, el detalle queda solo en el log
    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  } finally {
    cliente.release();
  }
});
 
// Consultar préstamos
app.get("/api/prestamos", async (_req, res) => {
  try {
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
 
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
 
    res.status(500).json({
      mensaje: "No se pudieron consultar los préstamos",
    });
  }
});
 
// Devolver un préstamo
app.put("/api/prestamos/:id/devolver", async (req, res) => {
  const { id } = req.params;
 
  // BUG-003: conexión dedicada para que BEGIN/COMMIT sean atómicos
  const cliente = await pool.connect();
 
  try {
    await cliente.query("BEGIN");
 
    const prestamo = await cliente.query(
      `SELECT estado, id_usuario
       FROM prestamo
       WHERE id_prestamo = $1`,
      [id]
    );
 
    if (prestamo.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return res.status(404).json({
        mensaje: "Préstamo no encontrado",
      });
    }
 
    if (prestamo.rows[0].estado === "devuelto") {
      await cliente.query("ROLLBACK");
      return res.status(400).json({
        mensaje: "Este préstamo ya fue devuelto",
      });
    }
 
    const detalle = await cliente.query(
      `SELECT id_material, cantidad
       FROM detalle_prestamo
       WHERE id_prestamo = $1`,
      [id]
    );
 
    for (const item of detalle.rows) {
      await cliente.query(
        `INSERT INTO movimiento
        (id_prestamo, id_material, cantidad, observacion, id_usuario, id_tipo_movimiento)
        VALUES ($1, $2, $3, $4, $5, $6)`,
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
 
    await cliente.query(
      `UPDATE prestamo
       SET estado = 'devuelto',
           fecha_devolucion = CURRENT_TIMESTAMP
       WHERE id_prestamo = $1`,
      [id]
    );
 
    await cliente.query("COMMIT");
 
    res.json({
      mensaje: "Préstamo devuelto correctamente",
    });
  } catch (error) {
    await cliente.query("ROLLBACK");
 
    console.error(error);
 
    // BUG-002: sin error.message
    res.status(500).json({
      mensaje: "Error al devolver el préstamo",
    });
  } finally {
    cliente.release();
  }
});
 
module.exports = app;