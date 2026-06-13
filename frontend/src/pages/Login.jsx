import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  Grid
} from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFDE7', // Light yellow background
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        p: 2
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 450, zIndex: 1 }}>
        {/* Heading Outside the Box */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <WbSunnyIcon sx={{ fontSize: 50, color: '#FBC02D', mb: 1 }} />
          <Typography component="h1" variant="h4" align="center" fontWeight="900" sx={{ color: '#4CAF50', letterSpacing: '-0.5px' }}>
            Solar Quotation Generator
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: '#666', fontWeight: 'bold' }}>
            by Progix
          </Typography>
        </Box>

        {/* Login Box */}
        <Paper 
          elevation={12} 
          sx={{ 
            p: { xs: 4, md: 5 }, 
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Typography component="h2" variant="h6" align="center" gutterBottom fontWeight="bold" color="textSecondary">
            Admin Login
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#4CAF50' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4CAF50' }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#4CAF50' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4CAF50' }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 4, 
                mb: 2, 
                py: 1.5, 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                borderRadius: 2,
                bgcolor: '#2E7D32',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(46, 125, 50, 0.39)',
                '&:hover': {
                  bgcolor: '#43A047',
                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.23)'
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
