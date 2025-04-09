import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  Divider,
  Avatar,
  Chip,
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const WalletConnection = () => {
  const theme = useTheme();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const handleConnect = () => {
    setConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      setWalletAddress('0x7F5EB5bB5cF88cfcEe9613368636f458800e62CB');
      setBalance(3.45);
      setTransactions([
        { hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', value: 0.5, timestamp: Date.now() - 3600000 },
        { hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', value: 1.2, timestamp: Date.now() - 86400000 },
        { hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', value: 0.75, timestamp: Date.now() - 172800000 }
      ]);
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setWalletAddress('');
    setBalance(0);
    setTransactions([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Wallet Connection
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 3,
          borderRadius: '12px',
          boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
        }}
      >
        {!connected ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                margin: '0 auto 24px',
                backgroundColor: theme.palette.primary.main
              }}
            >
              <WalletIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              Connect Your Wallet
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Connect your Ethereum wallet to monitor transactions and receive alerts for suspicious activities. 
              BlockGuardian helps you protect your assets by analyzing transaction patterns.
            </Typography>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={handleConnect}
              disabled={connecting}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #3a36e0 30%, #6c63ff 90%)',
                boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              {connecting ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  mr: 2
                }}
              >
                <WalletIcon sx={{ fontSize: 30 }} />
              </Avatar>
              
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                  Wallet Connected
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
                  </Typography>
                  <Tooltip title={copied ? "Copied!" : "Copy address"}>
                    <IconButton size="small" onClick={handleCopy} sx={{ ml: 1 }}>
                      {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ ml: 'auto' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(58, 54, 224, 0.1) 0%, rgba(108, 99, 255, 0.05) 100%)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Wallet Overview
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Balance
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      {balance} ETH
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Risk Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label="Low Risk" 
                        color="success" 
                        sx={{ fontWeight: 'bold' }} 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        No suspicious activities detected
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => window.location.href = '/reports'}
                    >
                      View Risk Report
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Recent Transactions
                  </Typography>
                  
                  {transactions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                      No transactions found
                    </Typography>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      {transactions.map((tx, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            py: 2, 
                            borderBottom: index < transactions.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(tx.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {tx.value} ETH
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => window.location.href = `/transactions/${tx.hash}`}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                      
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button 
                          variant="text" 
                          onClick={() => window.location.href = '/transactions'}
                        >
                          View All Transactions
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default WalletConnection;
