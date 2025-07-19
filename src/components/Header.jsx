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

  // Cargar foto desde sessionStorage o localStorage
  const cargarFotoDesdeStorage = () => {
    const storedFoto = sessionStorage.getItem('fotoPerfil') || localStorage.getItem('fotoPerfil');
    if (storedFoto) {
      console.log('📦 Cargando foto desde sessionStorage o localStorage');
      if (!storedFoto.startsWith('http')) {
        setFotoPerfil(`${import.meta.env.VITE_API_URL}/${storedFoto}`);
      } else {
        setFotoPerfil(storedFoto);
      }
    }
  };

  // Al cargar el componente, leer foto desde sessionStorage o localStorage
  useEffect(() => {
    cargarFotoDesdeStorage();
  }, []);

  // Detectar clic fuera del menú
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Logout
 const handleLogout = () => {
  setDropdownOpen(false);
  
  // Obtener la URL de la foto de perfil de localStorage
  const fotoUrl = localStorage.getItem('fotoPerfil'); 
  
  // Guardar la foto de perfil en sessionStorage antes de borrar el localStorage
  if (fotoUrl) {
    sessionStorage.setItem('fotoPerfil', fotoUrl); // Guardamos en sessionStorage
  }

  // Limpiar localStorage
  localStorage.clear();

  // Navegar al login
  navigate('/login');
};


  // Subir nueva imagen de perfil
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) {
      console.warn('⚠️ Archivo faltante o userId no definido.');
      return;
    }

    console.log('📤 Archivo seleccionado:', file);

    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('fotoPerfil', file);

    try {
      const res = await updatePerfil(formData);
      console.log('✅ Respuesta del backend:', res);

      if (res?.message) {
        alert(res.message);
      }

      // Vuelve a obtener la URL real desde el servidor
      const perfilActualizado = await fetchPerfilByUserId(userId);
      if (perfilActualizado.isSuccess && perfilActualizado.data?.fotoPerfil) {
        let imageURL = perfilActualizado.data.fotoPerfil;

        if (!imageURL.startsWith('http')) {
          imageURL = `${import.meta.env.VITE_API_URL}/${imageURL}`;
        }

        setFotoPerfil(imageURL);
        localStorage.setItem('fotoPerfil', imageURL);  // Guardamos en localStorage
        sessionStorage.setItem('fotoPerfil', imageURL);  // Sincronizamos en sessionStorage también
        console.log('✅ Imagen de perfil actualizada:', imageURL);
      } else {
        console.warn('⚠️ No se pudo actualizar la imagen desde el backend.');
      }
    } catch (err) {
      console.error('❌ Error al subir la imagen:', err);
      alert('Error al actualizar la imagen.');
    }
  };

  // Escuchar cambios en localStorage o sessionStorage
  useEffect(() => {
    const handleStorageChange = () => {
      cargarFotoDesdeStorage();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
            className={`absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg transform transition-all duration-200 origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="block text-sm font-medium">{nombreUsuario}</span>
              <span className="block text-sm text-gray-500 truncate">{rolUsuario}</span>
            </div>
            <ul className="py-1">
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <label className="cursor-pointer block">
                  Cambiar foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </li>
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
