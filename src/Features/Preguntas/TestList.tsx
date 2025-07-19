import React, { useEffect, useState } from "react";
import {
  obtenerTestsCompletados,
  TestCompletado,
} from "./api";
import { obtenerOfertaAplicadaPorUsuario } from "../Auth/apiOfertas";

const TestList = () => {
  const [data, setData] = useState<TestCompletado[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [personalidad, setPersonalidad] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [oferta, setOferta] = useState(null);
  const rol = localStorage.getItem("rolName");
  const userId = Number(localStorage.getItem("userId"));
  const isPostulante = rol === "Postulante";

  const [ofertasPorUsuario, setOfertasPorUsuario] = useState<Record<number, any>>({});

  const aplicarFiltros = (reset = false) => {
    const filtros = reset
      ? {}
      : {
          ...(isPostulante && userId ? { idUsuario: userId } : {}),
          ...(!isPostulante && nombre && { nombre }),
          ...(!isPostulante && personalidad && { personalidad }),
          ...(!isPostulante && desde && { desde }),
          ...(!isPostulante && hasta && { hasta }),
        };

    setLoading(true);
    obtenerTestsCompletados(filtros)
      .then(async (res) => {
        if (res.isSuccess && res.data) {
          setData(res.data);

          // Cargar postulaciones por usuario (solo una por cada uno)
          const usuariosUnicos = Array.from(
            new Set(res.data.map((t) => t.usuariotest?.user?.id))
          ).filter(Boolean);

          const ofertasPromises = usuariosUnicos.map((id) =>
            obtenerOfertaAplicadaPorUsuario(id).then((res) => ({
              id,
              oferta: res?.data,
            }))
          );

          const ofertas = await Promise.all(ofertasPromises);
          const mapaOfertas = ofertas.reduce((acc, curr) => {
            acc[curr.id] = curr.oferta;
            return acc;
          }, {} as Record<number, any>);

          setOfertasPorUsuario(mapaOfertas);
        }
      })
      .catch((error) => console.error("Error al obtener tests:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userId && isPostulante) {
      obtenerOfertaAplicadaPorUsuario(userId).then((res) => {
        setOferta(res?.data || null);
      });
    }
  }, [userId]);

  useEffect(() => {
    aplicarFiltros();
  }, []);

  const verPDFEnOtraPestana = (idUsuarioTest: number) => {
    const url = `${import.meta.env.VITE_API_URL}/test/generar-pdf/${idUsuarioTest}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-900">
        Tests Completados
      </h1>

      {!isPostulante && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            aplicarFiltros();
          }}
          className="max-w-7xl mx-auto flex flex-wrap gap-4 items-end justify-between mb-8"
        >
          <input
            type="text"
            placeholder="Filtrar por nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 min-w-[200px] bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 text-sm focus:ring focus:ring-blue-200"
          />
          <input
            type="text"
            placeholder="Filtrar por personalidad"
            value={personalidad}
            onChange={(e) => setPersonalidad(e.target.value)}
            className="flex-1 min-w-[200px] bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 text-sm focus:ring focus:ring-blue-200"
          />
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 text-sm focus:ring focus:ring-blue-200"
          />
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 text-sm focus:ring focus:ring-blue-200"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition text-sm"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={() => {
              setNombre("");
              setPersonalidad("");
              setDesde("");
              setHasta("");
              aplicarFiltros(true);
            }}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-400 transition text-sm"
          >
            Restablecer filtros
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {Array.isArray(data) &&
            data.map((test) => (
              <div
                key={test.id}
                className="bg-white shadow rounded-lg p-5 border border-gray-200 text-sm hover:shadow-md transition"
              >
                <div className="mb-3">
                  <h2 className="text-base font-bold text-blue-700 truncate">
                    Personalidad: {test.personalidades?.nombre || "N/A"}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    Test ID: {test.usuariotest?.codigo || "N/A"}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-gray-700 text-xs whitespace-pre-line break-words">
                    <span className="font-medium">Descripción:</span>{" "}
                    {test.personalidades?.descripcion || "Sin descripción"}
                  </p>
                </div>

                <div className="text-gray-600 text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Usuario:</span>{" "}
                    {test.usuariotest?.user?.name || "Desconocido"}
                  </p>
                  <p>
                    <span className="font-semibold">Correo:</span>{" "}
                    {test.usuariotest?.user?.email || "No disponible"}
                  </p>
                  <p>
                    <span className="font-semibold">Puestos recomendados:</span>{" "}
                    {test.personalidades?.puestosRecomendados?.length > 0
                      ? test.personalidades.puestosRecomendados.join(", ")
                      : "Sin descripción"}
                  </p>
                  <p>
                    <span className="font-semibold">Oferta postulado:</span>{" "}
                    {
                      ofertasPorUsuario[test.usuariotest?.user?.id]?.nombre ||
                      "No disponible"
                    }
                  </p>
                  <p>
                    <span className="font-semibold">Fecha:</span>{" "}
                    {test.createdAt
                      ? new Date(test.createdAt).toLocaleDateString()
                      : "Fecha no disponible"}
                  </p>
                </div>

                <div className="mt-3 text-[11px] text-gray-400">
                  ID Test: {test.id} | ID Usuario Test: {test.idUsuarioTest}
                </div>

                <button
                  onClick={() => verPDFEnOtraPestana(test.idUsuarioTest)}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-md text-xs hover:bg-green-700 transition"
                >
                  Ver PDF
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TestList;
