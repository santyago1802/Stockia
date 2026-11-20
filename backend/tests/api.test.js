process.env.JWT_SECRET = "secreto_de_prueba";
 
// Reemplaza ../db/pool por un doble falso
jest.mock("../db/pool", () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
 
// Reemplaza bcrypt: cada test decide si la contraseña es correcta
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));
 
const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const app = require("../app");
 
// Token válido para las rutas protegidas (BUG-004)
const token = jwt.sign({ id_usuario: 1, rol: "admin" }, "secreto_de_prueba");
const auth = `Bearer ${token}`;
 
// Cliente falso de la conexión dedicada: responde en el orden indicado
function clienteConRespuestas(respuestas) {
  const query = jest.fn();
  respuestas.forEach((r) => query.mockResolvedValueOnce(r));
  const cliente = { query, release: jest.fn() };
  pool.connect.mockResolvedValue(cliente);
  return cliente;
}
 
beforeEach(() => {
  jest.resetAllMocks();
});
 
afterEach(() => {
  jest.restoreAllMocks();
});
 
describe("GET /api/health", () => {
  test("responde 200 cuando PostgreSQL está disponible", async () => {
    pool.query.mockResolvedValue({ rows: [{ "?column?": 1 }] });
 
    const res = await request(app).get("/api/health");
 
    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe("Backend y PostgreSQL conectados");
  });
 
  test("responde 500 cuando PostgreSQL falla", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    pool.query.mockRejectedValue(new Error("conexión rechazada"));
 
    const res = await request(app).get("/api/health");
 
    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe("Error al conectar PostgreSQL");
  });
});
 
describe("POST /api/login", () => {
  test("responde 400 si falta la contraseña", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ documento: "123456" });
 
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
 
  test("responde 401 si el documento no existe", async () => {
    pool.query.mockResolvedValue({ rows: [] });
 
    const res = await request(app)
      .post("/api/login")
      .send({ documento: "999", contrasena: "cualquiera" });
 
    expect(res.status).toBe(401);
    expect(res.body.mensaje).toMatch(/incorrectos/);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
 
  test("responde 401 si la contraseña es incorrecta", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, contrasena_hash: "hash_falso", rol: "admin" }],
    });
    bcrypt.compare.mockResolvedValue(false);
 
    const res = await request(app)
      .post("/api/login")
      .send({ documento: "123", contrasena: "mala" });
 
    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });
 
  test("responde 200 con un token válido si las credenciales son correctas", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          id_usuario: 7,
          nombre_usuario: "Ana",
          apellido_usuario: "Pérez",
          contrasena_hash: "hash_falso",
          rol: "admin",
        },
      ],
    });
    bcrypt.compare.mockResolvedValue(true);
 
    const res = await request(app)
      .post("/api/login")
      .send({ documento: "123", contrasena: "buena" });
 
    expect(res.status).toBe(200);
    const datos = jwt.verify(res.body.token, "secreto_de_prueba");
    expect(datos.id_usuario).toBe(7);
    expect(datos.rol).toBe("admin");
    expect(res.body.usuario.contrasena_hash).toBeUndefined();
  });
});
 
describe("POST /api/prestamos", () => {
  test("rechaza una cantidad negativa", async () => {
    const clienteFalso = {
      query: jest.fn().mockResolvedValue({ rows: [{ id_prestamo: 1 }] }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(clienteFalso);
 
    const res = await request(app)
      .post("/api/prestamos")
      .set("Authorization", auth)
      .send({ id_usuario: 1, id_material: 1, cantidad: -5 });
 
    expect(res.status).toBe(400);
  });
});
 
describe("Rutas de consulta (GET)", () => {
  const rutas = ["/api/usuarios", "/api/materiales", "/api/prestamos"];
 
  test.each(rutas)("GET %s responde 200 con la lista de la base", async (ruta) => {
    const filas = [{ id: 1 }, { id: 2 }];
    pool.query.mockResolvedValue({ rows: filas });
 
    const res = await request(app).get(ruta).set("Authorization", auth);
 
    expect(res.status).toBe(200);
    expect(res.body).toEqual(filas);
  });
 
  test.each(rutas)("GET %s responde 500 si la base falla", async (ruta) => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    pool.query.mockRejectedValue(new Error("fallo de conexión"));
 
    const res = await request(app).get(ruta).set("Authorization", auth);
 
    expect(res.status).toBe(500);
    expect(res.body.mensaje).toMatch(/No se pudieron consultar/);
  });
});
 
describe("POST /api/prestamos (registro)", () => {
  const datosValidos = { id_usuario: 1, id_material: 1, cantidad: 5 };
 
  test("responde 400 si falta el material", async () => {
    const res = await request(app)
      .post("/api/prestamos")
      .set("Authorization", auth)
      .send({ id_usuario: 1, cantidad: 5 });
 
    expect(res.status).toBe(400);
    expect(pool.connect).not.toHaveBeenCalled();
  });
 
  test("responde 201 y confirma la transacción con COMMIT", async () => {
    const consulta = jest.fn().mockResolvedValue({ rows: [{ id_prestamo: 10 }] });
    const clienteFalso = { query: consulta, release: jest.fn() };
    pool.connect.mockResolvedValue(clienteFalso);
 
    const res = await request(app)
      .post("/api/prestamos")
      .set("Authorization", auth)
      .send(datosValidos);
 
    expect(res.status).toBe(201);
    expect(res.body.id_prestamo).toBe(10);
    expect(consulta).toHaveBeenCalledWith("BEGIN");
    expect(consulta).toHaveBeenCalledWith("COMMIT");
    expect(consulta).toHaveBeenCalledTimes(5);
    expect(clienteFalso.release).toHaveBeenCalled();
  });
 
  test("hace ROLLBACK y libera la conexión si falla un INSERT", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
 
    const consulta = jest.fn();
    consulta.mockResolvedValueOnce({}); // BEGIN
    consulta.mockRejectedValueOnce(new Error("fallo en insert")); // INSERT prestamo
    consulta.mockResolvedValueOnce({}); // ROLLBACK
 
    const clienteFalso = { query: consulta, release: jest.fn() };
    pool.connect.mockResolvedValue(clienteFalso);
 
    const res = await request(app)
      .post("/api/prestamos")
      .set("Authorization", auth)
      .send(datosValidos);
 
    expect(res.status).toBe(500);
    expect(consulta).toHaveBeenCalledWith("ROLLBACK");
    expect(consulta).not.toHaveBeenCalledWith("COMMIT");
    expect(clienteFalso.release).toHaveBeenCalled();
  });
 
  test("no expone detalles internos de la base en el error 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
 
    const consulta = jest.fn();
    consulta.mockResolvedValueOnce({}); // BEGIN
    consulta.mockRejectedValueOnce(
      new Error("password authentication failed for user postgres")
    );
    consulta.mockResolvedValueOnce({}); // ROLLBACK
 
    pool.connect.mockResolvedValue({ query: consulta, release: jest.fn() });
 
    const res = await request(app)
      .post("/api/prestamos")
      .set("Authorization", auth)
      .send(datosValidos);
 
    expect(res.body.mensaje).not.toMatch(/password authentication/);
  });
});
 
