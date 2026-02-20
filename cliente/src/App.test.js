import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./services/api", () => ({
  api: {
    login: jest.fn().mockResolvedValue({
      token: "fake-token-1",
      usuario: { id: 1, username: "admin", rol: "administrador" }
    }),
    getResumen: jest.fn().mockResolvedValue({
      clientes: 1,
      vehiculosEnTaller: 1,
      tareasAbiertas: 1,
      tareasEnProceso: 0,
      tareasCerradas: 0,
      tareasVencidas: 0,
      recursosStockBajo: 0
    }),
    getClientes: jest.fn().mockResolvedValue([
      { id: 1, nombre: "Juan Perez", telefono: "1122334455", email: "juan@mail.com" }
    ]),
    getVehiculos: jest.fn().mockResolvedValue([
      { id: 1, patente: "AA123BB", marca: "Ford", modelo: "Focus", estado: "en_taller", cliente: { nombre: "Juan Perez" } }
    ]),
    getTareas: jest.fn().mockResolvedValue([
      { id: 1, descripcion: "Cambio de aceite", estado: "abierta", prioridad: "media", vehiculo: { patente: "AA123BB" } }
    ]),
    getRecursos: jest.fn().mockResolvedValue([]),
    getAsistencias: jest.fn().mockResolvedValue([]),
    createCliente: jest.fn(),
    createVehiculo: jest.fn(),
    registrarSalidaVehiculo: jest.fn(),
    createTarea: jest.fn(),
    updateEstadoTarea: jest.fn(),
    createRecurso: jest.fn(),
    consumirRecurso: jest.fn(),
    createAsistencia: jest.fn()
  }
}));

test("muestra pantalla de login", () => {
  render(<App />);
  expect(screen.getByText(/Taller Cairo/i)).toBeInTheDocument();
  expect(screen.getByText(/Ingresar al sistema/i)).toBeInTheDocument();
});
