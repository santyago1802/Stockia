require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./db/pool"); //app.js, utiliza la 
//conexión que configuramos en pool.js.

const app = express();

app.use(cors());
app.use(express.json());

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

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { documento, contrasena } = req.body || {};

    // Validar que lleguen los datos
    if (!documento || !contrasena) {
      return res.status(400).json({
        mensaje: "Documento y contraseña son obligatorios",
      });
    }

    // Buscar el usuario en PostgreSQL
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

    // Si no existe
    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensaje: "Documento o contraseña incorrectos",
      });
    }

    const usuario = resultado.rows[0];

    // Comparar contraseña con el hash guardado
    const contraseñaCorrecta = await bcrypt.compare(
      contrasena,
      usuario.contrasena_hash
    );

    if (!contraseñaCorrecta) {
      return res.status(401).json({
        mensaje: "Documento o contraseña incorrectos",
      });
    }

    // Crear token
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

    // Respuesta al frontend
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
app.get("/api/materiales", async (_req, res) => { //crea una nueva dirección de nuestra API que es los materiales
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
    `); // FROM material m 
    //hace una consulta a SQL
    //con join se obtiene todo lo que necesita la pantalla

    res.json(resultado.rows); //manda esos datos al frontend en formato JSON
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

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");
    //BEGIN
    // 1. Crear el préstamo,
    // 2. Crear detalle
    // 3. Crear movimiento
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

    res.status(500).json({
      mensaje: error.message,
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

  try {
    await pool.query("BEGIN");

    // Buscar el préstamo
    const prestamo = await pool.query(
    `SELECT estado, id_usuario
    FROM prestamo
    WHERE id_prestamo = $1`,
  [id]
);

    if (prestamo.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        mensaje: "Préstamo no encontrado",
      });
    }

    // Evitar devolver un préstamo que ya fue devuelto
    if (prestamo.rows[0].estado === "devuelto") {
      await pool.query("ROLLBACK");
      return res.status(400).json({
        mensaje: "Este préstamo ya fue devuelto",
      });
    }

    // Obtener material y cantidad del préstamo
    const detalle = await pool.query(
      `SELECT id_material, cantidad
       FROM detalle_prestamo
       WHERE id_prestamo = $1`,
      [id]
    );

    // Registrar la entrada del material
    for (const item of detalle.rows) {
      await pool.query(
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

    // Cambiar el estado del préstamo
    await pool.query(
      `UPDATE prestamo
       SET estado = 'devuelto',
           fecha_devolucion = CURRENT_TIMESTAMP
       WHERE id_prestamo = $1`,
      [id]
    );

    await pool.query("COMMIT");

    res.json({
      mensaje: "Préstamo devuelto correctamente",
    });
  } catch (error) {
    await pool.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      mensaje: "Error al devolver el préstamo",
      error: error.message,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(
    `Backend activo en http://localhost:${process.env.PORT}`
  );
});