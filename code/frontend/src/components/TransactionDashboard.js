import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import StatusCard from './common/StatusCard';
import TransactionAlert from './common/TransactionAlert';

export default function TransactionDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    highRisk: 0
  });

  useEffect(() => {
    setLoading(true);
    axios.get('/api/transactions')
      .then(response => {
        setTransactions(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const flagged = response.data.filter(tx => tx.flagged).length;
        const highRisk = response.data.filter(tx => tx.risk_score > 0.7).length;
        
        setStats({ total, flagged, highRisk });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ padding: '20px', margin: '20px 0', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Real-time Transaction Monitor
        </Typography>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading transactions...
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Real-time Transaction Monitor
      </Typography>
      
      <Grid container spacing={3} className="dashboard-stats">
        <Grid item xs={12} sm={4}>
          <StatusCard 
            title="Total Transactions" 
            value={stats.total} 
            status="All blockchain transactions" 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatusCard 
            title="Flagged Transactions" 
            value={stats.flagged} 
            total={stats.total}
            status="Potentially fraudulent" 
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatusCard 
            title="High Risk" 
            value={stats.highRisk} 
            total={stats.total}
            status="Risk score > 70%" 
            color="warning"
          />
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ padding: '20px', mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Transactions
        </Typography>
        
        {transactions.length === 0 ? (
          <Typography variant="body1">No transactions available at this time.</Typography>
        ) : (
          <Grid container spacing={3}>
            {transactions.map(tx => (
              <Grid item xs={12} sm={6} md={4} key={tx.tx_hash}>
                <TransactionCard tx={tx} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {stats.flagged > 0 && (
        <Paper elevation={3} sx={{ padding: '20px' }}>
          <Typography variant="h5" gutterBottom>
            Recent Alerts
          </Typography>
          
          {transactions
            .filter(tx => tx.flagged)
            .slice(0, 3)
            .map(tx => (
              <TransactionAlert key={tx.tx_hash} transaction={tx} />
            ))
          }
          
          {stats.flagged > 3 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                component="a"
                href="/alerts"
              >
                View all {stats.flagged} alerts
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </>
  );
}

function TransactionCard({ tx }) {
  return (
    <Paper className="transaction-card" sx={{ 
      padding: '15px', 
      backgroundColor: tx.flagged ? '#fff8f8' : '#fff',
      height: '100%',
      border: tx.flagged ? '1px solid #ffcdd2' : '1px solid #e0e0e0'
    }}>
      <Typography variant="body1" gutterBottom>
        <strong>Hash:</strong> {tx.tx_hash.substring(0, 10)}...
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Value:</strong> {tx.value} ETH
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Risk Score:</strong> 
        <span className={
          tx.risk_score > 0.7 ? 'risk-high' : 
          tx.risk_score > 0.3 ? 'risk-medium' : 
          'risk-low'
        }>
          {(tx.risk_score * 100).toFixed(1)}%
        </span>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {new Date(tx.timestamp * 1000).toLocaleString()}
      </Typography>
    </Paper>
  );
}
