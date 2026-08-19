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
  Link
} from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PowerIcon from '@mui/icons-material/Power';

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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFFDF0 0%, #E8F5E9 100%)', // Soft warm yellow to light green gradient
        position: 'absolute',
        top: 0,
        left: 0,
        overflowY: 'auto',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 450, zIndex: 1, my: 'auto' }}>
        
        {/* Brand Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#ffffff',
              border: '1px solid #c8e6c9',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
              mb: 1.5
            }}
          >
            <WbSunnyIcon sx={{ fontSize: 34, color: '#facc15' }} />
          </Box>
          <Typography 
            variant="h4" 
            align="center" 
            fontWeight="900" 
            sx={{ 
              color: '#15803d', 
              letterSpacing: '-0.8px', 
              fontSize: '1.95rem',
              lineHeight: 1.2
            }}
          >
            Solar Quotation Generator
          </Typography>
          <Typography 
            variant="caption" 
            align="center" 
            sx={{ 
              color: '#16a34a', 
              fontWeight: 800, 
              letterSpacing: '1px',
              textTransform: 'uppercase',
              mt: 0.5 
            }}
          >
            User & Admin Portal
          </Typography>
        </Box>

        {/* Login Card Container */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, sm: 4.5 }, 
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)'
          }}
        >
          <Typography 
            component="h2" 
            variant="h6" 
            align="center" 
            fontWeight="700" 
            color="#0f172a"
            sx={{ mb: 0.5 }}
          >
            Sign In
          </Typography>
          <Typography 
            variant="caption" 
            align="center" 
            display="block" 
            color="textSecondary"
            sx={{ mb: 4 }}
          >
            Enter your email and password to access your secure dashboard
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '8px', 
                fontWeight: 500,
                fontSize: '0.82rem'
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&.Mui-focused fieldset': { borderColor: '#16a34a' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#16a34a' }
              }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&.Mui-focused fieldset': { borderColor: '#16a34a' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#16a34a' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 1.5,
                py: 1.2, 
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: '#16a34a',
                color: '#ffffff',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#15803d',
                  boxShadow: 'none'
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>

        {/* Developed by Progix Footer */}
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.8 }}>
            <PowerIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Developed &amp; Powered by Progix Technology
            </Typography>
          </Box>
          <Link
            href="mailto:progixtechnology@gmail.com"
            underline="hover"
            sx={{
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}
          >
            progixtechnology@gmail.com
          </Link>
        </Box>
        
      </Box>
    </Box>
  );
};

export default Login;
