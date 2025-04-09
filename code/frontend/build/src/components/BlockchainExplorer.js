import React from 'react';
import { Box, Typography, Container, Grid, Paper, Card, CardContent, CardHeader, Divider, useTheme, Button, Avatar, Chip, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// Styled components
const ExplorerCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
  color: '#fff',
  padding: theme.spacing(1, 3),
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 8px rgba(67, 97, 238, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #3a0ca3 0%, #4361ee 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(67, 97, 238, 0.3)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(67, 97, 238, 0.2)',
    },
  },
}));

const TransactionItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
}));

const IconWrapper = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: theme.palette[color || 'primary'].main,
  width: 40,
  height: 40,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
}));

export default function BlockchainExplorer() {
  const theme = useTheme();

  // Mock data
  const recentTransactions = [
    { 
      id: 1, 
      hash: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 
      type: 'Transfer', 
      amount: '1.25 ETH',
      from: '0x8C76BFd63D602B0b0D3e79008Db2EBB8928dC2C0',
      to: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      time: '10 minutes ago',
      status: 'Confirmed'
    },
    { 
      id: 2, 
      hash: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', 
      type: 'Swap', 
      amount: '500 USDC → 0.25 ETH',
      from: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      time: '25 minutes ago',
      status: 'Confirmed'
    },
    { 
      id: 3, 
      hash: '0xE592427A0AEce92De3Edee1F18E0157C05861564', 
      type: 'Contract Interaction', 
      amount: '0.05 ETH',
      from: '0x8C76BFd63D602B0b0D3e79008Db2EBB8928dC2C0',
      to: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      time: '1 hour ago',
      status: 'Confirmed'
    },
    { 
      id: 4, 
      hash: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', 
      type: 'Approval', 
      amount: 'Unlimited',
      from: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      time: '2 hours ago',
      status: 'Confirmed'
    },
  ];

  return (
    <Box className="slide-up">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Blockchain Explorer
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Search and analyze blockchain transactions, addresses, and smart contracts
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.1) 0%, rgba(114, 9, 183, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(67, 97, 238, 0.2)'}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Search Blockchain
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <StyledTextField
              fullWidth
              placeholder="Search by transaction hash, address, or block number..."
              variant="outlined"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <GradientButton 
              variant="contained" 
              fullWidth
              sx={{ height: '100%' }}
            >
              Search
            </GradientButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Explorer Features */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ExplorerCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <IconWrapper 
                sx={{ 
                  mx: 'auto', 
                  mb: 2, 
                  width: 56, 
                  height: 56,
                  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                }}
              >
                <ExploreIcon />
              </IconWrapper>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Browse Blocks
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Explore the latest blocks and their transactions
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                  }
                }}
              >
                View Blocks
              </Button>
            </CardContent>
          </ExplorerCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ExplorerCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <IconWrapper 
                sx={{ 
                  mx: 'auto', 
                  mb: 2, 
                  width: 56, 
                  height: 56,
                  background: 'linear-gradient(135deg, #7209b7 0%, #560bad 100%)',
                }}
              >
                <ReceiptLongIcon />
              </IconWrapper>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Transactions
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                View and analyze transaction details
              </Typography>
              <Button 
                variant="outlined" 
                color="secondary" 
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                  }
                }}
              >
                View Transactions
              </Button>
            </CardContent>
          </ExplorerCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ExplorerCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <IconWrapper 
                sx={{ 
                  mx: 'auto', 
                  mb: 2, 
                  width: 56, 
                  height: 56,
                  background: 'linear-gradient(135deg, #06d6a0 0%, #05a882 100%)',
                }}
                color="success"
              >
                <AccountBalanceWalletIcon />
              </IconWrapper>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Addresses
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Explore wallet addresses and balances
              </Typography>
              <Button 
                variant="outlined" 
                color="success" 
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                  }
                }}
              >
                View Addresses
              </Button>
            </CardContent>
          </ExplorerCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ExplorerCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <IconWrapper 
                sx={{ 
                  mx: 'auto', 
                  mb: 2, 
                  width: 56, 
                  height: 56,
                  background: 'linear-gradient(135deg, #ef476f 0%, #d64161 100%)',
                }}
                color="error"
              >
                <SearchIcon />
              </IconWrapper>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Smart Contracts
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Analyze smart contract code and interactions
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                  }
                }}
              >
                View Contracts
              </Button>
            </CardContent>
          </ExplorerCard>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <ExplorerCard sx={{ mb: 4 }}>
        <CardHeader 
          title="Recent Transactions" 
          titleTypographyProps={{ fontWeight: 600 }}
          action={
            <GradientButton 
              variant="contained" 
              size="small"
            >
              View All
            </GradientButton>
          }
        />
        <Divider />
        <CardContent sx={{ p: 3 }}>
          {recentTransactions.map((tx) => (
            <TransactionItem key={tx.id} elevation={0}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {tx.type}
                      <Chip 
                        label={tx.status} 
                        size="small"
                        sx={{ 
                          ml: 1,
                          bgcolor: tx.status === 'Confirmed' ? theme.palette.success.main : theme.palette.warning.main,
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: '20px'
                        }}
                      />
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                      Hash: <Box component="span" sx={{ fontFamily: 'monospace' }}>{tx.hash}</Box>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                      From: <Box component="span" sx={{ fontFamily: 'monospace' }}>{tx.from.substring(0, 8)}...{tx.from.substring(tx.from.length - 6)}</Box>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                      To: <Box component="span" sx={{ fontFamily: 'monospace' }}>{tx.to.substring(0, 8)}...{tx.to.substring(tx.to.length - 6)}</Box>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Amount
                  </Typography>
                  <Typography variant="body2">
                    {tx.amount}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={2} sx={{ textAlign: { xs: 'right', md: 'right' } }}>
                  <Typography variant="caption" color="textSecondary">
                    {tx.time}
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    size="small"
                    sx={{ 
                      display: 'block', 
                      ml: 'auto', 
                      textTransform: 'none',
                      fontWeight: 500,
                      p: 0,
                      minWidth: 'auto'
                    }}
                  >
                    Details
                  </Button>
                </Grid>
              </Grid>
            </TransactionItem>
          ))}
        </CardContent>
      </ExplorerCard>
    </Box>
  );
}
