import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import CreateQuotation from './pages/CreateQuotation';
import HeaderImage from './pages/HeaderImage';
import QuotationsList from './pages/QuotationsList';
import UserManagement from './pages/UserManagement';
import ProfileSettings from './pages/ProfileSettings';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return null;
  return user && user.role === 'admin' ? children : <Navigate to="/quotations" />;
};

import SplashScreen from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = React.useState(() => {
    // Show splash screen once per browser session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              {/* Default route redirects to Quotations List */}
              <Route index element={<Navigate to="/quotations" replace />} />
              <Route path="quotations" element={<QuotationsList />} />
              <Route path="create-quotation" element={<CreateQuotation />} />
              <Route path="edit-quotation/:id" element={<CreateQuotation />} />
              <Route path="header-image" element={<HeaderImage />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
            </Route>

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
