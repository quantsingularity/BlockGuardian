import React from 'react';
import { Box, Typography, Container, Grid, Paper, Card, CardContent, CardHeader, Divider, useTheme, Button, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeContext } from '../theme/ThemeContext';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// Styled components
const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(30, 30, 30, 0.6) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
}));

const IconWrapper = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: theme.palette[color || 'primary'].main,
  width: 56,
  height: 56,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
}));

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

export default function TransactionDashboard() {
  const theme = useTheme();
  const { darkMode } = useThemeContext();

  // Mock data
  const stats = [
    { title: 'Transactions Monitored', value: '1,245', icon: <TrendingUpIcon />, color: 'primary' },
    { title: 'Alerts Generated', value: '37', icon: <WarningIcon />, color: 'error' },
    { title: 'Risk Score', value: '82/100', icon: <SecurityIcon />, color: 'success' },
    { title: 'Wallets Connected', value: '3', icon: <AccountBalanceWalletIcon />, color: 'secondary' },
  ];

  const recentAlerts = [
    { id: 1, title: 'Suspicious transaction detected', severity: 'high', time: '10 minutes ago', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { id: 2, title: 'Unusual token swap', severity: 'medium', time: '2 hours ago', address: '0x8C76BFd63D602B0b0D3e79008Db2EBB8928dC2C0' },
    { id: 3, title: 'Large transfer amount', severity: 'medium', time: '5 hours ago', address: '0x1F98431c8aD98523631AE4a59f267346ea31F984' },
    { id: 4, title: 'Interaction with flagged contract', severity: 'high', time: '1 day ago', address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' },
  ];

  return (
    <Box className="slide-up">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Transaction Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Monitor your blockchain transactions and security alerts in real-time
        </Typography>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconWrapper color={stat.color}>{stat.icon}</IconWrapper>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </StatsCard>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Recent Transactions */}
        <Grid item xs={12} md={7}>
          <DashboardCard>
            <CardHeader 
              title="Recent Transactions" 
              titleTypographyProps={{ fontWeight: 600 }}
              action={
                <GradientButton 
                  variant="contained" 
                  size="small" 
                  component={RouterLink} 
                  to="/explorer"
                >
                  View All
                </GradientButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                borderRadius: '8px'
              }}>
                <Typography>Transaction chart visualization would appear here</Typography>
              </Box>
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={5}>
          <DashboardCard>
            <CardHeader 
              title="Recent Alerts" 
              titleTypographyProps={{ fontWeight: 600 }}
              action={
                <GradientButton 
                  variant="contained" 
                  size="small" 
                  component={RouterLink} 
                  to="/alerts"
                >
                  View All
                </GradientButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentAlerts.map((alert) => (
                  <AlertCard key={alert.id} severity={alert.severity}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {alert.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: '12px', 
                            bgcolor: alert.severity === 'high' 
                              ? 'error.main' 
                              : alert.severity === 'medium' 
                                ? 'warning.main' 
                                : 'success.main',
                            color: '#fff',
                            fontWeight: 600
                          }}
                        >
                          {alert.severity.toUpperCase()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {alert.address}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {alert.time}
                      </Typography>
                    </CardContent>
                  </AlertCard>
                ))}
              </Box>
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* Risk Analysis */}
        <Grid item xs={12}>
          <DashboardCard>
            <CardHeader 
              title="Risk Analysis" 
              titleTypographyProps={{ fontWeight: 600 }}
              action={
                <GradientButton 
                  variant="contained" 
                  size="small" 
                  component={RouterLink} 
                  to="/reports"
                >
                  Detailed Report
                </GradientButton>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'text.secondary',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                    borderRadius: '8px'
                  }}>
                    <Typography>Risk analysis chart would appear here</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Overall Risk Score
                      </Typography>
                      <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                        82/100
                      </Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        Low Risk
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Risk Factors
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Transaction Volume</Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                            Low
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Contract Interactions</Typography>
                          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                            Medium
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Wallet Age</Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                            Low
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
}
