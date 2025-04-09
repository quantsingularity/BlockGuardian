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
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import StatusCard from './common/StatusCard';
import axios from 'axios';

export default function RiskReports() {
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [riskFactorsData, setRiskFactorsData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/risk-reports');
      setReports(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const highRisk = response.data.filter(report => report.risk_score > 0.7).length;
      const mediumRisk = response.data.filter(report => report.risk_score > 0.3 && report.risk_score <= 0.7).length;
      const lowRisk = response.data.filter(report => report.risk_score <= 0.3).length;
      
      setStats({ total, highRisk, mediumRisk, lowRisk });
      setFilteredReports(response.data);
      
      // Prepare risk distribution data
      setRiskDistribution([
        { name: 'High Risk', value: highRisk, color: theme.palette.error.main },
        { name: 'Medium Risk', value: mediumRisk, color: theme.palette.warning.main },
        { name: 'Low Risk', value: lowRisk, color: theme.palette.success.main }
      ]);
      
      // Prepare risk factors data
      const factorCounts = {};
      response.data.forEach(report => {
        report.risk_factors.forEach(factor => {
          factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        });
      });
      
      const factorsData = Object.entries(factorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setRiskFactorsData(factorsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching risk reports:', error);
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
    // Filter reports based on search term
    if (searchTerm) {
      setFilteredReports(reports.filter(report => 
        report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.risk_factors.some(factor => factor.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    } else {
      setFilteredReports(reports);
    }
  }, [searchTerm, reports]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['ID', 'Address', 'Risk Score', 'Risk Factors', 'Transaction Count', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...filteredReports.map(report => [
        report.id,
        report.address,
        report.risk_score,
        `"${report.risk_factors.join(', ')}"`,
        report.transaction_count,
        new Date(report.timestamp * 1000).toLocaleString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `risk_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDetails = (report) => {
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleExportPdf = () => {
    // In a real application, this would generate a PDF report
    alert('PDF export functionality would be implemented here');
  };

  const getRiskColor = (score) => {
    if (score > 0.7) return theme.palette.error.main;
    if (score > 0.3) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getRiskIcon = (score) => {
    if (score > 0.7) return <WarningIcon sx={{ color: theme.palette.error.main }} />;
    if (score > 0.3) return <SecurityIcon sx={{ color: theme.palette.warning.main }} />;
    return <CheckIcon sx={{ color: theme.palette.success.main }} />;
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
          Risk Analysis Reports
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export reports">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3} className="dashboard-stats">
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="Total Reports" 
            value={stats.total} 
            status="Address risk reports" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="High Risk" 
            value={stats.highRisk} 
            total={stats.total}
            status="Risk score > 70%" 
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="Medium Risk" 
            value={stats.mediumRisk} 
            total={stats.total}
            status="Risk score 30-70%" 
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="Low Risk" 
            value={stats.lowRisk} 
            total={stats.total}
            status="Risk score < 30%" 
            color="success"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Risk Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Top Risk Factors
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={riskFactorsData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" fill={theme.palette.primary.main} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
          mt: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Address Risk Reports
          </Typography>
          <TextField
            placeholder="Search by address or risk factor"
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
        <Divider sx={{ mb: 2 }} />
        
        {filteredReports.length === 0 ? (
          <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>
            No risk reports available matching your criteria
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredReports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
                    },
                    borderLeft: `4px solid ${getRiskColor(report.risk_score)}`
                  }}
                >
                  <CardHeader 
                    avatar={
                      <Avatar sx={{ bgcolor: getRiskColor(report.risk_score) }}>
                        {getRiskIcon(report.risk_score)}
                      </Avatar>
                    }
                    title={`Report #${report.id}`}
                    subheader={new Date(report.timestamp * 1000).toLocaleString()}
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" gutterBottom>
                      <strong>Address:</strong> {report.address.substring(0, 10)}...
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Transaction Count:</strong> {report.transaction_count}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Risk Score:</strong> 
                      <Chip 
                        label={`${(report.risk_score * 100).toFixed(0)}%`}
                        size="small"
                        sx={{ 
                          ml: 1, 
                          bgcolor: getRiskColor(report.risk_score),
                          color: '#fff'
                        }}
                      />
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Risk Factors:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {report.risk_factors.map((factor, index) => (
                          <Chip 
                            key={index} 
                            label={factor} 
                            size="small" 
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenDetails(report)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Report Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: getRiskColor(selectedReport.risk_score), mr: 2 }}>
                  {getRiskIcon(selectedReport.risk_score)}
                </Avatar>
                <Typography variant="h6">
                  Risk Report #{selectedReport.id}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Report Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Address" 
                        secondary={selectedReport.address} 
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Risk Score" 
                        secondary={`${(selectedReport.risk_score * 100).toFixed(0)}%`} 
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                        secondaryTypographyProps={{ 
                          color: getRiskColor(selectedReport.risk_score),
                          fontWeight: 'bold'
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Transaction Count" 
                        secondary={selectedReport.transaction_count} 
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Generated On" 
                        secondary={new Date(selectedReport.timestamp * 1000).toLocaleString()} 
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Risk Factors
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List dense>
                    {selectedReport.risk_factors.map((factor, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={factor} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" paragraph>
                    {selectedReport.summary}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<PdfIcon />}
                onClick={handleExportPdf}
              >
                Export as PDF
              </Button>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
