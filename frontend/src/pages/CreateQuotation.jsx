import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Box, Typography, TextField, Button, Paper, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DownloadIcon from '@mui/icons-material/Download';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const CardHeader = ({ number, title, rightIcon, rightExtra }) => (
  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 2, width: '100%' }}>
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          bgcolor: '#16a34a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.9rem',
          flexShrink: 0
        }}
      >
        {number}
      </Box>
      <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.02rem', m: 0 }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
      {rightIcon}
      {rightExtra}
    </Box>
  </Box>
);

const CreateQuotation = () => {
  const [formData, setFormData] = useState({
    quotationTitle: 'Quotation for 4.0 kw Roof T',
    customerName: '',
    customerAddress: '',
    contactNumber: '',
    siteAddress: '',
    quotationDate: new Date().toISOString().split('T')[0],
    templateId: '',
    gstPercentage: 18,
  });

  const [columns, setColumns] = useState(['S.No', 'Grid System', 'Particular', 'Quantity', 'UOM', 'Make']);
  const [rows, setRows] = useState([
    { 'S.No': '1', 'Grid System': 'PV Modules', 'Particular': 'Mono Perc bifu', 'Quantity': '8', 'UOM': 'Nos', 'Make': 'Premier' },
    { 'S.No': '2', 'Grid System': 'Inverter', 'Particular': '4 KW', 'Quantity': '1', 'UOM': 'SET', 'Make': 'Polycab/Microtek' },
    { 'S.No': '3', 'Grid System': 'Module Mounti', 'Particular': 'PRE GI STRUCT', 'Quantity': '1', 'UOM': 'SET', 'Make': 'Appolo' }
  ]);

  const [firstPageNotes, setFirstPageNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [prePages, setPrePages] = useState([]);
  const [postPages, setPostPages] = useState([]);

  const [templates, setTemplates] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, gstAmount: 0, grandTotal: 0 });
  const [isManualTotal, setIsManualTotal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [latestQuotationId, setLatestQuotationId] = useState(null);
  const [latestQuotationNum, setLatestQuotationNum] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  // PDF Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');
  const [pdfFilename, setPdfFilename] = useState('');

  // Duplicate Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateCustName, setDuplicateCustName] = useState('');
  const [duplicating, setDuplicating] = useState(false);

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
            quotationTitle: qData.quotationTitle || 'Quotation for 4.0 kw Roof T',
            customerName: qData.customerName || '',
            customerAddress: qData.customerAddress || '',
            contactNumber: qData.contactNumber || '',
            siteAddress: qData.siteAddress || '',
            quotationDate: new Date(qData.quotationDate).toISOString().split('T')[0],
            templateId: qData.templateId || tmplData[0]?._id || '',
            gstPercentage: qData.gstPercentage || 18,
          });
          if (qData.columns && qData.columns.length > 0) setColumns(qData.columns);
          if (qData.rows && qData.rows.length > 0) setRows(qData.rows);
          setFirstPageNotes(qData.firstPageNotes || '');
          setTermsAndConditions(qData.termsAndConditions || '');
          setPrePages(qData.prePages || []);
          setPostPages(qData.postPages || []);
          setTotals({ subtotal: qData.subtotal || 0, gstAmount: qData.gstAmount || 0, grandTotal: qData.grandTotal || 0 });
          setLatestQuotationId(id);
          setLatestQuotationNum(qData.quotationNumber);
          setSavedSuccess(true);
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

    if ((colName === 'Quantity' || colName === 'Price' || colName === 'Qty') && columns.includes('Amount')) {
      const qty = Number(newRows[rowIndex]['Quantity'] || newRows[rowIndex]['Qty'] || 0);
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
    if (isManualTotal) return;
    const subtotal = currentRows.reduce((acc, row) => acc + Number(row['Amount'] || 0), 0);
    const grandTotal = subtotal;
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

  const generatePDFOnFrontend = async (quotationId, quotationNumber) => {
    try {
      const pdfResponse = await api.get(`/quotations/${quotationId}/pdf`);
      const htmlContent = pdfResponse.data;

      const opt = {
        margin: 0,
        filename: `Quotation_${quotationNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, windowWidth: 794, width: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const pdfBlob = await html2pdf().set(opt).from(htmlContent).output('blob');
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);

      setPdfBlobUrl(pdfBlobUrl);
      setPdfFilename(`Quotation_${quotationNumber}.pdf`);
      setPreviewModalOpen(true);
    } catch (pdfErr) {
      console.error('Error generating PDF:', pdfErr);
      alert('Failed to generate PDF: ' + (pdfErr.response?.data?.message || pdfErr.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      } else {
        res = await api.post('/quotations', payload);
      }

      if (res.data._id) {
        setSavedSuccess(true);
        setLatestQuotationId(res.data._id);
        setLatestQuotationNum(res.data.quotationNumber);

        // Open preview automatically
        await generatePDFOnFrontend(res.data._id, res.data.quotationNumber);

        if (!id) {
          navigate(`/edit-quotation/${res.data._id}`, { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save quotation');
    }
  };

  const cardStyle = {
    p: 3,
    mb: 3,
    borderRadius: '12px',
    bgcolor: '#ffffff',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 3, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1050, margin: '0 auto' }}>
        
        {/* Title Header */}
        <Box sx={{ mb: 2.5, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', fontSize: '1.65rem' }}>
                {id ? 'Edit Quotation' : 'Create Quotation'}
              </Typography>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  bgcolor: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <EditIcon sx={{ fontSize: 15, color: '#16a34a' }} />
              </Box>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/quotations')}
              sx={{
                color: '#0f172a',
                borderColor: '#e2e8f0',
                bgcolor: '#ffffff',
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 0.7,
                fontSize: '0.82rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
              }}
            >
              Back to Dashboard
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.88rem' }}>
            {id ? 'Update your solar proposal details below' : 'Fill in the details below to generate your solar proposal'}
          </Typography>
        </Box>

        {/* Success Banner */}
        {savedSuccess && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              p: 1.5,
              px: 2.5,
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
              <DescriptionOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, color: '#166534', fontSize: '0.88rem' }}>
                PDF Updated Successfully
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              endIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
              onClick={() => generatePDFOnFrontend(latestQuotationId, latestQuotationNum)}
              sx={{
                bgcolor: '#16a34a',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '6px',
                px: 2,
                py: 0.6,
                fontSize: '0.82rem',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#15803d', boxShadow: 'none' }
              }}
            >
              View / Download PDF
            </Button>
          </Box>
        )}

        {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{errorMsg}</Alert>}

        <form onSubmit={handleSubmit}>

          {/* Section 1: Cover Pages */}
          <Paper elevation={0} sx={cardStyle}>
            <CardHeader
              number="1"
              title="Cover Pages / Prefaces (Before Quotation)"
              rightIcon={<DescriptionOutlinedIcon sx={{ fontSize: 18 }} />}
              rightExtra={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
            />

            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={addPrePage}
                startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                sx={{
                  color: '#16a34a',
                  borderColor: '#86efac',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.5px',
                  px: 1.8,
                  py: 0.6,
                  '&:hover': { borderColor: '#16a34a', bgcolor: '#f0fdf4' }
                }}
              >
                ADD NEW COVER PAGE
              </Button>
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
              Each editor below represents exactly one full page in the generated PDF. Add as many pages as you need.
            </Typography>

            {prePages.map((pageContent, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="700" color="#334155">Cover Page {index + 1}</Typography>
                  <IconButton size="small" color="error" onClick={() => removePrePage(index)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
                <Box sx={{ height: 220, mb: 5 }}>
                  <ReactQuill
                    theme="snow"
                    value={pageContent}
                    onChange={(val) => updatePrePage(index, val)}
                    style={{ height: '100%' }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Section 2: Customer Details */}
          <Paper elevation={0} sx={cardStyle}>
            <CardHeader
              number="2"
              title="Customer Details"
              rightIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                  Quotation Title *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="quotationTitle"
                  required
                  value={formData.quotationTitle}
                  onChange={handleChange}
                  helperText="e.g. Quotation for 10kW Solar System"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' }, '& .MuiFormHelperText-root': { mx: 0 } }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                  Customer Name *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                  Contact Number
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                  Customer Address
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                  Site Address
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="siteAddress"
                  value={formData.siteAddress}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="caption" fontWeight="600" color="#334155" mb={0.5} display="block">
                  Quotation Date *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  name="quotationDate"
                  required
                  value={formData.quotationDate}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Data Table */}
          <Paper elevation={0} sx={cardStyle}>
            <CardHeader
              number="3"
              title="Data Table"
              rightIcon={<GridOnOutlinedIcon sx={{ fontSize: 20 }} />}
            />

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleAddColumn}
                startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.5px',
                  px: 1.8,
                  py: 0.6,
                  '&:hover': { bgcolor: '#15803d' }
                }}
              >
                ADD COLUMN
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={addRow}
                startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.5px',
                  px: 1.8,
                  py: 0.6,
                  '&:hover': { bgcolor: '#15803d' }
                }}
              >
                ADD ROW
              </Button>
            </Box>

            <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#16a34a' }}>
                  <TableRow>
                    {columns.map((col, index) => (
                      <TableCell key={index} sx={{ color: '#ffffff', py: 1, px: 1.5, borderBottom: 'none' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#ffffff', display: 'block', textAlign: 'center' }}>
                          {col}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                          <IconButton size="small" onClick={() => openEditColumn(index)} sx={{ color: 'rgba(255,255,255,0.8)', p: 0.2, '&:hover': { color: '#fff' } }}>
                            <EditIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteColumn(index)} disabled={columns.length === 1} sx={{ color: 'rgba(255,255,255,0.8)', p: 0.2, '&:hover': { color: '#fca5a5' } }}>
                            <DeleteIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell align="center" width="60px" sx={{ color: '#ffffff', fontWeight: 700, py: 1, borderBottom: 'none', fontSize: '0.8rem' }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <TableCell key={colIndex} sx={{ py: 0.8, px: 1, borderBottom: '1px solid #e2e8f0' }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={row[col] || ''}
                            onChange={(e) => handleRowChange(rowIndex, col, e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: '#ffffff',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                              },
                              '& input': {
                                textAlign: col === 'S.No' || col === 'Quantity' || col === 'Qty' ? 'center' : 'left',
                                py: 0.8
                              }
                            }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ py: 0.8, px: 1, borderBottom: '1px solid #e2e8f0' }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeRow(rowIndex)}
                          disabled={rows.length === 1}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Section 4: First Page Notes */}
          <Paper elevation={0} sx={cardStyle}>
            <CardHeader
              number="4"
              title="First Page Notes (Amount in Words / Extra Info)"
            />

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
              This text will appear at the bottom of the first page, just under the Total Amount block. Use this for Amount in Words, short notes, or special details.
            </Typography>

            <Box sx={{ height: 180, mb: 6 }}>
              <ReactQuill
                theme="snow"
                value={firstPageNotes}
                onChange={setFirstPageNotes}
                style={{ height: '100%' }}
              />
            </Box>

            {/* Total Amount Box */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 3 }}>
              <Typography variant="body2" fontWeight="700" color="#334155" mb={1}>
                Total Amount (₹):
              </Typography>
              <TextField
                size="small"
                value={totals.grandTotal}
                onChange={(e) => {
                  setIsManualTotal(true);
                  setTotals({ ...totals, grandTotal: e.target.value, subtotal: e.target.value });
                }}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: '#ffffff' },
                  '& input': { fontWeight: 800, color: '#16a34a', textAlign: 'center', fontSize: '1.1rem', py: 0.8 }
                }}
              />
            </Box>
          </Paper>

          {/* Section 5: Terms & Conditions */}
          <Paper elevation={0} sx={cardStyle}>
            <CardHeader
              number="5"
              title="Terms & Conditions"
              rightIcon={<ShieldOutlinedIcon sx={{ fontSize: 20 }} />}
            />

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
              Use the editor below to format your text (Bold, Italic, Headings). This content will automatically appear on its own dedicated page.
            </Typography>

            <Box sx={{ height: 260, mb: 6 }}>
              <ReactQuill
                theme="snow"
                value={termsAndConditions}
                onChange={setTermsAndConditions}
                style={{ height: '100%' }}
              />
            </Box>
          </Paper>

          {/* Section 6: Annexures */}
          <Paper elevation={0} sx={cardStyle}>
            <CardHeader
              number="6"
              title="Annexure / Extra Pages (After Terms & Conditions)"
              rightIcon={<AttachFileOutlinedIcon sx={{ fontSize: 20 }} />}
              rightExtra={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
            />

            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={addPostPage}
                startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                sx={{
                  color: '#16a34a',
                  borderColor: '#86efac',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.5px',
                  px: 1.8,
                  py: 0.6,
                  '&:hover': { borderColor: '#16a34a', bgcolor: '#f0fdf4' }
                }}
              >
                ADD NEW ANNEXURE PAGE
              </Button>
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
              Need more pages after the Terms & Conditions? Add them here. Each editor creates exactly one full page in the generated PDF.
            </Typography>

            {postPages.map((pageContent, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="700" color="#334155">Annexure Page {index + 1}</Typography>
                  <IconButton size="small" color="error" onClick={() => removePostPage(index)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
                <Box sx={{ height: 220, mb: 5 }}>
                  <ReactQuill
                    theme="snow"
                    value={pageContent}
                    onChange={(val) => updatePostPage(index, val)}
                    style={{ height: '100%' }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Bottom Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3, flexWrap: 'wrap', mb: 8, mt: 4 }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 20 }} />}
              onClick={() => {
                if (!id) {
                  alert('Please generate the quotation first to make a copy.');
                  return;
                }
                setDuplicateCustName(formData.customerName || '');
                setDuplicateModalOpen(true);
              }}
              sx={{
                height: 46,
                px: 3.5,
                fontSize: '0.88rem',
                fontWeight: 800,
                borderColor: '#f97316',
                color: '#ea580c',
                bgcolor: '#ffffff',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#c2410c',
                  bgcolor: '#fff7ed',
                  color: '#c2410c'
                }
              }}
            >
              SAVE AS NEW COPY
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 20 }} />}
              sx={{
                height: 46,
                px: 4.5,
                fontSize: '0.88rem',
                fontWeight: 800,
                bgcolor: '#16a34a',
                color: '#ffffff',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#15803d',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                }
              }}
            >
              {id ? 'UPDATE QUOTATION PDF' : 'GENERATE QUOTATION PDF'}
            </Button>
          </Box>
        </form>
      </Box>

      {/* Edit Column Modal */}
      <Dialog open={colModalOpen} onClose={() => setColModalOpen(false)} PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>Edit Column Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Name"
            fullWidth
            size="small"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setColModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
          <Button onClick={saveColumnName} variant="contained" sx={{ textTransform: 'none', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* PDF Preview Modal */}
      <Dialog open={previewModalOpen} onClose={() => setPreviewModalOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>PDF Preview</span>
        </DialogTitle>
        <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
          {pdfBlobUrl && (
            <iframe src={pdfBlobUrl} width="100%" height="100%" style={{ border: 'none' }} title="PDF Preview" />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setPreviewModalOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>Close</Button>
          <Button
            onClick={() => {
              const a = document.createElement('a');
              a.href = pdfBlobUrl;
              a.download = pdfFilename;
              a.click();
              setPreviewModalOpen(false);
            }}
            variant="contained"
            sx={{ bgcolor: '#16a34a', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#15803d' } }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Quotation Modal */}
      <Dialog
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '10px', p: 1, minWidth: { xs: 300, sm: 420 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', pb: 1 }}>
          Duplicate Quotation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter the customer name for the new copy. A fresh quotation number will be generated automatically.
          </Typography>
          <TextField
            autoFocus
            label="Customer Name"
            fullWidth
            size="small"
            value={duplicateCustName}
            onChange={(e) => setDuplicateCustName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setDuplicating(true);
                try {
                  const res = await api.post(`/quotations/${id}/duplicate`, { customerName: duplicateCustName });
                  setDuplicateModalOpen(false);
                  alert(`Quotation copied successfully for "${res.data.customerName}" with new number ${res.data.quotationNumber}!`);
                  navigate(`/edit-quotation/${res.data._id}`);
                } catch (dupErr) {
                  alert('Failed to duplicate: ' + (dupErr.response?.data?.message || dupErr.message));
                } finally {
                  setDuplicating(false);
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDuplicateModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setDuplicating(true);
              try {
                const res = await api.post(`/quotations/${id}/duplicate`, { customerName: duplicateCustName });
                setDuplicateModalOpen(false);
                alert(`Quotation copied successfully for "${res.data.customerName}" with new number ${res.data.quotationNumber}!`);
                navigate(`/edit-quotation/${res.data._id}`);
              } catch (dupErr) {
                alert('Failed to duplicate: ' + (dupErr.response?.data?.message || dupErr.message));
              } finally {
                setDuplicating(false);
              }
            }}
            variant="contained"
            disabled={duplicating}
            sx={{
              textTransform: 'none',
              bgcolor: '#16a34a',
              fontWeight: 700,
              borderRadius: '6px',
              '&:hover': { bgcolor: '#15803d' }
            }}
          >
            {duplicating ? 'Copying...' : 'Duplicate Quotation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateQuotation;
