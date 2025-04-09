import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import TransactionDashboard from './components/TransactionDashboard';
import FraudAlerts from './components/FraudAlerts';
import RiskReports from './components/RiskReports';
import './assets/css/styles.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#3498db',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline />
        <div className="app-container">
          <Header />
          <Box className="content-container">
            <Container maxWidth="lg">
              <Routes>
                <Route path="/" element={<TransactionDashboard />} />
                <Route path="/alerts" element={<FraudAlerts />} />
                <Route path="/reports" element={<RiskReports />} />
              </Routes>
            </Container>
          </Box>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
