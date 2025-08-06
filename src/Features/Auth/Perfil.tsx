import React, { useState, useEffect } from "react";
import { fetchPerfilByUserId, updatePerfil, updatePerfill } from "./apiPerfil";
import { fetchUserBasicInfo } from "./apiRegister";

interface Perfil {
  userId: number;
  cedula: string;
  sexo: string;
  pais: string;
  ciudad: string;
  fotoPerfil?: string;
  curriculum?: string;
  name?: string;
  email?: string;
}

const Perfil = () => {
  const [perfil, setPerfil] = useState<Perfil>({
    userId: 0,
    cedula: "",
    sexo: "",
    pais: "",
    ciudad: "",
    name: "",
    email: "",
  });

  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null);
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userIdStr = localStorage.getItem("userId");
  const userId = userIdStr ? Number(userIdStr) : null;

  useEffect(() => {
    if (!userId) {
      setError("Debes iniciar sesión para acceder al perfil");
      return;
    }

    setLoading(true);
    fetchPerfilByUserId(userId)
      .then(async ({ isSuccess, data }) => {
        if (isSuccess && data) {
          setPerfil(data);
        } else {
          const userInfo = await fetchUserBasicInfo(userId);
          setPerfil(prev => ({
            ...prev,
            userId,
            name: userInfo.name,
            email: userInfo.email,
          }));
        }
      })
      .catch(() => setError("Error al cargar perfil"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "cedula") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setPerfil(prev => ({ ...prev, cedula: numericValue }));
      }
    } else {
      setPerfil(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('UserId no definido, inicia sesión primero');
      return;
    }

    if (perfil.cedula.length !== 10) {
      setError('La cédula debe tener exactamente 10 números');
      return;
    }

    setLoading(true);
    try {
      let fotoUrl = perfil.fotoPerfil;
      let cvUrl = perfil.curriculum;

      if (fotoPerfilFile) {
        const fotoForm = new FormData();
        fotoForm.append('file', fotoPerfilFile);
        fotoForm.append('userId', userId.toString());
        fotoForm.append('tipoArchivo', 'fotoPerfil');
        const uploadResult = await updatePerfill(fotoForm);
        fotoUrl = uploadResult.url || uploadResult.secure_url;
        localStorage.setItem('fotoPerfil', fotoUrl);
      }

      if (curriculumFile) {
        const cvForm = new FormData();
        cvForm.append('file', curriculumFile);
        cvForm.append('userId', userId.toString());
        cvForm.append('tipoArchivo', 'cv');
        const cvUploadResult = await updatePerfill(cvForm);
        cvUrl = cvUploadResult.url || cvUploadResult.secure_url;
      }

      const formData = new FormData();
      formData.append('userId', userId.toString());
      formData.append('cedula', perfil.cedula);
      formData.append('sexo', perfil.sexo);
      formData.append('pais', perfil.pais);
      formData.append('ciudad', perfil.ciudad);
      formData.append('name', perfil.name || '');
      formData.append('email', perfil.email || '');
      if (fotoUrl) formData.append('fotoPerfil', fotoUrl);
      if (cvUrl) formData.append('curriculum', cvUrl);

      const res = await updatePerfil(formData);
      alert(res.message || 'Perfil actualizado correctamente');

      const { isSuccess, data } = await fetchPerfilByUserId(userId);
      if (isSuccess && data) setPerfil(data);

    } catch (err) {
      setError('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded shadow ">
      <h2 className="text-2xl font-semibold mb-6 text-center text-black">Editar Perfil</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {loading && <p className="text-center mb-4">Cargando...</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-semibold text-black">Nombre</label>
          <input type="text" name="name" value={perfil.name || ""} onChange={handleChange} required className="w-full h-12 px-3 border rounded border-gray-300 text-black" />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Email</label>
          <input type="email" name="email" value={perfil.email || ""} onChange={handleChange} required className="w-full h-12 px-3 border rounded border-gray-300 text-black" />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Cédula</label>
          <input type="text" name="cedula" value={perfil.cedula} onChange={handleChange} required className="w-full h-12 px-3 border rounded border-gray-300 text-black" />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Sexo</label>
          <select name="sexo" value={perfil.sexo} onChange={handleChange} required className="w-full h-12 px-3 border rounded border-gray-300 text-black">
            <option value="">Seleccione</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">País de nacimiento</label>
          <input type="text" name="pais" value={perfil.pais} onChange={handleChange} required className="w-full h-12 px-3 border rounded border-gray-300 text-black" />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Ciudad</label>
          <input type="text" name="ciudad" value={perfil.ciudad} onChange={handleChange} required className="w-full h-12 px-3 border rounded border-gray-300 text-black" />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Foto de Perfil</label>
          <input type="file" accept="image/*" onChange={(e) => setFotoPerfilFile(e.target.files?.[0] || null)} className="w-full" />
          {perfil.fotoPerfil && (
            <img src={perfil.fotoPerfil} alt="Foto de perfil" className="mt-2 h-20 w-20 object-cover rounded-full" />
          )}
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Currículum (PDF)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setCurriculumFile(e.target.files?.[0] || null)} className="w-full" />
          {perfil.curriculum && (
            <a href={perfil.curriculum} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">
              Ver currículum actual
            </a>
          )}
        </div>

        <div className="md:col-span-2 flex justify-center">
  <button
    type="submit"
    disabled={loading}
    className={`px-50 py-2 text-sm rounded-md text-white font-medium transition duration-300 ${
      loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
    }`}
  >
    {loading ? "Guardando..." : "Guardar"}
  </button>
</div>

      </form>
    </div>
  );
};

export default Perfil;