import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Box, ThemeProvider, createTheme } from '@mui/material';
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
import './assets/css/styles.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check if user has previously set dark mode preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    } else {
      // Check if user prefers dark mode at system level
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3a36e0', // Modern blue-purple
        light: '#6c63ff',
        dark: '#2a26a0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#00bcd4', // Teal accent
        light: '#62efff',
        dark: '#008ba3',
        contrastText: '#ffffff',
      },
      error: {
        main: '#f44336',
        light: '#ff7961',
        dark: '#ba000d',
      },
      warning: {
        main: '#ff9800',
        light: '#ffc947',
        dark: '#c66900',
      },
      success: {
        main: '#4caf50',
        light: '#80e27e',
        dark: '#087f23',
      },
      background: {
        default: darkMode ? '#121212' : '#f8f9fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
      },
      button: {
        textTransform: 'none', // More modern look without all caps
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 10, // Slightly rounded corners for modern look
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '8px 16px',
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(45deg, #3a36e0 30%, #6c63ff 90%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline />
        <div className="app-container">
          <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Box 
            className="content-container"
            sx={{ 
              pt: 8, // Space for fixed header
              pb: 2,
              minHeight: 'calc(100vh - 64px)', // Full height minus header
              ml: { sm: '240px' }, // Space for sidebar on non-mobile
              width: { sm: 'calc(100% - 240px)' }, // Adjust width for sidebar
              transition: 'margin 0.2s ease-out, width 0.2s ease-out',
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
