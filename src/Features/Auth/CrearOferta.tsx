import React, { useEffect, useState } from "react";
import {
  actualizarOferta,
  crearOferta,
  eliminarOferta,
  obtenerOfertasParaPostulante,
} from "./apiOfertas";

interface Oferta {
  id: number;
  nombre: string;
  descripcion: string;
  sueldo: number;
  modalidad: string;
  creadoEn: string;
  creador?: {
    name?: string;
  };
}

const FormularioOfertaFlowbite = () => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sueldo: "",
    modalidad: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<Oferta | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ofertaAEliminar, setOfertaAEliminar] = useState<Oferta | null>(null);

  const creadorId = Number(localStorage.getItem("userId"));
  const roleName = localStorage.getItem("roleName");

  const fetchOfertas = async () => {
    setLoading(true);
    try {
      const response = await obtenerOfertasParaPostulante(creadorId);
      if (response.isSuccess) {
        setOfertas(response.data ?? []);
      } else {
        setMensaje(response.message || "No se pudieron cargar las ofertas.");
        setOfertas([]);
      }
    } catch (error) {
      console.error("Error al cargar ofertas:", error);
      setMensaje("Error al cargar las ofertas.");
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfertas();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (ofertaSeleccionada) {
        await actualizarOferta(ofertaSeleccionada.id, {
          ...form,
          sueldo: parseFloat(form.sueldo),
        });
        setMensaje("Oferta actualizada correctamente.");
        setOfertaSeleccionada(null);
      } else {
        const result = await crearOferta({
          ...form,
          sueldo: parseFloat(form.sueldo),
          creadorId,
        });

        if (!result.isSuccess) {
          setMensaje(result.message || "No se pudo crear la oferta.");
          return;
        }

        setMensaje("Oferta creada correctamente.");
      }

      setForm({ nombre: "", descripcion: "", sueldo: "", modalidad: "" });
      setModalAbierto(false);
      fetchOfertas();
    } catch (error) {
      console.error(error);
      setMensaje("Error al procesar la solicitud.");
    }
  };

  const handleEliminar = (oferta: Oferta) => {
    setOfertaAEliminar(oferta);
  };

  const handleEliminarConfirmado = async () => {
    if (!ofertaAEliminar) return;

    try {
      await eliminarOferta(ofertaAEliminar.id);
      setMensaje("Oferta eliminada correctamente.");
      fetchOfertas();
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar la oferta.");
    } finally {
      setOfertaAEliminar(null);
    }
  };

  const handleActualizar = (id: number) => {
    const oferta = ofertas.find((o) => o.id === id);
    if (oferta) {
      setOfertaSeleccionada(oferta);
      setForm({
        nombre: oferta.nombre,
        descripcion: oferta.descripcion,
        sueldo: String(oferta.sueldo),
        modalidad: oferta.modalidad,
      });
      setModalAbierto(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Formulario Crear/Actualizar */}
      <form className="mb-8" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">
          {ofertaSeleccionada ? "Editar Oferta" : "Crear Nueva Oferta"}
        </h2>

        {["nombre", "descripcion", "sueldo"].map((campo) => (
          <div className="mb-5" key={campo}>
            <label htmlFor={campo} className="block mb-2 text-sm font-medium text-gray-900">
              {campo === "nombre" ? "Nombre del puesto" : campo === "descripcion" ? "Descripción" : "Sueldo"}
            </label>
            {campo === "descripcion" ? (
              <textarea
                id={campo}
                name={campo}
                value={form[campo as keyof typeof form]}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded text-black"
              />
            ) : (
              <input
                type={campo === "sueldo" ? "number" : "text"}
                id={campo}
                name={campo}
                value={form[campo as keyof typeof form]}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded text-black"
              />
            )}
          </div>
        ))}

        <div className="mb-5">
          <label htmlFor="modalidad" className="block mb-2 text-sm font-medium text-gray-900">
            Modalidad
          </label>
          <select
            id="modalidad"
            name="modalidad"
            value={form.modalidad}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded text-black"
          >
            <option value="">Selecciona una modalidad</option>
            <option value="Remoto">Remoto</option>
            <option value="Presencial">Presencial</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {ofertaSeleccionada ? "Guardar Cambios" : "Crear Oferta"}
        </button>

        {mensaje && <p className="mt-3 text-sm text-red-600">{mensaje}</p>}
      </form>

      {/* Tabla de ofertas */}
      <h3 className="text-lg font-semibold mb-2">Ofertas Creadas</h3>
      {loading ? (
        <p className="text-black">Cargando ofertas...</p>
      ) : ofertas.length === 0 ? (
        <p className="text-black">No hay ofertas creadas aún.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full text-sm text-left text-black">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-2 border-b">Nombre</th>
                <th className="px-4 py-2 border-b">Descripción</th>
                <th className="px-4 py-2 border-b">Sueldo</th>
                <th className="px-4 py-2 border-b">Modalidad</th>
                <th className="px-4 py-2 border-b">Creado por</th>
                <th className="px-4 py-2 border-b">Fecha</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((oferta) => (
                <tr key={oferta.id} className="text-black">
                  <td className="px-4 py-2">{oferta.nombre}</td>
                  <td className="px-4 py-2">{oferta.descripcion}</td>
                  <td className="px-4 py-2">${oferta.sueldo}</td>
                  <td className="px-4 py-2">{oferta.modalidad}</td>
                  <td className="px-4 py-2">{oferta.creador?.name || "Desconocido"}</td>
                  <td className="px-4 py-2">{new Date(oferta.creadoEn).toLocaleDateString()}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEliminar(oferta)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => handleActualizar(oferta.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Confirmación Eliminar */}
      {ofertaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">¿Eliminar esta oferta?</h2>
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar la oferta "{ofertaAEliminar.nombre}"?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOfertaAEliminar(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarConfirmado}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioOfertaFlowbite;
