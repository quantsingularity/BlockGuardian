import React from 'react';
import { Box, Typography, Container, Grid, Paper, Button, Card, CardContent, CardHeader, Divider, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Link as RouterLink } from 'react-router-dom';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
  color: '#fff',
  padding: theme.spacing(10, 0),
  borderRadius: '0 0 24px 24px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 20% 150%, rgba(114, 9, 183, 0.7) 0%, transparent 50%)',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
  color: '#fff',
  boxShadow: '0 8px 16px rgba(67, 97, 238, 0.2)',
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(30, 30, 30, 0.6) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
  color: '#fff',
  padding: theme.spacing(1.5, 4),
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 8px 16px rgba(67, 97, 238, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #3a0ca3 0%, #4361ee 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 20px rgba(67, 97, 238, 0.3)',
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderColor: theme.palette.primary.main,
  borderWidth: '2px',
  color: theme.palette.primary.main,
  padding: theme.spacing(1.5, 4),
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    borderWidth: '2px',
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 16px rgba(67, 97, 238, 0.1)',
  },
}));

export default function Home() {
  const theme = useTheme();

  return (
    <Box className="slide-up">
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
              >
                Secure Your DeFi Transactions with BlockGuardian
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 400,
                  opacity: 0.9,
                  maxWidth: '600px'
                }}
              >
                Advanced fraud detection powered by AI and blockchain analytics to protect your digital assets
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <GradientButton 
                  variant="contained" 
                  size="large" 
                  component={RouterLink} 
                  to="/dashboard"
                >
                  Get Started
                </GradientButton>
                <OutlineButton 
                  variant="outlined" 
                  size="large" 
                  component={RouterLink} 
                  to="/explorer"
                >
                  Explore Features
                </OutlineButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img" 
                src="/blockchain-security.svg" 
                alt="Blockchain Security" 
                sx={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))',
                  animation: 'pulse 3s infinite ease-in-out'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                99.8%
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Fraud Detection Rate
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                $2.5M+
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Assets Protected
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                5,000+
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Active Users
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                24/7
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Real-time Monitoring
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            Key Features
          </Typography>
          <Typography 
            variant="h6" 
            color="textSecondary" 
            sx={{ 
              maxWidth: '700px', 
              mx: 'auto',
              fontWeight: 400
            }}
          >
            Discover how BlockGuardian protects your DeFi transactions with advanced technology
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ p: 3 }}>
                <IconWrapper>
                  <SecurityIcon fontSize="large" />
                </IconWrapper>
                <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                  Real-Time Monitoring
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Continuous analysis of blockchain transactions to detect suspicious activities as they happen.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ p: 3 }}>
                <IconWrapper>
                  <ShieldIcon fontSize="large" />
                </IconWrapper>
                <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                  AI-Powered Detection
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Advanced machine learning algorithms that identify patterns and anomalies in transaction data.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ p: 3 }}>
                <IconWrapper>
                  <VerifiedUserIcon fontSize="large" />
                </IconWrapper>
                <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                  Risk Assessment
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Comprehensive risk scoring system to evaluate the safety of DeFi protocols and transactions.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ p: 3 }}>
                <IconWrapper>
                  <TrendingUpIcon fontSize="large" />
                </IconWrapper>
                <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Intuitive visualization of transaction data and risk metrics for informed decision-making.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(30, 30, 30, 0.7) 100%)' 
            : 'linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(248, 249, 250, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          py: 8,
          borderRadius: '24px',
          mb: 6,
          mx: 3,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2 
            }}
          >
            Ready to Secure Your DeFi Assets?
          </Typography>
          <Typography 
            variant="h6" 
            color="textSecondary" 
            sx={{ 
              mb: 4,
              maxWidth: '700px',
              mx: 'auto',
              fontWeight: 400
            }}
          >
            Join thousands of users who trust BlockGuardian to protect their digital assets from fraud and scams.
          </Typography>
          <GradientButton 
            variant="contained" 
            size="large" 
            component={RouterLink} 
            to="/wallet"
            sx={{ px: 6, py: 1.5 }}
          >
            Connect Wallet
          </GradientButton>
        </Container>
      </Box>
    </Box>
  );
}
