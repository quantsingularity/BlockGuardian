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
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
  Stack
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
  Shield as ShieldIcon,
  Insights as InsightsIcon,
  Notifications as NotificationsIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import components
import StatusCard from './common/StatusCard';

export default function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    protectedTransactions: 0,
    detectedThreats: 0,
    securityScore: 0,
    activeMonitoring: false
  });

  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        protectedTransactions: 1287,
        detectedThreats: 23,
        securityScore: 92,
        activeMonitoring: true
      });
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Features data
  const features = [
    {
      title: 'Real-time Monitoring',
      description: 'Monitor blockchain transactions in real-time to detect suspicious activities.',
      icon: <SpeedIcon fontSize="large" color="primary" />,
      path: '/explorer'
    },
    {
      title: 'Fraud Detection',
      description: 'Advanced AI algorithms to identify potential fraud patterns.',
      icon: <SecurityIcon fontSize="large" color="primary" />,
      path: '/alerts'
    },
    {
      title: 'Risk Analysis',
      description: 'Comprehensive risk assessment for blockchain addresses and transactions.',
      icon: <InsightsIcon fontSize="large" color="primary" />,
      path: '/reports'
    },
    {
      title: 'Wallet Protection',
      description: 'Secure your crypto assets with advanced protection mechanisms.',
      icon: <WalletIcon fontSize="large" color="primary" />,
      path: '/wallet'
    }
  ];

  // Recent alerts data
  const recentAlerts = [
    {
      id: 1,
      type: 'High Risk Transaction',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      risk: 'high',
      time: '10 minutes ago'
    },
    {
      id: 2,
      type: 'Suspicious Pattern',
      address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      risk: 'medium',
      time: '2 hours ago'
    },
    {
      id: 3,
      type: 'Unusual Activity',
      address: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148',
      risk: 'low',
      time: '1 day ago'
    }
  ];

  return (
    <Box sx={{ py: 3 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: { xs: '100%', md: '40%' },
            opacity: 0.1,
            background: 'url(https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80) no-repeat center center',
            backgroundSize: 'cover',
            zIndex: 0
          }}
        />
        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Blockchain Security Reimagined
            </Typography>
            <Typography variant="h6" paragraph sx={{ mb: 3, opacity: 0.9 }}>
              BlockGuardian provides advanced fraud detection and security monitoring for your blockchain transactions. Protect your assets with real-time alerts and comprehensive risk analysis.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate('/explorer')}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 16px rgba(0, 188, 212, 0.3)'
                }}
              >
                Start Monitoring
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/reports')}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                View Reports
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="Protected Transactions" 
            value={loading ? '-' : stats.protectedTransactions.toLocaleString()} 
            icon={<ShieldIcon fontSize="large" />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="Detected Threats" 
            value={loading ? '-' : stats.detectedThreats.toLocaleString()} 
            icon={<NotificationsIcon fontSize="large" />}
            color="error"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="Security Score" 
            value={loading ? '-' : `${stats.securityScore}%`} 
            icon={<TrendingUpIcon fontSize="large" />}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard 
            title="Monitoring Status" 
            value={loading ? '-' : (stats.activeMonitoring ? 'Active' : 'Inactive')} 
            icon={<VisibilityIcon fontSize="large" />}
            color={stats.activeMonitoring ? "success" : "warning"}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Key Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: '16px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: theme.palette.primary.light + '20',
                      color: theme.palette.primary.main
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                </Box>
                <Typography variant="h6" component="h3" gutterBottom align="center" fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2, flexGrow: 1 }}>
                  {feature.description}
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(feature.path)}
                  sx={{ alignSelf: 'center', mt: 'auto' }}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Alerts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '16px' }}>
            <CardHeader 
              title="Recent Alerts" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              action={
                <Button 
                  variant="text" 
                  color="primary" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/alerts')}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box sx={{ width: '100%', my: 4 }}>
                  <LinearProgress />
                </Box>
              ) : recentAlerts.length > 0 ? (
                <Stack spacing={2}>
                  {recentAlerts.map((alert) => (
                    <Paper 
                      key={alert.id} 
                      variant="outlined"
                      sx={{ 
                        p: 2, 
                        borderRadius: '8px',
                        borderLeft: `4px solid ${
                          alert.risk === 'high' ? theme.palette.error.main :
                          alert.risk === 'medium' ? theme.palette.warning.main :
                          theme.palette.success.main
                        }`
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {alert.type}
                        </Typography>
                        <Chip 
                          label={alert.risk.toUpperCase()} 
                          size="small"
                          color={
                            alert.risk === 'high' ? 'error' :
                            alert.risk === 'medium' ? 'warning' :
                            'success'
                          }
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Address: {alert.address.substring(0, 8)}...{alert.address.substring(alert.address.length - 6)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {alert.time}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  No recent alerts found.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Security Score Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '16px', height: '100%' }}>
            <CardHeader 
              title="Security Overview" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              action={
                <Tooltip title="Refresh">
                  <IconButton>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 72px)' }}>
              {loading ? (
                <Box sx={{ width: '100%', my: 4 }}>
                  <LinearProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
                      <CircularProgress
                        variant="determinate"
                        value={stats.securityScore}
                        size={100}
                        thickness={5}
                        sx={{
                          color: stats.securityScore > 80 ? theme.palette.success.main :
                                 stats.securityScore > 50 ? theme.palette.warning.main :
                                 theme.palette.error.main
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h4" component="div" fontWeight="bold">
                          {stats.securityScore}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Security Score
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your blockchain security is {
                          stats.securityScore > 80 ? 'excellent' :
                          stats.securityScore > 50 ? 'good' :
                          'at risk'
                        }
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Security Recommendations
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Real-time monitoring is active" 
                        secondary="Your transactions are being monitored for suspicious activity"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Fraud detection enabled" 
                        secondary="AI-powered fraud detection is analyzing your transactions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Enable two-factor authentication" 
                        secondary="Add an extra layer of security to your account"
                      />
                    </ListItem>
                  </List>
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/settings')}
                    sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                  >
                    Improve Security
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Call to Action Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Ready to Secure Your Blockchain Assets?
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
          Join thousands of users who trust BlockGuardian to protect their digital assets from fraud and security threats.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/wallet')}
          sx={{ 
            px: 4, 
            py: 1.5,
            borderRadius: '30px',
            fontWeight: 'bold',
            backgroundColor: 'white',
            color: theme.palette.secondary.dark,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        >
          Connect Wallet
        </Button>
      </Paper>
    </Box>
  );
}
