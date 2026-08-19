import React, { useState, useContext, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import api from '../utils/axiosConfig';
import { AuthContext } from '../contexts/AuthContext';

const ProfileSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and Email are required');
      return;
    }

    if (user?.role === 'admin' && password) {
      if (!currentPassword.trim()) {
        setErrorMsg('Please enter your current password to set a new password');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('New passwords do not match');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = { name, email, phone };
      if (user?.role === 'admin' && password) {
        payload.password = password;
        payload.currentPassword = currentPassword;
      }

      const { data } = await api.put('/auth/profile', payload);
      updateUser(data);
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 3, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 650, margin: '0 auto' }}>
        
        {/* Top Header */}
        <Box sx={{ mb: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', fontSize: '1.65rem', m: 0 }}>
              Profile Settings
            </Typography>
            <Box
              sx={{
                width: 26,
                height: 26,
                bgcolor: '#e8f5e9',
                border: '1px solid #c8e6c9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <EditIcon sx={{ fontSize: 14, color: '#16a34a' }} />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.88rem' }}>
            Update your personal profile information and change login credentials
          </Typography>
        </Box>

        {/* Success / Error Alerts */}
        {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{errorMsg}</Alert>}

        {/* Form Container */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                Full Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                Email Address
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                Phone Number
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91-8564964786"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              />
            </Grid>

            {/* Conditionally render Password Change only if current user is Admin */}
            {user?.role === 'admin' && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ borderBottom: '1px solid #f1f5f9', my: 1 }} />
                  <Typography variant="subtitle2" color="#0f172a" fontWeight="700" mb={1}>
                    Change Password (optional)
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" fontWeight="600" color="#ef4444" mb={0.5} display="block">
                    Current Password (Required to set a new password)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                    New Password
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                    Confirm New Password
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  fontSize: '0.88rem',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#15803d',
                    boxShadow: 'none'
                  }
                }}
              >
                {submitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default ProfileSettings;
