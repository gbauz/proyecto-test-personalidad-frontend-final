import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
console.log("🌍 VITE_API_URL:", import.meta.env.VITE_API_URL);

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>

  );
}

export default App;
