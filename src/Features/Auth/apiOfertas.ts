import axios from "axios";

export interface OfertaPayload {
  nombre: string;
  descripcion: string;
  sueldo: number;
  modalidad: string;
  creadorId: number;
}
export interface FechaPostulacion {
  fecha: string;
  createdAt: string;
  postulante: {
    name: string;
  };
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

const API_URL = `${import.meta.env.VITE_API_URL}`;
const AUTH_URL = "auth";
const BASE_URL_AUTH = `${API_URL}/${AUTH_URL}`;

export const crearOferta = async (
  data: OfertaPayload
): Promise<ApiResponse<null>> => {
  const response = await axios.post(`${BASE_URL_AUTH}/crearoferta`, data);
  return response.data;
};

export const obtenerOfertasParaPostulante = async (
  userId: number
): Promise<ApiResponse<any[]>> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL_AUTH}/verofertas`, {
    params: { userId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export const postularAOferta = async (
  ofertaId: number,
  postulanteId: number
): Promise<ApiResponse<any>> => {
  const response = await axios.post(`${BASE_URL_AUTH}/postular`, {
    ofertaId,
    postulanteId,
  });

  return response.data;
};

export const verificarPostulacion = async (
  postulanteId: number
): Promise<{ isSuccess: boolean; yaPostulado: boolean }> => {
  const response = await axios.get(`${BASE_URL_AUTH}/verificarpostulacion`, {
    params: { postulanteId },
  });
  return response.data;
};



export const verificarTestCompletado = async (
  userId: number
): Promise<boolean> => {
  try {
   const response = await axios.get(`${API_URL}/test/usuarios-con-test`);


    // Verificamos si el usuario aparece en la lista de usuarios con test completado
    const usuariosConTest = response.data.data || [];

    const usuarioEncontrado = usuariosConTest.some(
      (usuario: any) => usuario.id === userId
    );

    return usuarioEncontrado;
  } catch (error) {
    console.error("Error al verificar test:", error);
    return false;
  }
};


export const obtenerFechasConUsuario = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL_AUTH}/fechas-con-usuario/${userId}`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al obtener fechas por usuario:', error);
    return [];
  }
};


// ✅ Validar documento
export const marcarValidacion = async (postulacionId: number) => {
  const res = await axios.put(`${BASE_URL_AUTH}/postulacion/validar/${postulacionId}`);
  
  return res.data;
};

// ✅ Aprobar solicitud
// export const marcarAprobacion = async (postulacionId: number) => {
//   const res = await axios.put(`${BASE_URL_AUTH}/postulacion/aprobar/${postulacionId}`);
 
//   return res.data;
// };

// ✅ Aprobar o rechazar solicitud
// ✅ Aprobar o rechazar solicitud
export const marcarAprobacion = async (postulacionId: number, estadoAprobacion: "ACEPTADA" | "RECHAZADA") => {
  const res = await axios.put(`${BASE_URL_AUTH}/postulacion/aprobar/${postulacionId}`, {
    estadoAprobacion,
  });

  return res.data;
};


export const obtenerOfertaAplicadaPorUsuario = async (userId: number) => {
  try {
    const response = await axios.get(`${BASE_URL_AUTH}/postulaciones/usuario/${userId}`);
    console.log("Respuesta de la API oferta:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener la oferta aplicada:", error);
    return {
      isSuccess: false,
      message: "Error al obtener la oferta aplicada",
      data: null,
    };
  }
};

export const descargarPDFOferta = async (userId: number) => {
  try {
    const response = await axios.get(`${BASE_URL_AUTH}/reporte/oferta/${userId}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte-oferta.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error al descargar el PDF:", error);
  }
};


export const obtenerEstadoAprobacion = async (postulanteId: number) => {
  const res = await axios.get(`${BASE_URL_AUTH}/postulacion/estado/${postulanteId}`);
  return res.data.data; // contiene { id, estadoAprobacion, fechaAprobacion }
};

export const actualizarOferta = async (id: number, datosActualizados: {
  nombre: string;
  descripcion: string;
  sueldo: number;
  modalidad: string;
}) => {
  try {
    const res = await axios.put(`${BASE_URL_AUTH}/ofertas/${id}`, datosActualizados);
    return res.data.data; // Retorna la oferta actualizada
  } catch (error) {
    console.error('Error al actualizar la oferta:', error);
    throw error;
  }
};

export const eliminarOferta = async (id: number) => {
  try {
    const res = await axios.delete(`${BASE_URL_AUTH}/ofertas/${id}`);
    return res.data.data; // Retorna la oferta eliminada si deseas usarla
  } catch (error) {
    console.error('Error al eliminar la oferta:', error);
    throw error;
  }
};