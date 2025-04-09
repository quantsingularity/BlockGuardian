import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  LinearProgress,
  Box,
  Chip,
  Grid
} from '@mui/material';
import axios from 'axios';
import TransactionAlert from './common/TransactionAlert';
import StatusCard from './common/StatusCard';

export default function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    mediumRisk: 0
  });

  useEffect(() => {
    setLoading(true);
    axios.get('/api/alerts')
      .then(response => {
        setAlerts(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const highRisk = response.data.filter(alert => alert.risk_score > 0.7).length;
        const mediumRisk = response.data.filter(alert => alert.risk_score > 0.3 && alert.risk_score <= 0.7).length;
        
        setStats({ total, highRisk, mediumRisk });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching alerts:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ padding: '20px', margin: '20px 0' }}>
        <Typography variant="h4" gutterBottom>
          Fraud Alerts
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Fraud Alerts
      </Typography>
      
      <Grid container spacing={3} className="dashboard-stats">
        <Grid item xs={12} sm={4}>
          <StatusCard 
            title="Total Alerts" 
            value={stats.total} 
            status="Flagged transactions" 
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatusCard 
            title="High Risk" 
            value={stats.highRisk} 
            total={stats.total}
            status="Risk score > 70%" 
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatusCard 
            title="Medium Risk" 
            value={stats.mediumRisk} 
            total={stats.total}
            status="Risk score 30-70%" 
            color="warning"
          />
        </Grid>
      </Grid>
      
      {alerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Recent Alerts
          </Typography>
          {alerts.slice(0, 3).map(alert => (
            <TransactionAlert key={alert.tx_hash} transaction={alert} />
          ))}
        </Box>
      )}
      
      <Paper elevation={3} sx={{ padding: '20px', margin: '20px 0' }}>
        <Typography variant="h5" gutterBottom>
          All Fraud Alerts
        </Typography>
        
        {alerts.length === 0 ? (
          <Typography variant="body1">No fraud alerts available at this time.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction Hash</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map(alert => (
                  <TableRow key={alert.tx_hash}>
                    <TableCell>{alert.tx_hash}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${(alert.risk_score * 100).toFixed(1)}%`}
                        color={alert.risk_score > 0.7 ? "error" : alert.risk_score > 0.3 ? "warning" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(alert.timestamp * 1000).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
}
