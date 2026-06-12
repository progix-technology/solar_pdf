import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import api from '../utils/axiosConfig';

const HeaderImage = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.logoUrl) {
          const baseUrl = api.defaults.baseURL.replace('/api', '');
          setCurrentImage(`${baseUrl}${data.logoUrl}`);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!logoFile) {
      setErrorMsg('Please select an image first.');
      return;
    }

    const data = new FormData();
    data.append('logo', logoFile);

    try {
      const res = await api.put('/settings', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMsg('Header Image updated successfully!');
      if (res.data.logoUrl) {
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        setCurrentImage(`${baseUrl}${res.data.logoUrl}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update image');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Upload Header Image
      </Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle1" gutterBottom>
            Select an image that will appear at the top of every generated PDF:
          </Typography>
          <Box mt={2} mb={3}>
            <input
              accept="image/*"
              type="file"
              onChange={handleFileChange}
              style={{ padding: '10px 0' }}
            />
          </Box>
          <Button type="submit" variant="contained" size="large">
            Save Header Image
          </Button>
        </form>
      </Paper>

      {currentImage && (
        <Box mt={4}>
          <Typography variant="h6" mb={2}>Current Header Image:</Typography>
          <Paper sx={{ p: 2, display: 'inline-block' }}>
            <img src={currentImage} alt="Header" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default HeaderImage;
