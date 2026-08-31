\set QUIET on
-- create database de Stockia
CREATE TABLE categoria (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_categoria VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO categoria (nombre_categoria) 
VALUES
('Herramientas'),
('Material electrico'),
('Tornilleria'),
('Elementos de seguridad'),
('Material de mantenimiento');


CREATE TABLE proveedor (
    id_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_proveedor VARCHAR(100) UNIQUE NOT NULL,
    telefono_proveedor VARCHAR(20) NOT NULL,
    correo_proveedor VARCHAR(100) UNIQUE NOT NULL
);

CREATE TYPE tipo_rol AS ENUM (
    'Coordinador', 
    'Instructor'
);

CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    apellido_usuario VARCHAR(100) NOT NULL,
    documento_usuario VARCHAR(20) UNIQUE NOT NULL,
    correo_usuario VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(100) NOT NULL,
    rol tipo_rol NOT NULL
);

CREATE TABLE material (
    id_material INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_material VARCHAR(100) UNIQUE NOT NULL,
    descripcion_material TEXT,
    id_categoria INTEGER REFERENCES categoria(id_categoria) NOT NULL
);
CREATE TABLE detalle_proveedor (
    id_detalle_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    id_proveedor INTEGER REFERENCES proveedor(id_proveedor) NOT NULL,
    fecha_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stock_minimo INTEGER CHECK (stock_minimo >= 0) NOT NULL,
    cantidad INTEGER CHECK (cantidad >= 0) NOT NULL
);


CREATE TABLE prestamo (
    id_prestamo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuario(id_usuario) NOT NULL,
    fecha_prestamo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion TIMESTAMP,
    estado VARCHAR(10) CHECK (estado IN ('pendiente', 'devuelto')) NOT NULL
);

CREATE TABLE detalle_prestamo (
    id_prestamo INTEGER REFERENCES prestamo(id_prestamo) NOT NULL,
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    cantidad INTEGER CHECK (cantidad > 0) NOT NULL
);

CREATE TABLE movimiento (
    id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_prestamo INTEGER REFERENCES prestamo(id_prestamo),
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    cantidad INTEGER
        CHECK (cantidad > 0) NOT NULL,
    observacion TEXT,
    fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INTEGER REFERENCES usuario(id_usuario) NOT NULL
);

CREATE TABLE tipo_movimiento (
    id_tipo_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo_movimiento VARCHAR(10) 
        CHECK (tipo_movimiento IN ('entrada', 'salida')) NOT NULL
);

