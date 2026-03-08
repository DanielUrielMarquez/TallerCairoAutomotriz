import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { OPCIONES_TAREA } from "../../models/ui.constants";

const VEHICULO_NUEVO = "__nuevo__";
const CLIENTE_NUEVO = "__nuevo_cliente__";

function OrdenesPanel({ tab, clientes, vehiculos, trabajadores, setError }) {
  const [ordenes, setOrdenes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [repuestosCompatibles, setRepuestosCompatibles] = useState([]);
  const [busquedaMarca, setBusquedaMarca] = useState("");
  const [busquedaModelo, setBusquedaModelo] = useState("");
  const [busquedaRepuesto, setBusquedaRepuesto] = useState("");
  const [otraDescripcionTrabajo, setOtraDescripcionTrabajo] = useState("");
  const [mostrarListaMarca, setMostrarListaMarca] = useState(false);
  const [mostrarListaModelo, setMostrarListaModelo] = useState(false);
  const [vehiculoNuevo, setVehiculoNuevo] = useState({
    patente: "",
    marca: "",
    modelo: ""
  });
  const [clienteNuevo, setClienteNuevo] = useState({
    nombre: "",
    telefono: "",
    email: ""
  });

  const [form, setForm] = useState({
    clienteId: "",
    vehiculoId: "",
    trabajadorId: "",
    descripcionTrabajo: "",
    horasEstimadas: "",
    valorHora: "",
    marcaId: "",
    modeloId: "",
    repuestos: []
  });
  const vehiculoSeleccionado = vehiculos.find((v) => String(v.id) === String(form.vehiculoId));
  const esClienteNuevo = form.clienteId === CLIENTE_NUEVO;
  const esVehiculoNuevo = form.vehiculoId === VEHICULO_NUEVO;
  const usaVehiculoExistente = Boolean(form.vehiculoId) && !esVehiculoNuevo;

  const totalManoObra = useMemo(() => {
    const h = Number(form.horasEstimadas || 0);
    const v = Number(form.valorHora || 0);
    return h * v;
  }, [form.horasEstimadas, form.valorHora]);

  const totalRepuestos = useMemo(
    () =>
      form.repuestos.reduce(
        (acc, r) => acc + Number(r.cantidad || 0) * Number(r.precioUnitario || 0),
        0
      ),
    [form.repuestos]
  );

  const totalGeneral = totalManoObra + totalRepuestos;
  const vehiculosDelCliente = useMemo(() => {
    if (!form.clienteId) return [];
    return vehiculos.filter((v) => Number(v.clienteId) === Number(form.clienteId));
  }, [vehiculos, form.clienteId]);

  async function cargarOrdenes() {
    const res = await api.getOrdenes();
    if (res.error) return setError(res.error);
    setOrdenes(Array.isArray(res) ? res : []);
  }

  async function cargarMarcas(q = "") {
    const res = await api.getMarcas(q);
    if (res.error) return;
    setMarcas(Array.isArray(res) ? res : []);
  }

  async function cargarModelos(marcaId, q = "") {
    if (!marcaId) return setModelos([]);
    const res = await api.getModelos(marcaId, q);
    if (res.error) return;
    setModelos(Array.isArray(res) ? res : []);
  }

  async function cargarRepuestos(modeloId, q = "") {
    if (!modeloId) return setRepuestosCompatibles([]);
    const res = await api.getRepuestosCompatibles(modeloId, q);
    if (res.error) return;
    setRepuestosCompatibles(Array.isArray(res) ? res : []);
  }

  useEffect(() => {
    if (tab !== "ordenes") return;
    cargarOrdenes();
    cargarMarcas(busquedaMarca);
  }, [tab]);

  useEffect(() => {
    if (tab !== "ordenes") return;
    const t = setTimeout(() => cargarMarcas(busquedaMarca), 250);
    return () => clearTimeout(t);
  }, [busquedaMarca, tab]);

  useEffect(() => {
    if (tab !== "ordenes") return;
    const t = setTimeout(() => cargarModelos(form.marcaId, busquedaModelo), 250);
    return () => clearTimeout(t);
  }, [form.marcaId, busquedaModelo, tab]);

  useEffect(() => {
    if (tab !== "ordenes") return;
    const t = setTimeout(() => cargarRepuestos(form.modeloId, busquedaRepuesto), 250);
    return () => clearTimeout(t);
  }, [form.modeloId, busquedaRepuesto, tab]);

  useEffect(() => {
    if (tab !== "ordenes") return;
    if (!vehiculoSeleccionado) return;

    const syncCatalogoDesdeVehiculo = async () => {
      const nombreMarca = String(vehiculoSeleccionado.marca || "").trim();
      const nombreModelo = String(vehiculoSeleccionado.modelo || "").trim();
      if (!nombreMarca || !nombreModelo) return;

      setBusquedaMarca(nombreMarca);
      setBusquedaModelo(nombreModelo);

      const marcasRes = await api.getMarcas(nombreMarca);
      if (marcasRes.error || !Array.isArray(marcasRes)) return;
      const marca = marcasRes.find(
        (m) => String(m.nombre || "").toLowerCase() === nombreMarca.toLowerCase()
      );
      if (!marca) return;

      const modelosRes = await api.getModelos(marca.id, nombreModelo);
      if (modelosRes.error || !Array.isArray(modelosRes)) return;
      const modelo = modelosRes.find(
        (m) => String(m.nombre || "").toLowerCase() === nombreModelo.toLowerCase()
      );

      setForm((prev) => ({
        ...prev,
        marcaId: String(marca.id),
        modeloId: modelo ? String(modelo.id) : prev.modeloId
      }));
    };

    syncCatalogoDesdeVehiculo();
  }, [tab, vehiculoSeleccionado]);

  function agregarRepuesto(r) {
    const existe = form.repuestos.find((x) => x.repuestoId === r.id);
    if (existe) return;
    setForm((prev) => ({
      ...prev,
      repuestos: [
        ...prev.repuestos,
        {
          repuestoId: r.id,
          nombre: r.nombre,
          cantidad: 1,
          precioUnitario: Number(r.precioReferencia || 0)
        }
      ]
    }));
  }

  function quitarRepuesto(repuestoId) {
    setForm((prev) => ({
      ...prev,
      repuestos: prev.repuestos.filter((x) => x.repuestoId !== repuestoId)
    }));
  }

  function actualizarRepuesto(repuestoId, campo, valor) {
    setForm((prev) => ({
      ...prev,
      repuestos: prev.repuestos.map((x) =>
        x.repuestoId === repuestoId ? { ...x, [campo]: Number(valueOrZero(valor)) } : x
      )
    }));
  }

  function valueOrZero(v) {
    return v === "" ? 0 : v;
  }

  function handleMarcaInput(value) {
    setBusquedaMarca(value);
    if (esVehiculoNuevo) {
      setVehiculoNuevo((prev) => ({ ...prev, marca: value }));
    }
    const match = marcas.find((m) => m.nombre.toLowerCase() === value.trim().toLowerCase());

    if (!match) {
      setForm((prev) => ({
        ...prev,
        marcaId: "",
        modeloId: "",
        repuestos: []
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      marcaId: String(match.id),
      modeloId: "",
      repuestos: []
    }));
    setBusquedaModelo("");
  }

  function handleModeloInput(value) {
    setBusquedaModelo(value);
    if (esVehiculoNuevo) {
      setVehiculoNuevo((prev) => ({ ...prev, modelo: value }));
    }
    const match = modelos.find((m) => m.nombre.toLowerCase() === value.trim().toLowerCase());

    if (!match) {
      setForm((prev) => ({ ...prev, modeloId: "", repuestos: [] }));
      return;
    }

    setForm((prev) => ({ ...prev, modeloId: String(match.id), repuestos: [] }));
  }

  function seleccionarMarca(marca) {
    setBusquedaMarca(marca.nombre);
    if (esVehiculoNuevo) {
      setVehiculoNuevo((prev) => ({ ...prev, marca: marca.nombre }));
    }
    setForm((prev) => ({
      ...prev,
      marcaId: String(marca.id),
      modeloId: "",
      repuestos: []
    }));
    setBusquedaModelo("");
    setMostrarListaMarca(false);
  }

  function seleccionarModelo(modelo) {
    setBusquedaModelo(modelo.nombre);
    if (esVehiculoNuevo) {
      setVehiculoNuevo((prev) => ({ ...prev, modelo: modelo.nombre }));
    }
    setForm((prev) => ({
      ...prev,
      modeloId: String(modelo.id),
      repuestos: []
    }));
    setMostrarListaModelo(false);
  }

  function limpiarMarca() {
    setBusquedaMarca("");
    setBusquedaModelo("");
    setMostrarListaMarca(false);
    setMostrarListaModelo(false);
    setForm((prev) => ({
      ...prev,
      marcaId: "",
      modeloId: "",
      repuestos: []
    }));
    if (esVehiculoNuevo) {
      setVehiculoNuevo((prev) => ({ ...prev, marca: "", modelo: "" }));
    }
  }

  function limpiarModelo() {
    setBusquedaModelo("");
    setMostrarListaModelo(false);
    setForm((prev) => ({
      ...prev,
      modeloId: "",
      repuestos: []
    }));
    if (esVehiculoNuevo) {
      setVehiculoNuevo((prev) => ({ ...prev, modelo: "" }));
    }
  }

  async function crearOrden(e) {
    e.preventDefault();
    setError("");

    const descripcionFinal =
      form.descripcionTrabajo === "__otra__"
        ? otraDescripcionTrabajo.trim()
        : form.descripcionTrabajo;

    if (!form.clienteId) return setError("Seleccioná un cliente");
    if (!form.trabajadorId) return setError("Seleccioná un trabajador");
    if (!descripcionFinal) return setError("La descripcion del trabajo es obligatoria");

    let clienteIdFinal = Number(form.clienteId);

    if (esClienteNuevo) {
      if (!clienteNuevo.nombre.trim() || !clienteNuevo.telefono.trim()) {
        return setError("Para cliente nuevo completá nombre y teléfono");
      }

      const creadoCliente = await api.createCliente({
        nombre: clienteNuevo.nombre.trim(),
        telefono: clienteNuevo.telefono.trim(),
        email: clienteNuevo.email.trim()
      });
      if (creadoCliente.error) return setError(creadoCliente.error);
      clienteIdFinal = Number(creadoCliente.id);
    }

    let vehiculoIdFinal = Number(form.vehiculoId);

    if (esVehiculoNuevo) {
      const marcaNuevoFinal = (vehiculoNuevo.marca || busquedaMarca).trim();
      const modeloNuevoFinal = (vehiculoNuevo.modelo || busquedaModelo).trim();

      if (!vehiculoNuevo.patente.trim() || !marcaNuevoFinal || !modeloNuevoFinal) {
        return setError("Para vehículo nuevo completá patente, marca y modelo");
      }

      const hoy = new Date();
      const fechaEntrada = hoy.toISOString().slice(0, 10);
      const fechaLimite = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const creado = await api.createVehiculo({
        clienteId: clienteIdFinal,
        marca: marcaNuevoFinal,
        modelo: modeloNuevoFinal,
        patente: vehiculoNuevo.patente.trim().toUpperCase(),
        fechaEntrada,
        fechaLimite
      });

      if (creado.error) return setError(creado.error);
      vehiculoIdFinal = Number(creado.id);
    }

    const payload = {
      clienteId: clienteIdFinal,
      vehiculoId: vehiculoIdFinal,
      trabajadorId: Number(form.trabajadorId),
      descripcionTrabajo: descripcionFinal,
      horasEstimadas: Number(form.horasEstimadas || 0),
      valorHora: Number(form.valorHora || 0),
      repuestos: form.repuestos.map((r) => ({
        repuestoId: r.repuestoId,
        cantidad: Number(r.cantidad || 0),
        precioUnitario: Number(r.precioUnitario || 0)
      }))
    };

    const res = await api.createOrden(payload);
    if (res.error) return setError(res.error);

    await cargarOrdenes();
    setForm((prev) => ({
      ...prev,
      clienteId: "",
      vehiculoId: "",
      descripcionTrabajo: "",
      horasEstimadas: "",
      valorHora: "",
      repuestos: []
    }));
    setClienteNuevo({ nombre: "", telefono: "", email: "" });
    setVehiculoNuevo({ patente: "", marca: "", modelo: "" });
    setBusquedaMarca("");
    setBusquedaModelo("");
    setBusquedaRepuesto("");
    setOtraDescripcionTrabajo("");
  }

  if (tab !== "ordenes") return null;

  return (
    <section className="card">
      <h2>Ordenes de trabajo</h2>

      <form className="form ordenes-form" onSubmit={crearOrden}>
        <select
          value={form.clienteId}
          onChange={(e) => {
            const clienteId = e.target.value;
            setForm((prev) => ({
              ...prev,
              clienteId,
              vehiculoId: clienteId === CLIENTE_NUEVO ? VEHICULO_NUEVO : "",
              marcaId: "",
              modeloId: "",
              repuestos: []
            }));
            if (clienteId !== CLIENTE_NUEVO) {
              setClienteNuevo({ nombre: "", telefono: "", email: "" });
            }
            setVehiculoNuevo({ patente: "", marca: "", modelo: "" });
            setBusquedaMarca("");
            setBusquedaModelo("");
          }}
        >
          <option value="">Cliente</option>
          <option value={CLIENTE_NUEVO}>Cliente nuevo</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        {esClienteNuevo && (
          <>
            <input
              placeholder="Nombre cliente"
              value={clienteNuevo.nombre}
              onChange={(e) =>
                setClienteNuevo((prev) => ({ ...prev, nombre: e.target.value }))
              }
            />
            <input
              placeholder="Teléfono cliente"
              value={clienteNuevo.telefono}
              onChange={(e) =>
                setClienteNuevo((prev) => ({ ...prev, telefono: e.target.value }))
              }
            />
            <input
              placeholder="Email cliente"
              value={clienteNuevo.email}
              onChange={(e) =>
                setClienteNuevo((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </>
        )}

        <select
          value={form.vehiculoId}
          disabled={esClienteNuevo}
          onChange={(e) => {
            const vehiculoId = e.target.value;
            if (!vehiculoId) {
              setForm((prev) => ({
                ...prev,
                vehiculoId: "",
                marcaId: "",
                modeloId: "",
                repuestos: []
              }));
              setBusquedaMarca("");
              setBusquedaModelo("");
              return;
            }
            if (vehiculoId === VEHICULO_NUEVO) {
              setForm((prev) => ({
                ...prev,
                vehiculoId: VEHICULO_NUEVO,
                marcaId: "",
                modeloId: "",
                repuestos: []
              }));
              setBusquedaMarca("");
              setBusquedaModelo("");
              return;
            }

            setForm((prev) => ({
              ...prev,
              vehiculoId,
              repuestos: []
            }));
          }}
        >
          <option value="">Vehiculo</option>
          <option value={VEHICULO_NUEVO}>Vehiculo nuevo</option>
          {vehiculosDelCliente.map((v) => (
            <option key={v.id} value={v.id}>
              {v.patente} - {v.marca} {v.modelo}
            </option>
          ))}
        </select>

        <select
          value={form.trabajadorId}
          onChange={(e) => setForm({ ...form, trabajadorId: e.target.value })}
        >
          <option value="">Trabajador</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>

        <select
          value={form.descripcionTrabajo}
          onChange={(e) => setForm({ ...form, descripcionTrabajo: e.target.value })}
        >
          <option value="">Descripcion del trabajo</option>
          {OPCIONES_TAREA.map((op) => (
            <option key={op} value={op}>
              {op === "__otra__" ? "Otra (escribir manual)" : op}
            </option>
          ))}
        </select>

        {form.descripcionTrabajo === "__otra__" && (
          <input
            placeholder="Escribi la descripcion"
            value={otraDescripcionTrabajo}
            onChange={(e) => setOtraDescripcionTrabajo(e.target.value)}
          />
        )}

        <input
          className="ordenes-descripcion"
          type="number"
          min="0"
          step="0.5"
          placeholder="Horas estimadas"
          value={form.horasEstimadas}
          onChange={(e) => setForm({ ...form, horasEstimadas: e.target.value })}
        />

        <input
          type="number"
          min="0"
          step="1"
          placeholder="Valor hora"
          value={form.valorHora}
          onChange={(e) => setForm({ ...form, valorHora: e.target.value })}
        />

        {!usaVehiculoExistente && (
          <>
            <div className="ordenes-autocomplete">
              <input
                placeholder={esVehiculoNuevo ? "Marca" : "Buscar marca"}
                value={busquedaMarca}
                onFocus={() => setMostrarListaMarca(busquedaMarca.trim().length >= 2)}
                onBlur={() => setTimeout(() => setMostrarListaMarca(false), 150)}
                onChange={(e) => {
                  const value = e.target.value;
                  handleMarcaInput(value);
                  setMostrarListaMarca(value.trim().length >= 2);
                }}
              />
              {busquedaMarca && (
                <button
                  type="button"
                  className="ordenes-clear-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={limpiarMarca}
                >
                  ×
                </button>
              )}
              {mostrarListaMarca && marcas.length > 0 && (
                <div className="ordenes-dropdown">
                  {marcas.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => seleccionarMarca(m)}
                      className="ordenes-dropdown-item"
                    >
                      {m.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ordenes-autocomplete">
              <input
                placeholder={esVehiculoNuevo ? "Modelo" : "Buscar modelo"}
                value={busquedaModelo}
                onFocus={() => setMostrarListaModelo(busquedaModelo.trim().length >= 2)}
                onBlur={() => setTimeout(() => setMostrarListaModelo(false), 150)}
                onChange={(e) => {
                  const value = e.target.value;
                  handleModeloInput(value);
                  setMostrarListaModelo(value.trim().length >= 2);
                }}
                disabled={!form.marcaId}
              />
              {busquedaModelo && (
                <button
                  type="button"
                  className="ordenes-clear-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={limpiarModelo}
                >
                  ×
                </button>
              )}
              {mostrarListaModelo && modelos.length > 0 && (
                <div className="ordenes-dropdown">
                  {modelos.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => seleccionarModelo(m)}
                      className="ordenes-dropdown-item"
                    >
                      {m.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {esVehiculoNuevo && (
              <input
                placeholder="Patente"
                value={vehiculoNuevo.patente}
                onChange={(e) =>
                  setVehiculoNuevo((prev) => ({ ...prev, patente: e.target.value.toUpperCase() }))
                }
              />
            )}
          </>
        )}

        <button type="submit" className="ordenes-btn-crear">Crear orden</button>
      </form>

      <div className="card" style={{ marginTop: 10 }}>
        <h3>Repuestos compatibles</h3>
        <input
          placeholder="Buscar repuesto compatible"
          value={busquedaRepuesto}
          onChange={(e) => setBusquedaRepuesto(e.target.value)}
        />
        <ul className="list">
          {repuestosCompatibles.map((r) => (
            <li key={r.id}>
              {r.nombre} (${Number(r.precioReferencia || 0).toLocaleString("es-AR")})
              <button type="button" onClick={() => agregarRepuesto(r)} style={{ marginLeft: 8 }}>
                Agregar
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h3>Repuestos en la orden</h3>
        {form.repuestos.length === 0 ? (
          <p>Sin repuestos cargados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Repuesto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {form.repuestos.map((r) => (
                <tr key={r.repuestoId}>
                  <td>{r.nombre}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={r.cantidad}
                      onChange={(e) => actualizarRepuesto(r.repuestoId, "cantidad", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.precioUnitario}
                      onChange={(e) =>
                        actualizarRepuesto(r.repuestoId, "precioUnitario", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    $
                    {(
                      Number(r.cantidad || 0) * Number(r.precioUnitario || 0)
                    ).toLocaleString("es-AR")}
                  </td>
                  <td>
                    <button type="button" onClick={() => quitarRepuesto(r.repuestoId)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: 10 }}>
        Mano de obra: <strong>${totalManoObra.toLocaleString("es-AR")}</strong>
      </p>
      <p>
        Repuestos: <strong>${totalRepuestos.toLocaleString("es-AR")}</strong>
      </p>
      <p>
        Total orden: <strong>${totalGeneral.toLocaleString("es-AR")}</strong>
      </p>

      <div className="card" style={{ marginTop: 10 }}>
        <h3>Ultimas ordenes</h3>
        {ordenes.length === 0 ? (
          <p>No hay ordenes cargadas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Numero</th>
                <th>Fecha y hora</th>
                <th>Cliente</th>
                <th>Patente</th>
                <th>Trabajador</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id}>
                  <td>{o.numero}</td>
                  <td>
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString("es-AR", {
                          timeZone: "America/Argentina/Buenos_Aires"
                        })
                      : "-"}
                  </td>
                  <td>{o.clienteNombre}</td>
                  <td>{o.patente}</td>
                  <td>{o.trabajadorNombre}</td>
                  <td>{o.estado}</td>
                  <td>${Number(o.totalGeneral || 0).toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default OrdenesPanel;
