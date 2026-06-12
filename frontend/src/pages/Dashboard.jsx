import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import api from '../utils/axiosConfig';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalTemplates: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [qRes, tRes] = await Promise.all([
          api.get('/quotations'),
          api.get('/templates')
        ]);
        setStats({
          totalQuotations: qRes.data.length,
          totalTemplates: tRes.data.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">Total Quotations</Typography>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {stats.totalQuotations}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">Total Templates</Typography>
            <Typography variant="h3" color="secondary.main" fontWeight="bold">
              {stats.totalTemplates}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
