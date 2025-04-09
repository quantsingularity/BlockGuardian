import React from 'react';
import { Alert, AlertTitle, Box, Chip, Paper, Typography } from '@mui/material';

const TransactionAlert = ({ transaction, severity = "error" }) => {
  return (
    <Alert 
      severity={severity} 
      variant="outlined"
      sx={{ mb: 2 }}
    >
      <AlertTitle>Transaction Alert</AlertTitle>
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Hash:</strong> {transaction.tx_hash}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Value:</strong> {transaction.value} ETH
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Risk Score:</strong> 
          <Chip 
            label={`${(transaction.risk_score * 100).toFixed(1)}%`}
            color={transaction.risk_score > 0.7 ? "error" : transaction.risk_score > 0.3 ? "warning" : "success"}
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
        <Typography variant="body2">
          <strong>Time:</strong> {new Date(transaction.timestamp * 1000).toLocaleString()}
        </Typography>
      </Box>
    </Alert>
  );
};

export default TransactionAlert;
