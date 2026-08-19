import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert, Chip, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import api from '../utils/axiosConfig';
import { AuthContext } from '../contexts/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { user: loggedInUser } = useContext(AuthContext);

  // Dialog State
  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      setErrorMsg('Failed to load users list');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setSuccessMsg('');
    setErrorMsg('');
    setOpenAddModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('All fields are required');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/auth/users', { name, email, password, role });
      setOpenAddModal(false);
      setSuccessMsg(`User "${name}" created successfully!`);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, userName, currentStatus) => {
    const action = currentStatus !== false ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user "${userName}"?`)) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.put(`/auth/users/${id}/status`);
      setSuccessMsg(`User "${userName}" status updated successfully`);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Filter out the currently logged-in admin from the table list
  const filteredUsers = users.filter(u => u._id !== loggedInUser?._id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 3, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* Top Header & Add User Button */}
        <Box sx={{ mb: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', fontSize: '1.65rem', m: 0 }}>
                User Management
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
                <PeopleIcon sx={{ fontSize: 15, color: '#16a34a' }} />
              </Box>
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={handleOpenAddModal}
              sx={{
                bgcolor: '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '6px',
                textTransform: 'none',
                px: 2.5,
                py: 0.9,
                fontSize: '0.88rem',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#15803d',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                },
              }}
            >
              + Add New User
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.88rem' }}>
            Manage SaaS users, add new operators, and assign access roles
          </Typography>
        </Box>

        {/* Success Alert */}
        {successMsg && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              bgcolor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              p: 1.5,
              px: 2.5,
              mb: 3
            }}
          >
            <PeopleIcon sx={{ color: '#16a34a', fontSize: 20, mr: 1.5 }} />
            <Typography sx={{ fontWeight: 600, color: '#166534', fontSize: '0.88rem' }}>
              {successMsg}
            </Typography>
          </Box>
        )}

        {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{errorMsg}</Alert>}

        {/* Users Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            bgcolor: '#ffffff'
          }}
        >
          <Table sx={{ minWidth: 700 }} size="small">
            <TableHead sx={{ bgcolor: '#166534' }}>
              <TableRow>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  User Name
                </TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  Email Address
                </TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  Role
                </TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  Created At
                </TableCell>
                <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', width: 220, borderBottom: 'none' }}>
                  Status / Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>
                    No other users added yet. Click "+ Add New User" above to add operators.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u._id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, py: 1.8, px: 3, color: '#0f172a' }}>
                      {u.name}
                    </TableCell>
                    <TableCell sx={{ py: 1.8, px: 3, color: '#475569', fontSize: '0.88rem' }}>
                      {u.email}
                    </TableCell>
                    <TableCell sx={{ py: 1.8, px: 3 }}>
                      <Chip
                        label={u.role.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: u.role === 'admin' ? '#fee2e2' : '#dcfce7',
                          color: u.role === 'admin' ? '#ef4444' : '#16a34a',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.8, px: 3, color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.8, px: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1.2}>
                        <Switch
                          checked={u.isActive !== false}
                          onChange={() => handleToggleStatus(u._id, u.name, u.isActive)}
                          color="success"
                          size="small"
                        />
                        <Chip
                          label={u.isActive !== false ? 'Active' : 'Suspended'}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: u.isActive !== false ? '#dcfce7' : '#fee2e2',
                            color: u.isActive !== false ? '#16a34a' : '#ef4444',
                            borderRadius: '4px',
                            fontSize: '0.72rem'
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add New User Modal */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        PaperProps={{ sx: { borderRadius: '10px', p: 1, minWidth: { xs: 300, sm: 420 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', pb: 1 }}>
          Create New SaaS User
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Fill in the credentials below. The user will be able to log in immediately with isolated data access.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <TextField
              label="Full Name"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amit Sharma"
            />
            <TextField
              label="Email Address"
              fullWidth
              size="small"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. amit@example.com"
            />
            <TextField
              label="Password"
              fullWidth
              size="small"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. min 6 characters"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="user">User / Operator</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAddModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={submitting}
            sx={{
              textTransform: 'none',
              bgcolor: '#16a34a',
              fontWeight: 700,
              borderRadius: '6px',
              '&:hover': { bgcolor: '#15803d' }
            }}
          >
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
