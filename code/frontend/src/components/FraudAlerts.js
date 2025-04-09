import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme, 
  Button,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Chip,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import TransactionAlert from './common/TransactionAlert';
import axios from 'axios';

export default function FraudAlerts() {
  const theme = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/alerts');
      setAlerts(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const highRisk = response.data.filter(alert => alert.risk_score > 0.7).length;
      const mediumRisk = response.data.filter(alert => alert.risk_score > 0.3 && alert.risk_score <= 0.7).length;
      const lowRisk = response.data.filter(alert => alert.risk_score <= 0.3).length;
      
      setStats({ total, highRisk, mediumRisk, lowRisk });
      setFilteredAlerts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter alerts based on search term and tab value
    let filtered = alerts;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.tx_hash.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (tabValue === 1) { // High Risk
      filtered = filtered.filter(alert => alert.risk_score > 0.7);
    } else if (tabValue === 2) { // Medium Risk
      filtered = filtered.filter(alert => alert.risk_score > 0.3 && alert.risk_score <= 0.7);
    } else if (tabValue === 3) { // Low Risk
      filtered = filtered.filter(alert => alert.risk_score <= 0.3);
    }
    
    setFilteredAlerts(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, tabValue, alerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Transaction Hash', 'Risk Score', 'Flagged', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...filteredAlerts.map(alert => [
        alert.tx_hash,
        alert.risk_score,
        alert.flagged ? 'Yes' : 'No',
        new Date(alert.timestamp * 1000).toLocaleString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fraud_alerts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRiskColor = (score) => {
    if (score > 0.7) return theme.palette.error.main;
    if (score > 0.3) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getRiskLabel = (score) => {
    if (score > 0.7) return 'High';
    if (score > 0.3) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fraud Alerts
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export alerts">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '12px',
              height: '100%',
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="h3" component="div" color="text.primary" gutterBottom>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Alerts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '12px',
              height: '100%',
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
              borderLeft: `4px solid ${theme.palette.error.main}`
            }}
          >
            <Typography variant="h3" component="div" color="error.main" gutterBottom>
              {stats.highRisk}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Risk Alerts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '12px',
              height: '100%',
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
              borderLeft: `4px solid ${theme.palette.warning.main}`
            }}
          >
            <Typography variant="h3" component="div" color="warning.main" gutterBottom>
              {stats.mediumRisk}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medium Risk Alerts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '12px',
              height: '100%',
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
              borderLeft: `4px solid ${theme.palette.success.main}`
            }}
          >
            <Typography variant="h3" component="div" color="success.main" gutterBottom>
              {stats.lowRisk}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Low Risk Alerts
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Alert Management
          </Typography>
          <TextField
            placeholder="Search by transaction hash"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: '300px' } }}
          />
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="All Alerts" />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  High Risk
                  <Chip 
                    label={stats.highRisk} 
                    size="small" 
                    color="error" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Medium Risk
                  <Chip 
                    label={stats.mediumRisk} 
                    size="small" 
                    color="warning" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Low Risk
                  <Chip 
                    label={stats.lowRisk} 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                </Box>
              } 
            />
          </Tabs>
        </Box>
        
        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction Hash</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No alerts found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(alert => (
                    <TableRow 
                      key={alert.tx_hash}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: theme.palette.action.hover 
                        },
                        borderLeft: `4px solid ${getRiskColor(alert.risk_score)}`,
                      }}
                    >
                      <TableCell>
                        <Tooltip title={alert.tx_hash}>
                          <Typography variant="body2">
                            {alert.tx_hash.substring(0, 16)}...
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {(alert.risk_score * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getRiskLabel(alert.risk_score)} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getRiskColor(alert.risk_score),
                            color: '#fff'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(alert.timestamp * 1000).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          endIcon={<OpenInNewIcon />}
                          onClick={() => window.location.href = `/transactions/${alert.tx_hash}`}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAlerts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {stats.highRisk > 0 && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3,
            borderRadius: '12px',
            boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            High Risk Alerts
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box>
            {alerts
              .filter(alert => alert.risk_score > 0.7)
              .slice(0, 3)
              .map(alert => (
                <TransactionAlert key={alert.tx_hash} transaction={alert} />
              ))
            }
            
            {alerts.filter(alert => alert.risk_score > 0.7).length > 3 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setTabValue(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  View All High Risk Alerts
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
