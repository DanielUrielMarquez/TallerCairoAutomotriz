-- schema.sql - Taller Cairo

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password VARCHAR(120) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('administrador', 'trabajador'))
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  email VARCHAR(120) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS trabajadores (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL,
  especialidad VARCHAR(80) DEFAULT 'General'
);

CREATE TABLE IF NOT EXISTS vehiculos (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  marca VARCHAR(80) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  patente VARCHAR(20) NOT NULL UNIQUE,
  fecha_entrada DATE NOT NULL,
  fecha_limite DATE NOT NULL,
  fecha_salida DATE,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('en_taller', 'reingresado', 'entregado'))
);

CREATE TABLE IF NOT EXISTS tareas (
  id SERIAL PRIMARY KEY,
  vehiculo_id INT NOT NULL REFERENCES vehiculos(id) ON DELETE RESTRICT,
  trabajador_id INT NOT NULL REFERENCES trabajadores(id) ON DELETE RESTRICT,
  descripcion TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('abierta', 'en_proceso', 'cerrada')),
  prioridad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
  fecha_limite DATE NOT NULL,
  total NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recursos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('repuesto', 'insumo', 'herramienta')),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  minimo INT NOT NULL DEFAULT 0 CHECK (minimo >= 0)
);

CREATE TABLE IF NOT EXISTS asistencias (
  id SERIAL PRIMARY KEY,
  trabajador_id INT NOT NULL REFERENCES trabajadores(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente', 'tarde')),
  CONSTRAINT uq_asistencia_trabajador_fecha UNIQUE (trabajador_id, fecha)
);

CREATE TABLE IF NOT EXISTS catalogo_marcas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS catalogo_modelos (
  id SERIAL PRIMARY KEY,
  marca_id INT NOT NULL REFERENCES catalogo_marcas(id) ON DELETE CASCADE,
  nombre VARCHAR(80) NOT NULL,
  UNIQUE (marca_id, nombre)
);

CREATE TABLE IF NOT EXISTS catalogo_repuestos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(60) UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  precio_referencia NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compat_modelo_repuesto (
  modelo_id INT NOT NULL REFERENCES catalogo_modelos(id) ON DELETE CASCADE,
  repuesto_id INT NOT NULL REFERENCES catalogo_repuestos(id) ON DELETE CASCADE,
  PRIMARY KEY (modelo_id, repuesto_id)
);

CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(30) NOT NULL UNIQUE,
  cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  vehiculo_id INT NOT NULL REFERENCES vehiculos(id) ON DELETE RESTRICT,
  trabajador_id INT NOT NULL REFERENCES trabajadores(id) ON DELETE RESTRICT,
  descripcion_trabajo TEXT NOT NULL,
  horas_estimadas NUMERIC(8,2) NOT NULL CHECK (horas_estimadas >= 0),
  valor_hora NUMERIC(12,2) NOT NULL CHECK (valor_hora >= 0),
  total_mano_obra NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_repuestos NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_general NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_proceso', 'cerrada')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orden_repuestos (
  id SERIAL PRIMARY KEY,
  orden_id INT NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  repuesto_id INT NOT NULL REFERENCES catalogo_repuestos(id) ON DELETE RESTRICT,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0
);

ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS orden_id INT REFERENCES ordenes(id) ON DELETE SET NULL;

-- Indices utiles
CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente_id ON vehiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_vehiculo_id ON tareas(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_tareas_trabajador_id ON tareas(trabajador_id);
CREATE INDEX IF NOT EXISTS idx_tareas_orden_id ON tareas(orden_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_trabajador_id ON asistencias(trabajador_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_id ON ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_vehiculo_id ON ordenes(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_trabajador_id ON ordenes(trabajador_id);

-- Datos iniciales
INSERT INTO usuarios (id, username, password, rol)
VALUES
  (1, 'admin', '1234', 'administrador'),
  (2, 'mecanico1', '1234', 'trabajador')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clientes (id, nombre, telefono, email)
VALUES
  (1, 'Juan Perez', '1122334455', 'juan@mail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO trabajadores (id, usuario_id, nombre, especialidad)
VALUES
  (1, 2, 'Carlos Mena', 'Motor'),
  (2, NULL, 'Luis Rios', 'Electricidad')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehiculos (id, cliente_id, marca, modelo, patente, fecha_entrada, fecha_limite, fecha_salida, estado)
VALUES
  (1, 1, 'Ford', 'Focus', 'AA123BB', '2026-02-20', '2026-02-25', NULL, 'en_taller')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tareas (id, vehiculo_id, trabajador_id, descripcion, estado, prioridad, fecha_limite, total)
VALUES
  (1, 1, 1, 'Cambio de aceite', 'abierta', 'media', '2026-02-24', 15000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recursos (id, nombre, tipo, stock, minimo)
VALUES
  (1, 'Filtro de aceite', 'repuesto', 12, 5),
  (2, 'Aceite 5W30', 'insumo', 20, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO asistencias (id, trabajador_id, fecha, estado)
VALUES
  (1, 1, '2026-02-20', 'presente')
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_marcas (id, nombre)
VALUES
  (1, 'Ford'),
  (2, 'Toyota'),
  (3, 'Volkswagen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_modelos (id, marca_id, nombre)
VALUES
  (1, 1, 'Focus'),
  (2, 1, 'Fiesta'),
  (3, 2, 'Corolla'),
  (4, 3, 'Gol')
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_repuestos (id, codigo, nombre, tipo, precio_referencia)
VALUES
  (1, 'FO-FILT-ACE', 'Filtro de aceite', 'repuesto', 12000),
  (2, 'FO-ACE-5W30', 'Aceite 5W30', 'insumo', 8500),
  (3, 'FR-PAST-DEL', 'Pastillas de freno delanteras', 'repuesto', 45000),
  (4, 'BUJ-STD-4', 'Juego de bujias x4', 'repuesto', 30000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO compat_modelo_repuesto (modelo_id, repuesto_id)
VALUES
  (1, 1), (1, 2), (1, 3),
  (2, 1), (2, 2), (2, 4),
  (3, 1), (3, 2),
  (4, 1), (4, 2), (4, 3)
ON CONFLICT DO NOTHING;

-- Ajustar secuencias
SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id) FROM clientes), 1), true);
SELECT setval('trabajadores_id_seq', COALESCE((SELECT MAX(id) FROM trabajadores), 1), true);
SELECT setval('vehiculos_id_seq', COALESCE((SELECT MAX(id) FROM vehiculos), 1), true);
SELECT setval('tareas_id_seq', COALESCE((SELECT MAX(id) FROM tareas), 1), true);
SELECT setval('recursos_id_seq', COALESCE((SELECT MAX(id) FROM recursos), 1), true);
SELECT setval('asistencias_id_seq', COALESCE((SELECT MAX(id) FROM asistencias), 1), true);
SELECT setval('catalogo_marcas_id_seq', COALESCE((SELECT MAX(id) FROM catalogo_marcas), 1), true);
SELECT setval('catalogo_modelos_id_seq', COALESCE((SELECT MAX(id) FROM catalogo_modelos), 1), true);
SELECT setval('catalogo_repuestos_id_seq', COALESCE((SELECT MAX(id) FROM catalogo_repuestos), 1), true);
SELECT setval('ordenes_id_seq', COALESCE((SELECT MAX(id) FROM ordenes), 1), true);
SELECT setval('orden_repuestos_id_seq', COALESCE((SELECT MAX(id) FROM orden_repuestos), 1), true);
