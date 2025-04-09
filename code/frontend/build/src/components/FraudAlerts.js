import React from 'react';
import { Box, Typography, Container, Grid, Paper, Card, CardContent, CardHeader, Divider, useTheme, Button, Avatar, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

// Styled components
const AlertCard = styled(Card)(({ theme, severity }) => {
  const getColor = () => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return {
    borderLeft: `4px solid ${getColor()}`,
    borderRadius: '12px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    marginBottom: theme.spacing(2),
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
    },
  };
});

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
  color: '#fff',
  padding: theme.spacing(1, 3),
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 8px rgba(67, 97, 238, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #3a0ca3 0%, #4361ee 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(67, 97, 238, 0.3)',
  },
}));

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  ...(selected && {
    background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
    color: '#fff',
    boxShadow: '0 4px 8px rgba(67, 97, 238, 0.2)',
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const IconWrapper = styled(Avatar)(({ theme, severity }) => {
  const getColor = () => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return {
    backgroundColor: getColor(),
    width: 40,
    height: 40,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };
});

export default function FraudAlerts() {
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  // Mock data
  const alerts = [
    { 
      id: 1, 
      title: 'Suspicious transaction detected', 
      severity: 'high', 
      time: '10 minutes ago', 
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      description: 'Large amount transferred to a known high-risk address. This transaction has been flagged due to unusual patterns consistent with fraudulent activities.'
    },
    { 
      id: 2, 
      title: 'Unusual token swap', 
      severity: 'medium', 
      time: '2 hours ago', 
      address: '0x8C76BFd63D602B0b0D3e79008Db2EBB8928dC2C0',
      description: 'Token swap with high slippage detected. The transaction parameters deviate from normal market conditions, suggesting potential manipulation.'
    },
    { 
      id: 3, 
      title: 'Large transfer amount', 
      severity: 'medium', 
      time: '5 hours ago', 
      address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      description: 'Transfer amount exceeds typical transaction size for this wallet. While not necessarily malicious, this transaction is flagged for review.'
    },
    { 
      id: 4, 
      title: 'Interaction with flagged contract', 
      severity: 'high', 
      time: '1 day ago', 
      address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
      description: 'Interaction with a smart contract previously associated with scam activities. This contract has been linked to multiple fraudulent operations.'
    },
    { 
      id: 5, 
      title: 'New address interaction', 
      severity: 'low', 
      time: '2 days ago', 
      address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      description: 'First-time interaction with a new address. This is a routine notification for monitoring purposes only.'
    },
  ];

  const filteredAlerts = selectedFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === selectedFilter);

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <ErrorIcon />;
      case 'medium':
        return <WarningIcon />;
      case 'low':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box className="slide-up">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Fraud Alerts
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Monitor and manage potential fraud alerts for your blockchain transactions
        </Typography>
      </Box>

      {/* Filters */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(30, 30, 30, 0.6) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        }}
      >
        <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: 600 }}>
          Filter by severity:
        </Typography>
        <FilterChip 
          label="All Alerts" 
          onClick={() => setSelectedFilter('all')}
          selected={selectedFilter === 'all'}
        />
        <FilterChip 
          label="High Risk" 
          onClick={() => setSelectedFilter('high')}
          selected={selectedFilter === 'high'}
        />
        <FilterChip 
          label="Medium Risk" 
          onClick={() => setSelectedFilter('medium')}
          selected={selectedFilter === 'medium'}
        />
        <FilterChip 
          label="Low Risk" 
          onClick={() => setSelectedFilter('low')}
          selected={selectedFilter === 'low'}
        />
      </Paper>

      {/* Alerts List */}
      <Box>
        {filteredAlerts.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: '16px', 
              textAlign: 'center',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(30, 30, 30, 0.6) 100%)' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6">No alerts found</Typography>
            <Typography variant="body2" color="textSecondary">
              There are no alerts matching your selected filter
            </Typography>
          </Paper>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} severity={alert.severity}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <IconWrapper severity={alert.severity}>
                        {getAlertIcon(alert.severity)}
                      </IconWrapper>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {alert.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {alert.address}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {alert.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {alert.time}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                    <Chip 
                      label={alert.severity.toUpperCase()} 
                      sx={{ 
                        bgcolor: alert.severity === 'high' 
                          ? theme.palette.error.main 
                          : alert.severity === 'medium' 
                            ? theme.palette.warning.main 
                            : theme.palette.success.main,
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '8px',
                        px: 1
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 'auto' } }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ 
                          borderRadius: '8px', 
                          textTransform: 'none',
                          borderWidth: '2px',
                          '&:hover': {
                            borderWidth: '2px',
                          }
                        }}
                      >
                        Dismiss
                      </Button>
                      <GradientButton 
                        variant="contained" 
                        size="small"
                      >
                        Investigate
                      </GradientButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </AlertCard>
          ))
        )}
      </Box>
    </Box>
  );
}
