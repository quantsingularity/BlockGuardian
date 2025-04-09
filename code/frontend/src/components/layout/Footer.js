import React from 'react';
import { Box, Typography, Container, Link, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'dark' ? 
          theme.palette.background.paper : 
          theme.palette.grey[100],
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ fontWeight: 'bold' }}
            >
              © {year} BlockGuardian - Fraud Detection System for DeFi
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Secure blockchain transaction monitoring and fraud prevention
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3,
              justifyContent: 'center',
            }}
          >
            <Link href="/about" color="text.secondary" underline="hover">
              About
            </Link>
            <Link href="/privacy" color="text.secondary" underline="hover">
              Privacy
            </Link>
            <Link href="/terms" color="text.secondary" underline="hover">
              Terms
            </Link>
            <Link href="/contact" color="text.secondary" underline="hover">
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
