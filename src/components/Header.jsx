import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMenu } from 'react-icons/hi';
import { updatePerfil, fetchPerfilByUserId } from '../Features/Auth/apiPerfil';

const Header = ({ toggleSidebar }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const nombreUsuario = localStorage.getItem('nombre');
  const rolUsuario = localStorage.getItem('rolName');
  const userIdStr = localStorage.getItem('userId');
  const userId = userIdStr ? Number(userIdStr) : null;

  const API_URL = import.meta.env.VITE_API_URL;

  // 🔧 Normaliza la ruta si viene con backslashes
  const normalizarRuta = (ruta) => {
    if (!ruta) return null;
    const cleanPath = ruta.replace(/\\/g, '/');
    return cleanPath.startsWith('http') ? cleanPath : `${API_URL}/${cleanPath}`;
  };

  // ✅ Cargar foto del usuario actual desde localStorage
  const cargarFotoDesdeStorage = () => {
    if (!userId) return;

    const storedFoto = localStorage.getItem(`fotoPerfil_${userId}`);
    if (storedFoto) {
      setFotoPerfil(storedFoto);
      console.log('📦 Cargando foto desde localStorage:', storedFoto);
    } else {
      // Si no está guardada, intenta cargar desde el servidor
      fetchPerfilActual();
    }
  };

  // 🔄 Cargar perfil desde backend y guardar foto
  const fetchPerfilActual = async () => {
    if (!userId) return;
    try {
      const response = await fetchPerfilByUserId(userId);
      if (response?.isSuccess && response.data?.fotoPerfil) {
        const imageURL = normalizarRuta(response.data.fotoPerfil);
        setFotoPerfil(imageURL);
        localStorage.setItem(`fotoPerfil_${userId}`, imageURL);
      }
    } catch (error) {
      console.error('❌ Error al obtener el perfil:', error);
    }
  };

  // 🧹 Logout
  const handleLogout = () => {
    setDropdownOpen(false);

    // Borra solo datos del usuario actual
    if (userId) {
      localStorage.removeItem(`fotoPerfil_${userId}`);
    }

    localStorage.clear();
    sessionStorage.clear();

    navigate('/login');
  };

  // 📤 Subir imagen y actualizar perfil
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    console.log('📤 Archivo seleccionado:', file);

    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('tipoArchivo', 'foto'); // ← importante si backend lo requiere
    formData.append('fotoPerfil', file);

    try {
      const res = await updatePerfil(formData);
      console.log('✅ Respuesta del backend:', res);

      if (res?.message) alert(res.message);

      const perfilActualizado = await fetchPerfilByUserId(userId);
      if (perfilActualizado.isSuccess && perfilActualizado.data?.fotoPerfil) {
        const imageURL = normalizarRuta(perfilActualizado.data.fotoPerfil);
        setFotoPerfil(imageURL);
        localStorage.setItem(`fotoPerfil_${userId}`, imageURL);
        console.log('✅ Imagen de perfil actualizada:', imageURL);
      }
    } catch (err) {
      console.error('❌ Error al subir la imagen:', err);
      alert('Error al actualizar la imagen.');
    }
  };

  // ⏳ Inicializa foto al montar componente
  useEffect(() => {
    cargarFotoDesdeStorage();
  }, [userId]);

  // 🖱️ Cerrar dropdown si clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-black border-b border-gray-800 shadow-md px-4">
      <div className="flex items-center justify-between p-4 w-full">
        <button
          className="text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm p-2.5 focus:outline-none"
          onClick={toggleSidebar}
        >
          <HiMenu className="w-5 h-5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-600"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <span className="sr-only">Abrir menú de usuario</span>
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={fotoPerfil || 'https://flowbite.com/docs/images/people/profile-picture-3.jpg'}
              alt="Foto de perfil"
            />
          </button>

          <div
            className={`absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg transform transition-all duration-200 origin-top-right ${
              isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="block text-sm font-medium" style={{ color: 'black' }}>{nombreUsuario}</span>
              <span className="block text-sm text-gray-500 truncate" style={{ color: 'black' }}>{rolUsuario}</span>
            </div>
            <ul className="py-1">
             
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
