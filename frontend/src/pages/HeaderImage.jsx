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
          state: data.state || 'UP',
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#2e7d32' }} />
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

              <Grid item xs={12} sm={4}>
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
              subtitle="Printed on the top-right box of every generated PDF"
            />

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Typography variant="body2" color="#64748b" mb={2}>
                  Upload a high quality transparent PNG or JPEG image.
                </Typography>
                
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  startIcon={<CloudUploadIcon fontSize="small" />}
                  sx={{
                    color: '#2e7d32',
                    borderColor: '#a5d6a7',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 0.8,
                    '&:hover': { borderColor: '#2e7d32', bgcolor: '#e8f5e9' }
                  }}
                >
                  {logoFile ? logoFile.name : 'Choose Logo File'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>

                {logoFile && (
                  <Typography variant="caption" display="block" color="#2e7d32" sx={{ mt: 1, fontWeight: 700 }}>
                    Selected: {logoFile.name}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={5}>
                <Typography variant="caption" fontWeight="700" color="#475569" display="block" mb={1}>
                  Current Active Logo:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8fafc', minHeight: 90, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt="Current Header Logo"
                      style={{ maxWidth: '100%', maxHeight: '75px', objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">No logo uploaded yet</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Submit Button */}
          <Box display="flex" justifyContent="flex-end" mt={3} mb={6}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              sx={{
                bgcolor: '#2e7d32',
                px: 3.5,
                py: 1.2,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
                '&:hover': { bgcolor: '#1b5e20', boxShadow: '0 4px 14px rgba(46, 125, 50, 0.35)' }
              }}
            >
              {loading ? 'Saving Changes...' : 'Save Company Details & Logo'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default HeaderImage;
