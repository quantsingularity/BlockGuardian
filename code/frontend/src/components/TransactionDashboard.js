import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@material-ui/core';
import axios from 'axios';

export default function TransactionDashboard() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('/api/transactions')
      .then(response => setTransactions(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
      <Typography variant="h4" gutterBottom>
        Real-time Transaction Monitor
      </Typography>
      <Grid container spacing={3}>
        {transactions.map(tx => (
          <Grid item xs={12} key={tx.tx_hash}>
            <TransactionCard tx={tx} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

function TransactionCard({ tx }) {
  return (
    <Paper style={{ padding: '15px', backgroundColor: tx.flagged ? '#f8d7da' : '#fff' }}>
      <Typography>Hash: {tx.tx_hash}</Typography>
      <Typography>Value: {tx.value} ETH</Typography>
      <Typography>Risk Score: {(tx.risk_score * 100).toFixed(1)}%</Typography>
    </Paper>
  );
}