import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Box } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import TransactionDashboard from './components/TransactionDashboard';
import FraudAlerts from './components/FraudAlerts';
import RiskReports from './components/RiskReports';
import WalletConnection from './components/WalletConnection';
import BlockchainExplorer from './components/BlockchainExplorer';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Home from './components/Home';
import MultiWalletManager from './components/MultiWalletManager';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import { ThemeProvider } from './theme/ThemeContext';
import './assets/css/styles.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <CssBaseline />
        <div className="app-container">
          <Header />
          <Box 
            className="content-container fade-in"
            sx={{ 
              pt: 8, // Space for fixed header
              pb: 2,
              minHeight: 'calc(100vh - 64px)', // Full height minus header
              ml: { sm: '240px' }, // Space for sidebar on non-mobile
              width: { sm: 'calc(100% - 240px)' }, // Adjust width for sidebar
              transition: 'margin 0.3s ease-out, width 0.3s ease-out',
            }}
          >
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<TransactionDashboard />} />
                <Route path="/alerts" element={<FraudAlerts />} />
                <Route path="/reports" element={<RiskReports />} />
                <Route path="/wallet" element={<WalletConnection />} />
                <Route path="/explorer" element={<BlockchainExplorer />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/multi-wallet" element={<MultiWalletManager />} />
                <Route path="/analytics" element={<AdvancedAnalytics />} />
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
