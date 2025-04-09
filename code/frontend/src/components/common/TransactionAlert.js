import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Grid, 
  Button, 
  useTheme,
  Divider,
  Avatar
} from '@mui/material';
import { 
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const TransactionAlert = ({ transaction }) => {
  const theme = useTheme();
  
  const getRiskColor = (score) => {
    if (score > 0.7) return theme.palette.error.main;
    if (score > 0.3) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const getRiskLabel = (score) => {
    if (score > 0.7) return 'High Risk';
    if (score > 0.3) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: '12px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 10px 20px rgba(50, 50, 93, 0.1), 0 5px 10px rgba(0, 0, 0, 0.07)',
        },
        borderLeft: `4px solid ${getRiskColor(transaction.risk_score)}`,
        backgroundColor: transaction.risk_score > 0.7 ? 'rgba(244, 67, 54, 0.05)' : 'inherit'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={1}>
          <Avatar 
            sx={{ 
              bgcolor: getRiskColor(transaction.risk_score),
              width: 40,
              height: 40
            }}
          >
            <WarningIcon />
          </Avatar>
        </Grid>
        
        <Grid item xs={12} sm={7}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                Suspicious Transaction
              </Typography>
              <Chip 
                label={getRiskLabel(transaction.risk_score)}
                size="small"
                sx={{ 
                  ml: 1, 
                  bgcolor: getRiskColor(transaction.risk_score),
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Hash:</strong> {transaction.tx_hash}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              <strong>Value:</strong> {transaction.value} ETH
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              <strong>Time:</strong> {new Date(transaction.timestamp * 1000).toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Risk Score: <span style={{ color: getRiskColor(transaction.risk_score) }}>{(transaction.risk_score * 100).toFixed(0)}%</span>
            </Typography>
            
            <Button 
              variant="outlined" 
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => window.location.href = `/transactions/${transaction.tx_hash}`}
              sx={{ 
                borderColor: getRiskColor(transaction.risk_score),
                color: getRiskColor(transaction.risk_score),
                '&:hover': {
                  borderColor: getRiskColor(transaction.risk_score),
                  backgroundColor: `${getRiskColor(transaction.risk_score)}10`,
                }
              }}
            >
              View Details
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionAlert;
