import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme, 
  useMediaQuery,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import StatusCard from './common/StatusCard';
import TransactionAlert from './common/TransactionAlert';
import axios from 'axios';

export default function TransactionDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });
  const [chartData, setChartData] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const flagged = response.data.filter(tx => tx.flagged).length;
      const highRisk = response.data.filter(tx => tx.risk_score > 0.7).length;
      const mediumRisk = response.data.filter(tx => tx.risk_score > 0.3 && tx.risk_score <= 0.7).length;
      const lowRisk = response.data.filter(tx => tx.risk_score <= 0.3).length;
      
      setStats({ total, flagged, highRisk, mediumRisk, lowRisk });
      
      // Prepare chart data
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      
      const chartData = last7Days.map(date => {
        const dayTransactions = response.data.filter(tx => {
          const txDate = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
          return txDate === date;
        });
        
        return {
          date,
          transactions: dayTransactions.length,
          flagged: dayTransactions.filter(tx => tx.flagged).length,
        };
      });
      
      setChartData(chartData);
      
      // Prepare risk distribution data
      setRiskDistribution([
        { name: 'High Risk', value: highRisk, color: theme.palette.error.main },
        { name: 'Medium Risk', value: mediumRisk, color: theme.palette.warning.main },
        { name: 'Low Risk', value: lowRisk, color: theme.palette.success.main }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Transaction Hash', 'Value', 'Risk Score', 'Flagged', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.tx_hash,
        tx.value,
        tx.risk_score,
        tx.flagged ? 'Yes' : 'No',
        new Date(tx.timestamp * 1000).toLocaleString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          Transaction Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export transactions">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3} className="dashboard-stats">
        <Grid item xs={12} sm={6} md={2.4}>
          <StatusCard 
            title="Total Transactions" 
            value={stats.total} 
            status="All blockchain transactions" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatusCard 
            title="Flagged Transactions" 
            value={stats.flagged} 
            total={stats.total}
            status="Potentially fraudulent" 
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <StatusCard 
            title="High Risk" 
            value={stats.highRisk} 
            total={stats.total}
            status="Risk score > 70%" 
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <StatusCard 
            title="Medium Risk" 
            value={stats.mediumRisk} 
            total={stats.total}
            status="Risk score 30-70%" 
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
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
        <Grid item xs={12} md={8}>
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
              Transaction Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value, name) => [value, name === 'transactions' ? 'Total Transactions' : 'Flagged Transactions']}
                  labelFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="flagged" 
                  stroke={theme.palette.error.main} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
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
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Transactions
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => window.location.href = '/transactions'}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {transactions.length === 0 ? (
              <Typography variant="body1">No transactions available at this time.</Typography>
            ) : (
              <Grid container spacing={2}>
                {transactions.slice(0, 3).map(tx => (
                  <Grid item xs={12} key={tx.tx_hash}>
                    <Paper 
                      className="transaction-card" 
                      sx={{ 
                        p: 2, 
                        backgroundColor: tx.flagged ? '#fff8f8' : '#fff',
                        border: tx.flagged ? '1px solid #ffcdd2' : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Hash:</strong> {tx.tx_hash.substring(0, 10)}...
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Value:</strong> {tx.value} ETH
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(tx.timestamp * 1000).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Risk:</strong> 
                            <span className={
                              tx.risk_score > 0.7 ? 'risk-high' : 
                              tx.risk_score > 0.3 ? 'risk-medium' : 
                              'risk-low'
                            } style={{ marginLeft: '5px' }}>
                              {(tx.risk_score * 100).toFixed(0)}%
                            </span>
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={() => window.location.href = `/transactions/${tx.tx_hash}`}
                          >
                            Details
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Alerts
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => window.location.href = '/alerts'}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {stats.flagged === 0 ? (
              <Typography variant="body1">No alerts available at this time.</Typography>
            ) : (
              <Box>
                {transactions
                  .filter(tx => tx.flagged)
                  .slice(0, 3)
                  .map(tx => (
                    <TransactionAlert key={tx.tx_hash} transaction={tx} />
                  ))
                }
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// Add keyframes for the refresh icon spin animation
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;
document.head.appendChild(styleTag);
