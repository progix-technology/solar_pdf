import React, { useState, useEffect, useRef } from 'react';
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

  const [templates, setTemplates] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, gstAmount: 0, grandTotal: 0 });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  const quillRef = useRef(null);

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

  const insertPageBreak = () => {
    const quill = quillRef.current.getEditor();
    const cursorPosition = quill.getSelection()?.index || 0;
    // Insert a clear page break div using standard HTML
    quill.clipboard.dangerouslyPasteHTML(cursorPosition, '<div style="page-break-before: always; margin: 20px 0; border-top: 2px dashed #ccc; text-align: center; color: #ccc;" class="pdf-page-break">--- PAGE BREAK ---</div><p><br></p>');
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
        termsAndConditions
      };

      let res;
      if (id) {
        res = await api.put(`/quotations/${id}`, payload);
        setSuccessMsg('PDF Updated successfully! Opening in a new tab...');
      } else {
        res = await api.post('/quotations', payload);
        setSuccessMsg('PDF Generated successfully! Opening in a new tab...');
      }

      if (res.data._id) {
        try {
          const pdfResponse = await api.get(`/quotations/${res.data._id}/pdf`, { responseType: 'blob' });
          const file = new Blob([pdfResponse.data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        } catch (pdfErr) {
          console.error('Error fetching newly generated PDF:', pdfErr);
          if (pdfErr.response && pdfErr.response.data instanceof Blob) {
            const text = await pdfErr.response.data.text();
            try {
              const errData = JSON.parse(text);
              alert('Server Error during PDF fetch: ' + (errData.error || errData.message || text));
            } catch(e) {
              alert('Server Error during PDF fetch: ' + text);
            }
          } else {
            alert('Failed to fetch the newly generated PDF: ' + (pdfErr.response?.data?.message || pdfErr.message));
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        quotationTitle: 'Quotation for',
        customerName: '',
        customerAddress: '',
        contactNumber: '',
        siteAddress: ''
      }));
      setRows([{ 'S.No': '1', 'Particular': '', 'Qty': '1', 'UOM': 'Nos', 'Make': '', 'Price': '0', 'Amount': '0' }]);
      setColumns(['S.No', 'Particular', 'Qty', 'UOM', 'Make', 'Price', 'Amount']);
      setFirstPageNotes('');
      setTermsAndConditions('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create quotation');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          {id ? 'Edit Quotation PDF' : 'Generate New Quotation PDF'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/quotations')}>Back to List</Button>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <form onSubmit={handleSubmit}>

        {/* Step 1: Customer Details */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">1. Customer Details</Typography>
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
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Template" name="templateId" required value={formData.templateId} onChange={handleChange}>
                {templates.map(t => (
                  <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Step 2: Dynamic Table */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">2. Data Table</Typography>
            <Box>
              <Button startIcon={<AddCircleIcon />} variant="outlined" onClick={handleAddColumn} sx={{ mr: 2 }}>Add Column</Button>
              <Button startIcon={<AddCircleIcon />} variant="contained" onClick={addRow}>Add Row</Button>
            </Box>
          </Box>

          <TableContainer variant="outlined" sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell key={index} sx={{ minWidth: 120 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <strong>{col}</strong>
                        <Box>
                          <IconButton size="small" onClick={() => openEditColumn(index)}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => deleteColumn(index)} disabled={columns.length === 1}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell width="60px"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex}>
                        <TextField
                          size="small"
                          fullWidth
                          value={row[col] || ''}
                          onChange={(e) => handleRowChange(rowIndex, col, e.target.value)}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeRow(rowIndex)} disabled={rows.length === 1}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </Paper>

        {/* Step 3: First Page Notes */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" mb={2}>3. First Page Notes (Amount in Words / Extra Info)</Typography>
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
            <Paper sx={{ p: 3, bgcolor: 'grey.50', minWidth: 400, textAlign: 'center' }} variant="outlined">
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal:</Typography>
                <Typography>₹{totals.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>GST:</Typography>
                <Typography>Inc/-</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">Grand Total:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">₹{totals.grandTotal.toFixed(2)}</Typography>
              </Box>
            </Paper>
          </Box>

        </Paper>

        {/* Step 4: Terms, Conditions & Formatted Text */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">4. Terms & Conditions / Page 2 Details</Typography>
            <Button variant="outlined" color="secondary" onClick={insertPageBreak}>
              + Insert Page Break (New Page)
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Use the editor below to format your text (Bold, Italic, Headings) and insert page breaks. This content will appear at the bottom or on new pages of your PDF.
          </Typography>

          <Box sx={{ height: 300, mb: 6 }}>
            <ReactQuill
              ref={quillRef}
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

        {/* Generate Button */}
        <Box textAlign="center" mb={6}>
          <Button type="submit" variant="contained" size="large" sx={{ px: 8, py: 2, fontSize: '1.2rem' }}>
            {id ? 'UPDATE QUOTATION PDF' : 'GENERATE QUOTATION PDF'}
          </Button>
        </Box>
      </form>

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
    </Box>
  );
};

export default CreateQuotation;
