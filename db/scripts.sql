\set QUIET on
-- create database de Stockia
CREATE TABLE usuario (
  id_usuario INTEGER PRIMARY KEY,
  contraseña_usuario TEXT NOT NULL,
  name_usuario TEXT NOT NULL,
  apellido_usuario TEXT NOT NULL,
  rol_usuario TEXT NOT NULL
);




CREATE TABLE proveedor (
  id_proveedor INTEGER PRIMARY KEY,
  name_proveedor TEXT NOT NULL,
  telefono_proveedor TEXT NOT NULL,
  ciudad_proveedor TEXT NOT NULL
);




CREATE TABLE materiales (
  id_material INTEGER PRIMARY KEY,
  name_material TEXT NOT NULL,
  unidad_medida TEXT NOT NULL,
  garantia TEXT NOT NULL,
  fecha_llegada TIMESTAMP NOT NULL,
  id_proveedor INTEGER NOT NULL,
  FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor)
);




CREATE TABLE movimientos (
  id_movimientos INTEGER PRIMARY KEY,
  id_instructor INTEGER NOT NULL,
  id_almacenista INTEGER NOT NULL,
  ambiente TEXT NOT NULL,
  cantidad_salida INTEGER NOT NULL,
  cantidad_devolucion INTEGER NOT NULL,
  fecha_movimiento TIMESTAMP NOT NULL,
  estado_material TEXT NOT NULL,
  id_material INTEGER NOT NULL,
  FOREIGN KEY (id_instructor) REFERENCES usuario (id_usuario),
  FOREIGN KEY (id_almacenista) REFERENCES usuario (id_usuario),
  FOREIGN KEY (id_material) REFERENCES materiales (id_material)
);




INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (1, 'Sena1234', 'Santiago', 'Martinez', 'instructor');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (2, 'SOFIA456', 'Laura', 'Garcia', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (3, 'JUAN789', 'Juan', 'Perez', 'coordinador');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (4, 'VANE1947', 'Vanessa', 'Ospitia', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (5, 'PEDRO654', 'Pedro', 'Gomez', 'instructor');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (6, 'MARIA987', 'Maria', 'Rodriguez', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (7, 'CARLOS111', 'Carlos', 'Ruiz', 'almacenista');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (8, 'LUISA222', 'Luisa', 'Torres', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (9, 'ANDRES333', 'Andres', 'Moreno', 'instructor');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (10, 'PAULA444', 'Paula', 'Diaz', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (11, 'JORGE555', 'Jorge', 'Castro', 'coordinador');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (12, 'SARA666', 'Sara', 'Vargas', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (13, 'DAVID777', 'David', 'Mendoza', 'instructor');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (14, 'NATALIA888', 'Natalia', 'Silva', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (15, 'FELIPE999', 'Felipe', 'Ortiz', 'almacenista');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (16, 'KAREN101', 'Karen', 'Navarro', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (17, 'MIGUEL202', 'Miguel', 'Suarez', 'instructor');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (18, 'VALENTINA303', 'Valentina', 'Herrera', 'aprendiz');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (19, 'SEBASTIAN404', 'Sebastian', 'Rojas', 'coordinador');
INSERT INTO usuario (id_usuario, contraseña_usuario, name_usuario, apellido_usuario, rol_usuario)
VALUES (20, 'CAMILA505', 'Camila', 'Ramirez', 'aprendiz');
SELECT * FROM usuario;








INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (1,'cablecol','3102558960','cali');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (2,'Conalcables','3102578866','Bogota');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (3,'HDMI Colombia','3114567890','Medellin');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (4,'Redes y Cables SAS','3123456789','Cali');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (5,'Fibra Optica Nacional','3134567890','Bogota');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (6,'RJ45 Distribuciones','3145678901','Barranquilla');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (7,'Tecno Redes','3156789012','Medellin');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (8,'Switch y Router SAS','3167890123','Pereira');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (9,'Cable UTP Express','3178901234','Manizales');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (10,'Conectores Colombia','3189012345','Ibague');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (11,'Red Lan Solutions','3190123456','Tunja');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (12,'Network Store','3201234567','Villavicencio');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (13,'Data Cable SAS','3212345678','Pasto');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (14,'Equipos de Red LTDA','3223456789','Armenia');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (15,'Insumos Tecnologicos','3234567890','Monteria');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (16,'Fiber Net','3245678901','Sincelejo');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (17,'Cableado Estructurado SAS','3256789012','Popayan');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (18,'Distribuciones RJ45','3267890123','Valledupar');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (19,'Mundo Redes','3278901234','Santa Marta');
INSERT INTO proveedor (id_proveedor, name_proveedor, telefono_proveedor, ciudad_proveedor)
VALUES (20,'Almacen Tecnologico','3289012345','Cucuta');
SELECT * FROM proveedor;




INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (1, 'Cable HDMI', 'metros', '4 meses', NOW(), 2);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (2, 'Cable UTP Cat6', 'metros', '12 meses', NOW(), 9);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (3, 'Conector RJ45', 'unidad', '6 meses', NOW(), 6);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (4, 'Cable VGA', 'metros', '3 meses', NOW(), 1);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (5, 'Cable USB', 'unidad', '6 meses', NOW(), 11);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (6, 'Router TP-Link', 'unidad', '24 meses', NOW(), 8);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (7, 'Switch 24 Puertos', 'unidad', '24 meses', NOW(), 8);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (8, 'Fibra Optica', 'metros', '12 meses', NOW(), 5);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (9, 'Patch Cord', 'unidad', '6 meses', NOW(), 13);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (10, 'Canaleta PVC', 'metros', '12 meses', NOW(), 17);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (11, 'Ponchadora RJ45', 'unidad', '12 meses', NOW(), 18);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (12, 'Tester de Red', 'unidad', '12 meses', NOW(), 14);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (13, 'Rack de Comunicaciones', 'unidad', '36 meses', NOW(), 20);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (14, 'Access Point', 'unidad', '24 meses', NOW(), 12);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (15, 'Multimetro Digital', 'unidad', '24 meses', NOW(), 15);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (16, 'Regleta Electrica', 'unidad', '12 meses', NOW(), 19);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (17, 'Cable de Poder', 'unidad', '6 meses', NOW(), 3);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (18, 'Organizador de Cable', 'unidad', '3 meses', NOW(), 4);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (19, 'Camara IP', 'unidad', '24 meses', NOW(), 10);
INSERT INTO materiales (id_material, name_material, unidad_medida, garantia, fecha_llegada, id_proveedor)
VALUES (20, 'Hub USB', 'unidad', '12 meses', NOW(), 16);
SELECT * FROM materiales;








INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (1, 1, 7, 'ambiente 212', 2, 0, NOW(), 'bueno', 1);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (2, 2, 7, 'ambiente 305', 5, 0, NOW(), 'bueno', 2);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (3, 3, 15, 'ambiente 101', 1, 0, NOW(), 'regular', 3);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (4, 1, 7, 'ambiente 204', 3, 1, NOW(), 'bueno', 4);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (5, 5, 15, 'ambiente 306', 2, 0, NOW(), 'bueno', 5);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (6, 9, 7, 'ambiente 307', 1, 0, NOW(), 'regular', 6);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (7, 13, 15, 'ambiente 105', 4, 0, NOW(), 'bueno', 7);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (8, 17, 7, 'ambiente 108', 2, 0, NOW(), 'bueno', 8);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (9, 1, 15, 'ambiente 201', 1, 0, NOW(), 'dañado', 9);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (10, 5, 7, 'ambiente 202', 6, 0, NOW(), 'bueno', 10);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (11, 9, 15, 'ambiente 203', 2, 1, NOW(), 'regular', 11);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (12, 13, 7, 'ambiente 204', 3, 0, NOW(), 'bueno', 12);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (13, 17, 15, 'ambiente 205', 2, 0, NOW(), 'bueno', 13);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (14, 1, 7, 'ambiente 206', 5, 0, NOW(), 'regular', 14);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (15, 5, 15, 'ambiente 207', 1, 0, NOW(), 'bueno', 15);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (16, 9, 7, 'ambiente 208', 4, 0, NOW(), 'bueno', 16);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (17, 13, 15, 'ambiente 209', 2, 1, NOW(), 'dañado', 17);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (18, 17, 7, 'ambiente 210', 3, 0, NOW(), 'bueno', 18);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (19, 1, 15, 'ambiente 211', 1, 0, NOW(), 'regular', 19);
INSERT INTO movimientos (id_movimientos, id_instructor, id_almacenista, ambiente, cantidad_salida, cantidad_devolucion, fecha_movimiento, estado_material, id_material)
VALUES (20, 5, 7, 'ambiente 212', 2, 0, NOW(), 'bueno', 20);
SELECT * FROM movimientos;


-- DELETE FROM: elimina un registro (DELETE FROM usuarios WHERE nombre = 'SOFHIA456';) 
-- DROP TABLE/DATABASE: elimina toda una tabla o base de datos COMPLETAMENTE (DROP TABLE movimientos; | DROP DATABASE proyecto;)
-- no se puede eliminar algo si tiene llave foranea 
-- INTEGER numeros enteros 
-- TIMESTAMP fecha y hora
-- PRIMARY KEY → llave primaria (no se repite).
-- NOT NULL → el campo es obligatorio
--REFERENCES significa "hace referencia a"
-- INSERT INTO Agregar datos
-- SELECT consultar datos 
--WHERE filtrar la informacion
-- update modificar datos , sin el WHERE modifica todos los datos
-- Consultar (SELECT)
-- Modificar (UPDATE)
-- Eliminar (DELETE)
