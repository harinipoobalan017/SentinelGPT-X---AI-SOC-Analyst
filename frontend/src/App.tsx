import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants}
        initial="initial" animate="animate" exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen">
        <Routes location={location}>
          <Route path="/"          element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analysis"  element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
          <Route path="/login"     element={<Login />} />
          <Route path="*"          element={<Landing />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}