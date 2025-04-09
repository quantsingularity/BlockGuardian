import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function AdvancedAnalytics() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('transactions');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [analyticsData, setAnalyticsData] = useState({
    transactionVolume: [],
    riskDistribution: [],
    networkActivity: [],
    topAddresses: []
  });

  // Simulating data loading
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call to fetch analytics data
    setTimeout(() => {
      // Transaction volume data
      const transactionVolume = generateTransactionVolumeData(timeRange);
      
      // Risk distribution data
      const riskDistribution = [
        { name: 'High Risk', value: 15, color: theme.palette.error.main },
        { name: 'Medium Risk', value: 30, color: theme.palette.warning.main },
        { name: 'Low Risk', value: 55, color: theme.palette.success.main }
      ];
      
      // Network activity data
      const networkActivity = generateNetworkActivityData(timeRange);
      
      // Top addresses data
      const topAddresses = [
        { id: 1, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', transactions: 156, volume: 45.23, riskScore: 75 },
        { id: 2, address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', transactions: 89, volume: 32.18, riskScore: 15 },
        { id: 3, address: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148', transactions: 67, volume: 28.91, riskScore: 42 },
        { id: 4, address: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', transactions: 54, volume: 21.45, riskScore: 8 },
        { id: 5, address: '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a', transactions: 48, volume: 19.72, riskScore: 62 },
        { id: 6, address: '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e', transactions: 42, volume: 17.36, riskScore: 23 },
        { id: 7, address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', transactions: 39, volume: 15.89, riskScore: 31 },
        { id: 8, address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db', transactions: 36, volume: 14.52, riskScore: 55 },
        { id: 9, address: '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB', transactions: 32, volume: 12.98, riskScore: 18 },
        { id: 10, address: '0x617F2E2fD72FD9D5503197092aC168c91465E7f2', transactions: 29, volume: 11.76, riskScore: 37 },
        { id: 11, address: '0x17F6AD8Ef982297579C203069C1DbfFE4348c372', transactions: 27, volume: 10.89, riskScore: 29 },
        { id: 12, address: '0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678', transactions: 25, volume: 10.12, riskScore: 44 }
      ];
      
      setAnalyticsData({
        transactionVolume,
        riskDistribution,
        networkActivity,
        topAddresses
      });
      
      setLoading(false);
    }, 1500);
  }, [timeRange, theme.palette]);

  // Generate transaction volume data based on time range
  const generateTransactionVolumeData = (range) => {
    let data = [];
    
    if (range === 'day') {
      // Hourly data for a day
      for (let i = 0; i < 24; i++) {
        data.push({
          name: `${i}:00`,
          transactions: Math.floor(Math.random() * 50) + 10,
          volume: parseFloat((Math.random() * 20 + 5).toFixed(2))
        });
      }
    } else if (range === 'week') {
      // Daily data for a week
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i < 7; i++) {
        data.push({
          name: days[i],
          transactions: Math.floor(Math.random() * 200) + 50,
          volume: parseFloat((Math.random() * 50 + 20).toFixed(2))
        });
      }
    } else if (range === 'month') {
      // Weekly data for a month
      for (let i = 1; i <= 4; i++) {
        data.push({
          name: `Week ${i}`,
          transactions: Math.floor(Math.random() * 1000) + 200,
          volume: parseFloat((Math.random() * 200 + 100).toFixed(2))
        });
      }
    } else if (range === 'year') {
      // Monthly data for a year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        data.push({
          name: months[i],
          transactions: Math.floor(Math.random() * 5000) + 1000,
          volume: parseFloat((Math.random() * 1000 + 500).toFixed(2))
        });
      }
    }
    
    return data;
  };

  // Generate network activity data based on time range
  const generateNetworkActivityData = (range) => {
    let data = [];
    let points = range === 'day' ? 24 : range === 'week' ? 7 : range === 'month' ? 4 : 12;
    let labels = [];
    
    if (range === 'day') {
      // Hourly data for a day
      for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);
      }
    } else if (range === 'week') {
      // Daily data for a week
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (range === 'month') {
      // Weekly data for a month
      for (let i = 1; i <= 4; i++) {
        labels.push(`Week ${i}`);
      }
    } else if (range === 'year') {
      // Monthly data for a year
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    
    for (let i = 0; i < points; i++) {
      data.push({
        name: labels[i],
        activeAddresses: Math.floor(Math.random() * 500) + 100,
        newAddresses: Math.floor(Math.random() * 100) + 10,
        gasPrice: parseFloat((Math.random() * 100 + 50).toFixed(2))
      });
    }
    
    return data;
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const handleRefreshData = () => {
    setLoading(true);
    
    // Simulate API call to refresh data
    setTimeout(() => {
      const transactionVolume = generateTransactionVolumeData(timeRange);
      const networkActivity = generateNetworkActivityData(timeRange);
      
      setAnalyticsData({
        ...analyticsData,
        transactionVolume,
        networkActivity
      });
      
      setLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Analytics data refreshed successfully!',
        severity: 'success'
      });
    }, 1500);
  };

  const handleExportData = () => {
    // In a real app, this would generate and download a CSV or PDF file
    setSnackbar({
      open: true,
      message: 'Analytics data exported successfully!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRiskColor = (score) => {
    if (score > 70) return theme.palette.error.main;
    if (score > 30) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getRiskLabel = (score) => {
    if (score > 70) return 'High';
    if (score > 30) return 'Medium';
    return 'Low';
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Advanced Analytics
      </Typography>
      
      {/* Controls Section */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="day">Last 24 Hours</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="year">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="chart-type-label">Chart Type</InputLabel>
            <Select
              labelId="chart-type-label"
              id="chart-type"
              value={chartType}
              label="Chart Type"
              onChange={handleChartTypeChange}
              size="small"
            >
              <MenuItem value="transactions">Transaction Volume</MenuItem>
              <MenuItem value="risk">Risk Distribution</MenuItem>
              <MenuItem value="network">Network Activity</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
            size="small"
          >
            Export
          </Button>
        </Box>
      </Paper>
      
      {/* Main Chart Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '12px',
          height: 400
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {chartType === 'transactions' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Transaction Volume
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={analyticsData.transactionVolume}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="transactions" name="Transactions" fill={theme.palette.primary.main} />
                    <Bar yAxisId="right" dataKey="volume" name="Volume (ETH)" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
            
            {chartType === 'risk' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Risk Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={analyticsData.riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
            
            {chartType === 'network' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Network Activity
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart
                    data={analyticsData.networkActivity}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="activeAddresses" 
                      name="Active Addresses" 
                      stroke={theme.palette.primary.main} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="newAddresses" 
                      name="New Addresses" 
                      stroke={theme.palette.success.main} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="gasPrice" 
                      name="Gas Price (Gwei)" 
                      stroke={theme.palette.secondary.main} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </>
        )}
      </Paper>
      
      {/* Stats Cards Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Total Transactions
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {analyticsData.transactionVolume.reduce((sum, item) => sum + item.transactions, 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +12.5% from previous period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Transaction Volume
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {analyticsData.transactionVolume.reduce((sum, item) => sum + item.volume, 0).toFixed(2)} ETH
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +8.3% from previous period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  High Risk Transactions
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {analyticsData.riskDistribution[0].value}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingDownIcon color="success" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      -2.1% from previous period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Active Addresses
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {analyticsData.networkActivity.reduce((sum, item) => sum + item.activeAddresses, 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +5.7% from previous period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Top Addresses Table */}
      <Paper sx={{ p: 3, borderRadius: '12px' }}>
        <Typography variant="h6" gutterBottom>
          Top Addresses by Transaction Volume
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="top addresses table">
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell align="right">Volume (ETH)</TableCell>
                    <TableCell align="right">Risk Score</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topAddresses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.address.substring(0, 6)}...{row.address.substring(row.address.length - 4)}
                        </TableCell>
                        <TableCell align="right">{row.transactions}</TableCell>
                        <TableCell align="right">{row.volume.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${row.riskScore}% - ${getRiskLabel(row.riskScore)}`} 
                            size="small"
                            sx={{ 
                              backgroundColor: getRiskColor(row.riskScore) + '20',
                              color: getRiskColor(row.riskScore),
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Monitor Address">
                            <IconButton size="small" color="primary">
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={analyticsData.topAddresses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