INSERT INTO usuario (nombre_usuario, apellido_usuario, documento_usuario, correo_usuario, contrasena_hash, rol)
VALUES
('Pedro', 'Apellido6', '100000006', 'USUARIO6@GMAIL.COM', 'hashed_password6', 'Coordinador'),
('Sofia', 'Apellido7', '100000007', 'USUARIO7@GMAIL.COM', 'hashed_password7', 'Instructor'),
('Andres', 'Apellido8', '100000008', 'USUARIO8@GMAIL.COM', 'hashed_password8', 'Coordinador'),
('Laura', 'Apellido9', '100000009', 'USUARIO9@GMAIL.COM', 'hashed_password9', 'Instructor'),
('Diego', 'Apellido10', '100000010', 'USUARIO10@GMAIL.COM', 'hashed_password10', 'Coordinador'),
('Camila', 'Apellido11', '100000011', 'USUARIO11@GMAIL.COM', 'hashed_password11', 'Instructor'),
('Sergio', 'Apellido12', '100000012', 'USUARIO12@GMAIL.COM', 'hashed_password12', 'Coordinador'),
('Valentina', 'Apellido13', '100000013', 'USUARIO13@GMAIL.COM', 'hashed_password13', 'Instructor'),
('Oscar', 'Apellido14', '100000014', 'USUARIO14@GMAIL.COM', 'hashed_password14', 'Coordinador'),
('Paola', 'Apellido15', '100000015', 'USUARIO15@GMAIL.COM', 'hashed_password15', 'Instructor'),
('Fernando', 'Apellido16', '100000016', 'USUARIO16@GMAIL.COM', 'hashed_password16', 'Coordinador'),
('Daniela', 'Apellido17', '100000017', 'USUARIO17@GMAIL.COM', 'hashed_password17', 'Instructor'),
('Ricardo', 'Apellido18', '100000018', 'USUARIO18@GMAIL.COM', 'hashed_password18', 'Coordinador'),
('Natalia', 'Apellido19', '100000019', 'USUARIO19@GMAIL.COM', 'hashed_password19', 'Instructor'),
('Miguel', 'Apellido20', '100000020', 'USUARIO20@GMAIL.COM', 'hashed_password20', 'Coordinador'),
('Carolina', 'Apellido21', '100000021', 'USUARIO21@GMAIL.COM', 'hashed_password21', 'Instructor'),
('Jorge', 'Apellido22', '100000022', 'USUARIO22@GMAIL.COM', 'hashed_password22', 'Coordinador'),
('Adriana', 'Apellido23', '100000023', 'USUARIO23@GMAIL.COM', 'hashed_password23', 'Instructor'),
('Felipe', 'Apellido24', '100000024', 'USUARIO24@GMAIL.COM', 'hashed_password24', 'Coordinador'),
('Alejandra', 'Apellido25', '100000025', 'USUARIO25@GMAIL.COM', 'hashed_password25', 'Instructor'),
('Ivan', 'Apellido26', '100000026', 'USUARIO26@GMAIL.COM', 'hashed_password26', 'Coordinador'),
('Monica', 'Apellido27', '100000027', 'USUARIO27@GMAIL.COM', 'hashed_password27', 'Instructor'),
('Gustavo', 'Apellido28', '100000028', 'USUARIO28@GMAIL.COM', 'hashed_password28', 'Coordinador'),
('Patricia', 'Apellido29', '100000029', 'USUARIO29@GMAIL.COM', 'hashed_password29', 'Instructor'),
('Julian', 'Apellido30', '100000030', 'USUARIO30@GMAIL.COM', 'hashed_password30', 'Coordinador');

INSERT INTO proveedor (nombre_proveedor, telefono_proveedor, correo_proveedor)
VALUES
('Proveedor F', '100000006','proveedorf@gmail.com'),
('Proveedor G', '100000007','proveedorg@gmail.com'),
('Proveedor H', '100000008','proveedorh@gmail.com'),
('Proveedor I', '100000009','proveedori@gmail.com'),
('Proveedor J', '100000010','proveedorj@gmail.com'),
('Proveedor K', '100000011','proveedork@gmail.com'),
('Proveedor L', '100000012','proveedorl@gmail.com'),
('Proveedor M', '100000013','proveedorm@gmail.com'),
('Proveedor N', '100000014','proveedorn@gmail.com'),
('Proveedor O', '100000015','proveedoro@gmail.com'),
('Proveedor P', '100000016','proveedorp@gmail.com'),
('Proveedor Q', '100000017','proveedorq@gmail.com'),
('Proveedor R', '100000018','proveedorr@gmail.com'),
('Proveedor S', '100000019','proveedors@gmail.com'),
('Proveedor T', '100000020','proveedort@gmail.com'),
('Proveedor U', '100000021','proveedoru@gmail.com'),
('Proveedor V', '100000022','proveedorv@gmail.com'),
('Proveedor W', '100000023','proveedorw@gmail.com'),
('Proveedor X', '100000024','proveedorx@gmail.com'),
('Proveedor Y', '100000025','proveedory@gmail.com'),
('Proveedor Z', '100000026','proveedorz@gmail.com'),
('Proveedor AA', '100000027','proveedoraa@gmail.com'),
('Proveedor AB', '100000028','proveedorab@gmail.com'),
('Proveedor AC', '100000029','proveedorac@gmail.com'),
('Proveedor AD', '100000030','proveedorad@gmail.com');

