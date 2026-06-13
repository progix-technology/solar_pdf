import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Box, Typography, TextField, Button, Paper, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const CreateQuotation = () => {
  const [formData, setFormData] = useState({
    quotationTitle: 'Quotation for',
    customerName: '',
    customerAddress: '',
    contactNumber: '',
    siteAddress: '',
    quotationDate: new Date().toISOString().split('T')[0],
    templateId: '',
    gstPercentage: 18,
  });

  const [columns, setColumns] = useState(['S.No', 'Particular', 'Qty', 'UOM', 'Make', 'Price', 'Amount']);
  const [rows, setRows] = useState([
    { 'S.No': '1', 'Particular': '', 'Qty': '1', 'UOM': 'Nos', 'Make': '', 'Price': '0', 'Amount': '0' }
  ]);

  const [firstPageNotes, setFirstPageNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [prePages, setPrePages] = useState([]);
  const [postPages, setPostPages] = useState([]);

  const [templates, setTemplates] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, gstAmount: 0, grandTotal: 0 });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  // PDF Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');
  const [pdfFilename, setPdfFilename] = useState('');

  // Column Edit Modal State
  const [colModalOpen, setColModalOpen] = useState(false);
  const [editingColIndex, setEditingColIndex] = useState(null);
  const [newColName, setNewColName] = useState('');

  useEffect(() => {
    const fetchTemplatesAndData = async () => {
      try {
        const { data: tmplData } = await api.get('/templates');
        setTemplates(tmplData);

        if (id) {
          // Edit Mode
          const { data: qData } = await api.get(`/quotations/${id}`);
          setFormData({
            quotationTitle: qData.quotationTitle || 'Quotation for',
            customerName: qData.customerName || '',
            customerAddress: qData.customerAddress || '',
            contactNumber: qData.contactNumber || '',
            siteAddress: qData.siteAddress || '',
            quotationDate: new Date(qData.quotationDate).toISOString().split('T')[0],
            templateId: qData.templateId || tmplData[0]?._id || '',
            gstPercentage: qData.gstPercentage || 18,
          });
          setColumns(qData.columns || []);
          setRows(qData.rows || []);
          setFirstPageNotes(qData.firstPageNotes || '');
          setTermsAndConditions(qData.termsAndConditions || '');
          setPrePages(qData.prePages || []);
          setPostPages(qData.postPages || []);
        } else {
          // New Mode
          if (tmplData.length > 0) {
            setFormData(prev => ({ ...prev, templateId: tmplData[0]._id }));
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to fetch data');
      }
    };
    fetchTemplatesAndData();
  }, [id]);

  useEffect(() => {
    calculateTotals(rows);
  }, [rows]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRowChange = (rowIndex, colName, value) => {
    const newRows = [...rows];
    newRows[rowIndex][colName] = value;

    // Auto calculate Amount if Qty and Price exist
    if ((colName === 'Qty' || colName === 'Price') && columns.includes('Amount')) {
      const qty = Number(newRows[rowIndex]['Qty'] || 0);
      const price = Number(newRows[rowIndex]['Price'] || 0);
      newRows[rowIndex]['Amount'] = String(qty * price);
    }

    setRows(newRows);
  };

  const addRow = () => {
    const newRow = {};
    columns.forEach(col => newRow[col] = '');
    if (columns.includes('S.No')) {
      newRow['S.No'] = String(rows.length + 1);
    }
    setRows([...rows, newRow]);
  };

  const removeRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    if (columns.includes('S.No')) {
      newRows.forEach((r, i) => { r['S.No'] = String(i + 1); });
    }
    setRows(newRows);
  };

  const handleAddColumn = () => {
    const newCol = `Column ${columns.length + 1}`;
    setColumns([...columns, newCol]);
    const newRows = rows.map(r => ({ ...r, [newCol]: '' }));
    setRows(newRows);
  };

  const openEditColumn = (index) => {
    setEditingColIndex(index);
    setNewColName(columns[index]);
    setColModalOpen(true);
  };

  const saveColumnName = () => {
    if (!newColName.trim() || columns.includes(newColName)) {
      setColModalOpen(false);
      return;
    }
    const oldColName = columns[editingColIndex];
    const newColumns = [...columns];
    newColumns[editingColIndex] = newColName;

    const newRows = rows.map(r => {
      const updatedRow = { ...r };
      updatedRow[newColName] = updatedRow[oldColName];
      delete updatedRow[oldColName];
      return updatedRow;
    });

    setColumns(newColumns);
    setRows(newRows);
    setColModalOpen(false);
  };

  const deleteColumn = (index) => {
    const colName = columns[index];
    const newColumns = columns.filter((_, i) => i !== index);
    const newRows = rows.map(r => {
      const updatedRow = { ...r };
      delete updatedRow[colName];
      return updatedRow;
    });
    setColumns(newColumns);
    setRows(newRows);
  };

  const calculateTotals = (currentRows) => {
    if (!columns.includes('Amount')) return;
    const subtotal = currentRows.reduce((acc, row) => acc + Number(row['Amount'] || 0), 0);
    const grandTotal = subtotal; // GST is inclusive
    setTotals({ subtotal, gstAmount: 0, grandTotal });
  };

  const addPrePage = () => setPrePages([...prePages, '']);
  const removePrePage = (index) => setPrePages(prePages.filter((_, i) => i !== index));
  const updatePrePage = (index, value) => {
    const newPages = [...prePages];
    newPages[index] = value;
    setPrePages(newPages);
  };

  const addPostPage = () => setPostPages([...postPages, '']);
  const removePostPage = (index) => setPostPages(postPages.filter((_, i) => i !== index));
  const updatePostPage = (index, value) => {
    const newPages = [...postPages];
    newPages[index] = value;
    setPostPages(newPages);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (rows.length === 0) {
      setErrorMsg('Please add at least one row.');
      return;
    }

    try {
      const payload = {
        ...formData,
        columns,
        rows,
        ...totals,
        firstPageNotes,
        termsAndConditions,
        prePages,
        postPages
      };

      let res;
      if (id) {
        res = await api.put(`/quotations/${id}`, payload);
        setSuccessMsg('PDF Updated! Generating preview...');
      } else {
        res = await api.post('/quotations', payload);
        setSuccessMsg('PDF Generated! Generating preview...');
      }

      if (res.data._id) {
        try {
          // Fetch HTML from backend
          const pdfResponse = await api.get(`/quotations/${res.data._id}/pdf`);
          const htmlContent = pdfResponse.data;
          
          const opt = { 
            margin: 0, 
            filename: `Quotation_${res.data.quotationNumber}.pdf`, 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, useCORS: true }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
          };
          
          const pdfBlob = await html2pdf().set(opt).from(htmlContent).output('blob');
          const pdfBlobUrl = URL.createObjectURL(pdfBlob);
          
          setPdfBlobUrl(pdfBlobUrl);
          setPdfFilename(`Quotation_${res.data.quotationNumber}.pdf`);
          setPreviewModalOpen(true);
          
          if (!id) {
            navigate(`/edit-quotation/${res.data._id}`, { replace: true });
          }

        } catch (pdfErr) {
          console.error('Error generating PDF on frontend:', pdfErr);
          alert('Failed to generate the PDF: ' + (pdfErr.response?.data?.message || pdfErr.message));
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create quotation');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#4CAF50', letterSpacing: '-0.5px' }}>
              {id ? 'Edit Quotation' : 'Create New Quotation'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              {id ? 'Update your solar proposal details below' : 'Fill in the details to generate a stunning solar proposal'}
            </Typography>
          </Box>
          <Button variant="outlined" sx={{ color: '#4CAF50', borderColor: '#4CAF50', fontWeight: 'bold', '&:hover': { borderColor: '#43A047', bgcolor: 'rgba(76, 175, 80, 0.05)' } }} onClick={() => navigate('/quotations')}>
            Back to Dashboard
          </Button>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{errorMsg}</Alert>}

      <form onSubmit={handleSubmit}>

        {/* Step 1: Pre-Quotation Pages */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid rgba(224, 224, 224, 0.5)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)' }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }}>1. Cover Pages / Prefaces (Before Quotation)</Typography>
            <Button variant="outlined" sx={{ color: '#4CAF50', borderColor: '#4CAF50', '&:hover': { borderColor: '#43A047', bgcolor: 'rgba(76, 175, 80, 0.05)' } }} onClick={addPrePage} startIcon={<AddCircleIcon />}>
              Add New Cover Page
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Each editor below represents exactly one full page in the generated PDF. Add as many pages as you need.
          </Typography>
          {prePages.map((pageContent, index) => (
            <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">Cover Page {index + 1}</Typography>
                <IconButton color="error" size="small" onClick={() => removePrePage(index)}><DeleteIcon /></IconButton>
              </Box>
              <Box sx={{ height: 250, mb: 4 }}>
                <ReactQuill
                  theme="snow"
                  value={pageContent}
                  onChange={(val) => updatePrePage(index, val)}
                  style={{ height: '100%' }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['clean']
                    ],
                  }}
                />
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Step 2: Customer Details */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid rgba(224, 224, 224, 0.5)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50', mb: 3 }}>2. Customer Details</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Quotation Title" name="quotationTitle" required value={formData.quotationTitle} onChange={handleChange} helperText="e.g. Quotation for 10kW Solar System" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Customer Name" name="customerName" required value={formData.customerName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Customer Address" name="customerAddress" multiline rows={2} value={formData.customerAddress} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Site Address" name="siteAddress" multiline rows={2} value={formData.siteAddress} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Quotation Date" name="quotationDate" InputLabelProps={{ shrink: true }} required value={formData.quotationDate} onChange={handleChange} />
            </Grid>

          </Grid>
        </Paper>

        {/* Step 3: Dynamic Table */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid rgba(224, 224, 224, 0.5)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)' }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }}>3. Data Table</Typography>
            <Box display="flex" gap={2} width={{ xs: '100%', sm: 'auto' }}>
              <Button startIcon={<AddCircleIcon />} variant="outlined" onClick={handleAddColumn} sx={{ flex: { xs: 1, sm: 'none' }, color: '#4CAF50', borderColor: '#4CAF50', '&:hover': { borderColor: '#43A047', bgcolor: 'rgba(76, 175, 80, 0.05)' } }}>Add Column</Button>
              <Button startIcon={<AddCircleIcon />} sx={{ flex: { xs: 1, sm: 'none' }, bgcolor: '#4CAF50', color: '#fff', '&:hover': { bgcolor: '#43A047', boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)' } }} variant="contained" onClick={addRow}>Add Row</Button>
            </Box>
          </Box>

          <TableContainer variant="outlined" sx={{ mb: 3, border: 'none', borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)' }}>
            <Table>
              <TableHead sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)' }}>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell key={index} sx={{ minWidth: 150, color: '#fff', fontWeight: 'bold', py: 2, borderBottom: 'none' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pr: 1 }}>{col}</Typography>
                        <Box display="flex" flexWrap="nowrap">
                          <IconButton size="small" sx={{ p: 0.5, mr: 0.5, color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.2)' } }} onClick={() => openEditColumn(index)}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" sx={{ p: 0.5, color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#f44336', bgcolor: 'rgba(244,67,54,0.1)' } }} onClick={() => deleteColumn(index)} disabled={columns.length === 1}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell align="center" width="80px" sx={{ color: '#fff', fontWeight: 'bold', py: 2, borderBottom: 'none' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: '#fafafa' } }}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} sx={{ py: 2 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={row[col] || ''}
                          onChange={(e) => handleRowChange(rowIndex, col, e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 1.5 } }}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ py: 2 }}>
                      <IconButton 
                        sx={{ color: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.05)', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.15)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }} 
                        onClick={() => removeRow(rowIndex)} 
                        disabled={rows.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </Paper>

        {/* Step 4: First Page Notes */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid rgba(224, 224, 224, 0.5)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)' }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }} mb={0}>4. First Page Notes (Amount in Words / Extra Info)</Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            This text will appear at the bottom of the first page, just under the Total Amount block. Use this for Amount in Words, short notes, or special details.
          </Typography>
          <Box sx={{ height: 200, mb: 6 }}>
            <ReactQuill
              theme="snow"
              value={firstPageNotes}
              onChange={setFirstPageNotes}
              style={{ height: '100%' }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
            />
          </Box>

          <Box display="flex" justifyContent="center">
            <Paper sx={{ p: 3, bgcolor: 'grey.50', width: '100%', minWidth: { xs: 'auto', sm: 400 }, maxWidth: 500, textAlign: 'center' }} variant="outlined">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">Total Amount:</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }}>₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
            </Paper>
          </Box>

        </Paper>

        {/* Step 5: Terms, Conditions & Formatted Text */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid rgba(224, 224, 224, 0.5)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)' }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }}>5. Terms & Conditions</Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Use the editor below to format your text (Bold, Italic, Headings). This content will automatically appear on its own dedicated page.
          </Typography>

          <Box sx={{ height: 300, mb: 6 }}>
            <ReactQuill
              theme="snow"
              value={termsAndConditions}
              onChange={setTermsAndConditions}
              style={{ height: '100%' }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
            />
          </Box>
        </Paper>

        {/* Step 6: Post-Quotation Pages */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid rgba(224, 224, 224, 0.5)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)' }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }}>6. Annexure / Extra Pages (After Terms & Conditions)</Typography>
            <Button variant="outlined" sx={{ color: '#4CAF50', borderColor: '#4CAF50', '&:hover': { borderColor: '#43A047', bgcolor: 'rgba(76, 175, 80, 0.05)' } }} onClick={addPostPage} startIcon={<AddCircleIcon />}>
              Add New Annexure Page
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Need more pages after the Terms & Conditions? Add them here. Each editor creates exactly one full page in the generated PDF.
          </Typography>
          {postPages.map((pageContent, index) => (
            <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">Annexure Page {index + 1}</Typography>
                <IconButton color="error" size="small" onClick={() => removePostPage(index)}><DeleteIcon /></IconButton>
              </Box>
              <Box sx={{ height: 250, mb: 4 }}>
                <ReactQuill
                  theme="snow"
                  value={pageContent}
                  onChange={(val) => updatePostPage(index, val)}
                  style={{ height: '100%' }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['clean']
                    ],
                  }}
                />
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Generate Button */}
        <Box textAlign="center" mb={8} mt={6}>
          <Button type="submit" variant="contained" size="large" sx={{ 
            px: 8, 
            py: 2.5, 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            bgcolor: '#4CAF50', 
            borderRadius: 3, 
            textTransform: 'none',
            boxShadow: '0 8px 24px 0 rgba(76, 175, 80, 0.4)',
            '&:hover': { bgcolor: '#43A047', boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)', transform: 'translateY(-2px)' },
            transition: 'all 0.2s'
          }}>
            {id ? 'UPDATE QUOTATION PDF' : 'GENERATE QUOTATION PDF'}
          </Button>
        </Box>
      </form>
    </Box>

      {/* Edit Column Modal */}
      <Dialog open={colModalOpen} onClose={() => setColModalOpen(false)}>
        <DialogTitle>Edit Column Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Name"
            fullWidth
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColModalOpen(false)}>Cancel</Button>
          <Button onClick={saveColumnName} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* PDF Preview Modal */}
      <Dialog open={previewModalOpen} onClose={() => setPreviewModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
          {pdfBlobUrl && (
            <iframe src={pdfBlobUrl} width="100%" height="100%" style={{ border: 'none' }} title="PDF Preview" />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewModalOpen(false)} color="secondary" variant="outlined">Close Preview</Button>
          <Button onClick={() => {
            const a = document.createElement('a');
            a.href = pdfBlobUrl;
            a.download = pdfFilename;
            a.click();
            setPreviewModalOpen(false);
          }} color="primary" variant="contained">
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateQuotation;
