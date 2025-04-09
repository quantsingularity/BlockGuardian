import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  LinearProgress,
  Box,
  Chip
} from '@mui/material';
import axios from 'axios';
import StatusCard from './common/StatusCard';

export default function RiskReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });

  useEffect(() => {
    setLoading(true);
    axios.get('/api/risk-reports')
      .then(response => {
        setReports(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const highRisk = response.data.filter(report => report.risk_score > 0.7).length;
        const mediumRisk = response.data.filter(report => report.risk_score > 0.3 && report.risk_score <= 0.7).length;
        const lowRisk = response.data.filter(report => report.risk_score <= 0.3).length;
        
        setStats({ total, highRisk, mediumRisk, lowRisk });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching risk reports:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ padding: '20px', margin: '20px 0' }}>
        <Typography variant="h4" gutterBottom>
          Risk Analysis Reports
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Risk Analysis Reports
      </Typography>
      
      <Grid container spacing={3} className="dashboard-stats">
        <Grid item xs={12} sm={3}>
          <StatusCard 
            title="Total Reports" 
            value={stats.total} 
            status="Address risk reports" 
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatusCard 
            title="High Risk" 
            value={stats.highRisk} 
            total={stats.total}
            status="Risk score > 70%" 
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatusCard 
            title="Medium Risk" 
            value={stats.mediumRisk} 
            total={stats.total}
            status="Risk score 30-70%" 
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatusCard 
            title="Low Risk" 
            value={stats.lowRisk} 
            total={stats.total}
            status="Risk score < 30%" 
            color="success"
          />
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ padding: '20px', margin: '20px 0' }}>
        <Typography variant="h5" gutterBottom>
          Address Risk Reports
        </Typography>
        
        {reports.length === 0 ? (
          <Typography variant="body1">No risk reports available at this time.</Typography>
        ) : (
          <Grid container spacing={3}>
            {reports.map((report, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ReportCard report={report} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </>
  );
}

function ReportCard({ report }) {
  const getRiskColor = (score) => {
    if (score < 0.3) return 'success';
    if (score < 0.7) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={`Report #${report.id}`}
        subheader={new Date(report.timestamp * 1000).toLocaleString()}
      />
      <Divider />
      <CardContent>
        <Typography variant="body1" gutterBottom>
          <strong>Address:</strong> {report.address}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Transaction Count:</strong> {report.transaction_count}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Risk Score:</strong> 
          <Chip 
            label={`${(report.risk_score * 100).toFixed(1)}%`}
            color={getRiskColor(report.risk_score)}
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Risk Factors:</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {report.risk_factors.map((factor, index) => (
              <Chip key={index} label={factor} size="small" />
            ))}
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          {report.summary}
        </Typography>
      </CardContent>
    </Card>
  );
}
