import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Login from '../Features/Auth/Login';
import Landing from '../Features/Landing/Landing';
import Register from '../Features/Auth/Register';
import ResetPassword from '../components/ResetPassword';
import { Navigate } from 'react-router-dom';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing" />} /> {/* Redirige a Landing */}
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<Landing />} />
      <Route path='/registerPublic' element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Puedes agregar /register, /forgot-password, etc. */}
    </Routes>
  );
};

export default PublicRoutes;
