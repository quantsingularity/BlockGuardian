import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';

export default function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('/api/alerts')
      .then(response => setAlerts(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Transaction Hash</TableCell>
            <TableCell>Risk Score</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map(alert => (
            <TableRow key={alert.tx_hash}>
              <TableCell>{alert.tx_hash}</TableCell>
              <TableCell style={{ color: 'red' }}>{alert.risk_score}</TableCell>
              <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}