describe("PUT /api/prestamos/:id/devolver", () => {
  test("responde 404 si el préstamo no existe", async () => {
    const cliente = clienteConRespuestas([
      {}, // BEGIN
      { rows: [] }, // SELECT: no hay préstamo
      {}, // ROLLBACK
    ]);
 
    const res = await request(app)
      .put("/api/prestamos/999/devolver")
      .set("Authorization", auth);
 
    expect(res.status).toBe(404);
    expect(cliente.query).toHaveBeenCalledWith("ROLLBACK");
    expect(cliente.release).toHaveBeenCalled();
  });
 
  test("responde 400 si el préstamo ya fue devuelto", async () => {
    const cliente = clienteConRespuestas([
      {}, // BEGIN
      { rows: [{ estado: "devuelto", id_usuario: 1 }] },
      {}, // ROLLBACK
    ]);
 
    const res = await request(app)
      .put("/api/prestamos/5/devolver")
      .set("Authorization", auth);
 
    expect(res.status).toBe(400);
    expect(cliente.query).toHaveBeenCalledWith("ROLLBACK");
    expect(cliente.query).not.toHaveBeenCalledWith("COMMIT");
    expect(cliente.release).toHaveBeenCalled();
  });
 
  test("responde 200 y confirma con COMMIT cuando todo sale bien", async () => {
    const cliente = clienteConRespuestas([
      {}, // BEGIN
      { rows: [{ estado: "pendiente", id_usuario: 1 }] },
      { rows: [{ id_material: 3, cantidad: 5 }] }, // detalle del préstamo
      {}, // INSERT movimiento
      {}, // UPDATE estado
      {}, // COMMIT
    ]);
 
    const res = await request(app)
      .put("/api/prestamos/5/devolver")
      .set("Authorization", auth);
 
    expect(res.status).toBe(200);
    expect(cliente.query).toHaveBeenCalledWith("COMMIT");
    expect(cliente.release).toHaveBeenCalled();
  });
 
  test("usa una conexión dedicada (pool.connect) para la transacción", async () => {
    clienteConRespuestas([
      {}, // BEGIN
      { rows: [{ estado: "pendiente", id_usuario: 1 }] },
      { rows: [{ id_material: 3, cantidad: 5 }] },
      {}, // INSERT movimiento
      {}, // UPDATE estado
      {}, // COMMIT
    ]);
 
    await request(app)
      .put("/api/prestamos/5/devolver")
      .set("Authorization", auth);
 
    // BEGIN y COMMIT deben ir por la misma conexión, no por pool.query
    expect(pool.connect).toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalledWith("BEGIN");
    expect(pool.query).not.toHaveBeenCalledWith("COMMIT");
  });
});
 
describe("Seguridad: rutas protegidas", () => {
  const rutasProtegidas = ["/api/usuarios", "/api/materiales", "/api/prestamos"];
 
  test.each(rutasProtegidas)("GET %s rechaza peticiones sin token", async (ruta) => {
    // La base responde bien: si la ruta no está protegida, devolverá 200
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
 
    const res = await request(app).get(ruta); // sin encabezado Authorization
 
    expect(res.status).toBe(401);
  });
 
  test("rechaza un token inválido", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
 
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", "Bearer token_falso");
 
    expect(res.status).toBe(401);
  });
});