INSERT INTO material (nombre_material, descripcion_material, id_categoria)
VALUES
('Taladro', 'Descripcion de taladro', 1),
('Cable electrico 12AWG', 'Descripcion de cable electrico 12awg', 2),
('Tornillo 1/4', 'Descripcion de tornillo 1/4', 3),
('Casco de seguridad', 'Descripcion de casco de seguridad', 4),
('Aceite lubricante', 'Descripcion de aceite lubricante', 5),
('Martillo', 'Descripcion de martillo', 1),
('Cinta aislante', 'Descripcion de cinta aislante', 2),
('Tuerca hexagonal', 'Descripcion de tuerca hexagonal', 3),
('Guantes de seguridad', 'Descripcion de guantes de seguridad', 4),
('Grasa industrial', 'Descripcion de grasa industrial', 5),
('Destornillador plano', 'Descripcion de destornillador plano', 1),
('Enchufe electrico', 'Descripcion de enchufe electrico', 2),
('Arandela plana', 'Descripcion de arandela plana', 3),
('Gafas de seguridad', 'Descripcion de gafas de seguridad', 4),
('Silicona liquida', 'Descripcion de silicona liquida', 5),
('Sierra manual', 'Descripcion de sierra manual', 1),
('Interruptor electrico', 'Descripcion de interruptor electrico', 2),
('Perno de acero', 'Descripcion de perno de acero', 3),
('Chaleco reflectivo', 'Descripcion de chaleco reflectivo', 4),
('Desengrasante', 'Descripcion de desengrasante', 5),
('Llave inglesa', 'Descripcion de llave inglesa', 1),
('Bombillo LED', 'Descripcion de bombillo led', 2),
('Clavo de acero', 'Descripcion de clavo de acero', 3),
('Botas de seguridad', 'Descripcion de botas de seguridad', 4),
('Pegamento industrial', 'Descripcion de pegamento industrial', 5),
('Alicate', 'Descripcion de alicate', 1),
('Breaker electrico', 'Descripcion de breaker electrico', 2),
('Remache', 'Descripcion de remache', 3),
('Tapones auditivos', 'Descripcion de tapones auditivos', 4),
('Solvente industrial', 'Descripcion de solvente industrial', 5);

INSERT INTO detalle_proveedor (id_material, id_proveedor, fecha_compra, stock_minimo, cantidad)
VALUES
(1, 1, DEFAULT, 9, 18),
(2, 2, DEFAULT, 5, 47),
(3, 3, DEFAULT, 10, 33),
(4, 4, DEFAULT, 5, 17),
(5, 5, DEFAULT, 1, 34),
(6, 6, DEFAULT, 5, 18),
(7, 7, DEFAULT, 10, 59),
(8, 8, DEFAULT, 4, 43),
(9, 9, DEFAULT, 2, 16),
(10, 10, DEFAULT, 10, 22),
(11, 11, DEFAULT, 10, 50),
(12, 12, DEFAULT, 1, 16),
(13, 13, DEFAULT, 10, 40),
(14, 14, DEFAULT, 9, 50),
(15, 15, DEFAULT, 4, 51),
(16, 16, DEFAULT, 4, 28),
(17, 17, DEFAULT, 5, 34),
(18, 18, DEFAULT, 10, 14),
(19, 19, DEFAULT, 7, 37),
(20, 20, DEFAULT, 6, 56),
(21, 21, DEFAULT, 5, 19),
(22, 22, DEFAULT, 3, 3),
(23, 23, DEFAULT, 4, 50),
(24, 24, DEFAULT, 2, 48),
(25, 25, DEFAULT, 9, 57),
(26, 26, DEFAULT, 1, 18),
(27, 27, DEFAULT, 7, 44),
(28, 28, DEFAULT, 2, 7),
(29, 29, DEFAULT, 8, 48),
(30, 30, DEFAULT, 7, 11);

