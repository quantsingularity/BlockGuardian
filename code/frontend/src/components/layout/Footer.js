import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} BlockGuardian - Fraud Detection System for DeFi
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Secure blockchain transaction monitoring and fraud prevention
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
