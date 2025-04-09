import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const BlockchainExplorer = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('address'); // 'address', 'transaction', 'block'
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!searchTerm) {
      setError('Please enter a search term');
      return;
    }
    
    setError('');
    setSearching(true);
    
    // Simulate search
    setTimeout(() => {
      if (searchType === 'address') {
        setSearchResult({
          type: 'address',
          address: searchTerm,
          balance: '3.45 ETH',
          transactions: [
            { hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', value: '0.5 ETH', timestamp: Date.now() - 3600000 },
            { hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', value: '1.2 ETH', timestamp: Date.now() - 86400000 },
            { hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', value: '0.75 ETH', timestamp: Date.now() - 172800000 }
          ]
        });
      } else if (searchType === 'transaction') {
        setSearchResult({
          type: 'transaction',
          hash: searchTerm,
          from: '0x7F5EB5bB5cF88cfcEe9613368636f458800e62CB',
          to: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF',
          value: '1.5 ETH',
          gasPrice: '20 Gwei',
          gasUsed: '21000',
          blockNumber: '12345678',
          timestamp: Date.now() - 3600000,
          status: 'Success'
        });
      } else if (searchType === 'block') {
        setSearchResult({
          type: 'block',
          number: searchTerm,
          hash: '0x8901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
          timestamp: Date.now() - 3600000,
          transactions: 150,
          miner: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          gasUsed: '8,500,000',
          gasLimit: '12,500,000'
        });
      }
      
      setSearching(false);
    }, 1500);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setSearchResult(null);
  };

  const renderSearchResult = () => {
    if (!searchResult) return null;
    
    if (searchResult.type === 'address') {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Address Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: '12px',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(58, 54, 224, 0.1) 0%, rgba(108, 99, 255, 0.05) 100%)',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {searchResult.address}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy address"}>
                      <IconButton size="small" onClick={() => handleCopy(searchResult.address)} sx={{ ml: 1 }}>
                        {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Balance
                  </Typography>
                  <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                    {searchResult.balance}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: '12px',
                  height: '100%'
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Transactions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction Hash</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResult.transactions.map((tx, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {tx.hash.substring(0, 10)}...
                            </Typography>
                          </TableCell>
                          <TableCell>{tx.value}</TableCell>
                          <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSearchType('transaction');
                                setSearchTerm(tx.hash);
                                handleSearch();
                              }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      );
    } else if (searchResult.type === 'transaction') {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Transaction Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction Hash
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {searchResult.hash}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy hash"}>
                      <IconButton size="small" onClick={() => handleCopy(searchResult.hash)} sx={{ ml: 1 }}>
                        {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={searchResult.status} 
                    color={searchResult.status === 'Success' ? 'success' : 'error'} 
                    size="small" 
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body1">
                    {new Date(searchResult.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    From
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {searchResult.from}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    To
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {searchResult.to}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Value
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {searchResult.value}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gas Price
                  </Typography>
                  <Typography variant="body1">
                    {searchResult.gasPrice}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gas Used
                  </Typography>
                  <Typography variant="body1">
                    {searchResult.gasUsed}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Block
                  </Typography>
                  <Button 
                    variant="text" 
                    onClick={() => {
                      setSearchType('block');
                      setSearchTerm(searchResult.blockNumber);
                      handleSearch();
                    }}
                    sx={{ p: 0, minWidth: 'auto' }}
                  >
                    {searchResult.blockNumber}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      );
    } else if (searchResult.type === 'block') {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Block Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Block Number
                  </Typography>
                  <Typography variant="body1">
                    {searchResult.number}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body1">
                    {new Date(searchResult.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Block Hash
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {searchResult.hash}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy hash"}>
                      <IconButton size="small" onClick={() => handleCopy(searchResult.hash)} sx={{ ml: 1 }}>
                        {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Transactions
                  </Typography>
                  <Typography variant="body1">
                    {searchResult.transactions}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Miner
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {searchResult.miner}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gas Used
                  </Typography>
                  <Typography variant="body1">
                    {searchResult.gasUsed}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gas Limit
                  </Typography>
                  <Typography variant="body1">
                    {searchResult.gasLimit}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Blockchain Explorer
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
        <Typography variant="h6" gutterBottom>
          Search Blockchain
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter an address, transaction hash, or block number to explore the blockchain.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <Button 
            variant={searchType === 'address' ? 'contained' : 'outlined'}
            onClick={() => handleSearchTypeChange('address')}
            sx={{ flex: 1 }}
          >
            Address
          </Button>
          <Button 
            variant={searchType === 'transaction' ? 'contained' : 'outlined'}
            onClick={() => handleSearchTypeChange('transaction')}
            sx={{ flex: 1 }}
          >
            Transaction
          </Button>
          <Button 
            variant={searchType === 'block' ? 'contained' : 'outlined'}
            onClick={() => handleSearchTypeChange('block')}
            sx={{ flex: 1 }}
          >
            Block
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder={
              searchType === 'address' ? 'Enter address (0x...)' : 
              searchType === 'transaction' ? 'Enter transaction hash (0x...)' : 
              'Enter block number'
            }
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: (
                <SearchIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={searching}
            sx={{ 
              minWidth: '120px',
              background: 'linear-gradient(45deg, #3a36e0 30%, #6c63ff 90%)',
            }}
          >
            {searching ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>
        
        {renderSearchResult()}
      </Paper>
    </Box>
  );
};

export default BlockchainExplorer;