INSERT INTO prestamo (id_usuario, fecha_prestamo, fecha_devolucion, estado)
VALUES
(1, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(2, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(3, DEFAULT, NULL, 'pendiente'),
(4, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(5, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(6, DEFAULT, NULL, 'pendiente'),
(7, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(8, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(9, DEFAULT, NULL, 'pendiente'),
(10, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(11, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(12, DEFAULT, NULL, 'pendiente'),
(13, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(14, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(15, DEFAULT, NULL, 'pendiente'),
(16, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(17, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(18, DEFAULT, NULL, 'pendiente'),
(19, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(20, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(21, DEFAULT, NULL, 'pendiente'),
(22, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(23, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(24, DEFAULT, NULL, 'pendiente'),
(25, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(26, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(27, DEFAULT, NULL, 'pendiente'),
(28, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(29, DEFAULT, CURRENT_TIMESTAMP, 'devuelto'),
(30, DEFAULT, NULL, 'pendiente');

INSERT INTO detalle_prestamo (id_prestamo, id_material, cantidad)
VALUES
(1, 1, 1),
(2, 2, 4),
(3, 3, 3),
(4, 4, 2),
(5, 5, 2),
(6, 6, 1),
(7, 7, 3),
(8, 8, 1),
(9, 9, 3),
(10, 10, 5),
(11, 11, 2),
(12, 12, 5),
(13, 13, 2),
(14, 14, 3),
(15, 15, 4),
(16, 16, 4),
(17, 17, 4),
(18, 18, 4),
(19, 19, 5),
(20, 20, 4),
(21, 21, 1),
(22, 22, 1),
(23, 23, 1),
(24, 24, 4),
(25, 25, 3),
(26, 26, 1),
(27, 27, 1),
(28, 28, 1),
(29, 29, 2),
(30, 30, 2);

INSERT INTO tipo_movimiento (tipo_movimiento)
VALUES
('entrada'),
('salida');

INSERT INTO movimiento (id_prestamo, id_material, cantidad, observacion, fecha_movimiento, id_usuario)
VALUES
(NULL, 1, 9, 'Movimiento de prueba 1', DEFAULT, 1),
(2, 2, 8, 'Movimiento de prueba 2', DEFAULT, 2),
(NULL, 3, 2, 'Movimiento de prueba 3', DEFAULT, 3),
(4, 4, 8, 'Movimiento de prueba 4', DEFAULT, 4),
(NULL, 5, 3, 'Movimiento de prueba 5', DEFAULT, 5),
(6, 6, 17, 'Movimiento de prueba 6', DEFAULT, 6),
(NULL, 7, 12, 'Movimiento de prueba 7', DEFAULT, 7),
(8, 8, 7, 'Movimiento de prueba 8', DEFAULT, 8),
(NULL, 9, 12, 'Movimiento de prueba 9', DEFAULT, 9),
(10, 10, 5, 'Movimiento de prueba 10', DEFAULT, 10),
(NULL, 11, 1, 'Movimiento de prueba 11', DEFAULT, 11),
(12, 12, 10, 'Movimiento de prueba 12', DEFAULT, 12),
(NULL, 13, 2, 'Movimiento de prueba 13', DEFAULT, 13),
(14, 14, 12, 'Movimiento de prueba 14', DEFAULT, 14),
(NULL, 15, 17, 'Movimiento de prueba 15', DEFAULT, 15),
(16, 16, 1, 'Movimiento de prueba 16', DEFAULT, 16),
(NULL, 17, 18, 'Movimiento de prueba 17', DEFAULT, 17),
(18, 18, 17, 'Movimiento de prueba 18', DEFAULT, 18),
(NULL, 19, 19, 'Movimiento de prueba 19', DEFAULT, 19),
(20, 20, 5, 'Movimiento de prueba 20', DEFAULT, 20),
(NULL, 21, 8, 'Movimiento de prueba 21', DEFAULT, 21),
(22, 22, 11, 'Movimiento de prueba 22', DEFAULT, 22),
(NULL, 23, 14, 'Movimiento de prueba 23', DEFAULT, 23),
(24, 24, 17, 'Movimiento de prueba 24', DEFAULT, 24),
(NULL, 25, 12, 'Movimiento de prueba 25', DEFAULT, 25),
(26, 26, 19, 'Movimiento de prueba 26', DEFAULT, 26),
(NULL, 27, 7, 'Movimiento de prueba 27', DEFAULT, 27),
(28, 28, 16, 'Movimiento de prueba 28', DEFAULT, 28),
(NULL, 29, 20, 'Movimiento de prueba 29', DEFAULT, 29),
(30, 30, 16, 'Movimiento de prueba 30', DEFAULT, 30);