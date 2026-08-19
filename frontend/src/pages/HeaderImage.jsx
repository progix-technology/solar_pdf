import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  TextField,
  Grid,
  Divider,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import api from '../utils/axiosConfig';

const SectionHeader = ({ number, title, subtitle }) => (
  <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: '#e8f5e9',
        color: '#2e7d32',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '0.95rem',
        border: '1px solid rgba(46, 125, 50, 0.2)'
      }}
    >
      {number}
    </Box>
    <Box>
      <Typography variant="h6" fontWeight="700" sx={{ color: '#1e293b', fontSize: '1.1rem', letterSpacing: '-0.2px' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.2 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const HeaderImage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phoneNumbers: '',
    gstNumber: '',
    state: '',
    themeColor: '#38761d'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setFormData({
          companyName: data.companyName || '',
          address: data.address || '',
          phoneNumbers: data.phoneNumbers || '',
          gstNumber: data.gstNumber || '',
          state: data.state || '',
          themeColor: data.themeColor || '#38761d',
        });
        if (data.logoUrl) {
          const baseUrl = api.defaults.baseURL.replace('/api', '');
          const url = (data.logoUrl.startsWith('http') || data.logoUrl.startsWith('data:')) ? data.logoUrl : `${baseUrl}${data.logoUrl}`;
          setCurrentImage(url);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    const data = new FormData();
    data.append('companyName', formData.companyName);
    data.append('address', formData.address);
    data.append('phoneNumbers', formData.phoneNumbers);
    data.append('gstNumber', formData.gstNumber);
    data.append('state', formData.state);
    data.append('themeColor', formData.themeColor || '#38761d');

    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      const res = await api.put('/settings', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMsg('Company details & logo saved successfully! They will now automatically appear on all PDF proposals.');
      if (res.data.logoUrl) {
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        const url = (res.data.logoUrl.startsWith('http') || res.data.logoUrl.startsWith('data:')) ? res.data.logoUrl : `${baseUrl}${res.data.logoUrl}`;
        setCurrentImage(url);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update company settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="70vh"
        sx={{
          background: 'transparent',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Rotating Sun Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#fef08a', // Soft yellow background
              mb: 2.5,
              animation: 'spin 4s linear infinite',
              border: '2px solid #facc15',
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.4)',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            <WbSunnyIcon sx={{ fontSize: 44, color: '#eab308' }} />
          </Box>

          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 700, 
              color: '#0f172a',
              letterSpacing: '-0.3px',
              mb: 1
            }}
          >
            Loading Settings
          </Typography>

          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b', 
              fontSize: '0.82rem',
              animation: 'pulse 1.8s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1 }
              }
            }}
          >
            Syncing secure database settings...
          </Typography>

          {/* Bottom linear progress accent */}
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: '100%', 
              height: 4, 
              bgcolor: '#f1f5f9',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                width: '40%', 
                height: '100%', 
                bgcolor: '#16a34a', 
                borderRadius: '2px',
                animation: 'loadingProgress 1.6s ease-in-out infinite',
                '@keyframes loadingProgress': {
                  '0%': { marginLeft: '-40%' },
                  '100%': { marginLeft: '100%' }
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  const cardStyle = {
    p: { xs: 2.5, sm: 3.5 },
    mb: 3,
    borderRadius: '12px',
    bgcolor: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
      <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Top Header */}
        <Box mb={3.5}>
          <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
            Company &amp; Header Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
            Configure your company profile and header logo rendered at the top of all PDF quotations
          </Typography>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{errorMsg}</Alert>}

        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Company Details */}
          <Paper elevation={0} sx={cardStyle}>
            <SectionHeader
              number="1"
              title="Company Details (Left Header)"
              subtitle="Printed on the top-left box of every generated PDF"
            />

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. SOLAR CIRCLE"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. UP"
                />
              </Grid>

              <Grid item xs={12} sm={2} display="flex" flexDirection="column" justifyContent="center">
                <Typography variant="caption" fontWeight="700" color="#475569" mb={0.3} display="block" sx={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Theme Color
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <input
                    type="color"
                    name="themeColor"
                    value={formData.themeColor || '#38761d'}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      width: '38px',
                      height: '32px',
                      padding: '2px',
                      cursor: 'pointer',
                      background: '#ffffff'
                    }}
                  />
                  <Typography variant="caption" fontWeight="600" color="#64748b" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {formData.themeColor || '#38761d'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Registered Office Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 159/19, Rakabganj, Lko-226018"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number(s)"
                  name="phoneNumbers"
                  value={formData.phoneNumbers}
                  onChange={handleChange}
                  placeholder="e.g. +91-8564964786/ +91-8299204171"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="GSTIN Number"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="e.g. 09GXKPK4906A1ZH"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Logo */}
          <Paper elevation={0} sx={cardStyle}>
            <SectionHeader
              number="2"
              title="Company Logo (Right Header)"
              subtitle="Upload your transparent PNG/JPG logo to render on the top-right box"
            />

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} display="flex" justifyContent="center">
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 320,
                    height: 140,
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f8fafc',
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    position: 'relative'
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                  <CloudUploadIcon sx={{ fontSize: 32, color: '#64748b', mb: 1 }} />
                  <Typography variant="body2" fontWeight="600" color="#334155">
                    Click to upload logo image
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    transparent PNG recommended
                  </Typography>
                  {logoFile && (
                    <Box sx={{ mt: 1, bgcolor: '#dcfce7', px: 1.5, py: 0.3, borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                      <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                        {logoFile.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight="700" color="#64748b" mb={1} sx={{ textTransform: 'uppercase' }}>
                    Active Logo Preview
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 220,
                      height: 110,
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#ffffff',
                      p: 1.5,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {currentImage ? (
                      <Box
                        component="img"
                        src={currentImage}
                        alt="Company Logo"
                        sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        No logo active
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Submit Action */}
          <Box display="flex" justifyContent="flex-end" mt={3} mb={6}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
                px: 4,
                py: 1.2,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#15803d',
                  boxShadow: 'none'
                }
              }}
            >
              {loading ? 'Saving Settings...' : 'Save Configuration'}
            </Button>
          </Box>

        </form>
      </Box>
    </Box>
  );
};

export default HeaderImage;
