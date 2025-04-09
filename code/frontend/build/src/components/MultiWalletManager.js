import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Link as LinkIcon
} from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MultiWalletManager() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([
    {
      id: 1,
      name: 'Main Wallet',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      type: 'ETH',
      balance: 3.45,
      riskScore: 12,
      isMonitored: true,
      transactions: [
        { id: 1, hash: '0x123...abc', value: 0.5, timestamp: '2025-04-08T14:32:00Z', status: 'confirmed' },
        { id: 2, hash: '0x456...def', value: 1.2, timestamp: '2025-04-07T09:15:00Z', status: 'confirmed' }
      ]
    },
    {
      id: 2,
      name: 'Savings',
      address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      type: 'BTC',
      balance: 0.25,
      riskScore: 5,
      isMonitored: true,
      transactions: [
        { id: 3, hash: '0x789...ghi', value: 0.1, timestamp: '2025-04-05T16:45:00Z', status: 'confirmed' }
      ]
    }
  ]);
  const [newWallet, setNewWallet] = useState({
    name: '',
    address: '',
    type: 'ETH'
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [alertThresholds, setAlertThresholds] = useState({
    highRiskThreshold: 70,
    mediumRiskThreshold: 30,
    largeTransactionAmount: 1.0,
    enableRealTimeAlerts: true,
    enableDailyDigest: true
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddWallet = () => {
    if (!newWallet.name || !newWallet.address) return;
    
    setLoading(true);
    
    // Simulate API call to add wallet
    setTimeout(() => {
      const newId = wallets.length > 0 ? Math.max(...wallets.map(w => w.id)) + 1 : 1;
      
      setWallets([
        ...wallets,
        {
          id: newId,
          ...newWallet,
          balance: 0,
          riskScore: 0,
          isMonitored: true,
          transactions: []
        }
      ]);
      
      setNewWallet({
        name: '',
        address: '',
        type: 'ETH'
      });
      
      setLoading(false);
    }, 1000);
  };

  const handleDeleteWallet = (id) => {
    setLoading(true);
    
    // Simulate API call to delete wallet
    setTimeout(() => {
      setWallets(wallets.filter(wallet => wallet.id !== id));
      setLoading(false);
    }, 1000);
  };

  const handleEditWallet = (wallet) => {
    setSelectedWallet(wallet);
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    setLoading(true);
    
    // Simulate API call to update wallet
    setTimeout(() => {
      setWallets(wallets.map(wallet => 
        wallet.id === selectedWallet.id ? selectedWallet : wallet
      ));
      
      setEditMode(false);
      setSelectedWallet(null);
      setLoading(false);
    }, 1000);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedWallet(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWallet({
      ...newWallet,
      [name]: value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedWallet({
      ...selectedWallet,
      [name]: value
    });
  };

  const handleMonitoringToggle = (id) => {
    setWallets(wallets.map(wallet => 
      wallet.id === id ? { ...wallet, isMonitored: !wallet.isMonitored } : wallet
    ));
  };

  const handleThresholdChange = (e) => {
    const { name, value } = e.target;
    setAlertThresholds({
      ...alertThresholds,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setAlertThresholds({
      ...alertThresholds,
      [name]: checked
    });
  };

  const handleRefreshWallets = () => {
    setLoading(true);
    
    // Simulate API call to refresh wallet data
    setTimeout(() => {
      // In a real app, this would fetch updated data from the blockchain
      setLoading(false);
    }, 1500);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Multi-Wallet Manager
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="wallet manager tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="My Wallets" id="wallet-tab-0" aria-controls="wallet-tabpanel-0" />
          <Tab label="Add Wallet" id="wallet-tab-1" aria-controls="wallet-tabpanel-1" />
          <Tab label="Alert Settings" id="wallet-tab-2" aria-controls="wallet-tabpanel-2" />
        </Tabs>
      </Box>
      
      {/* My Wallets Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefreshWallets}
            disabled={loading}
          >
            Refresh Wallets
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : wallets.length > 0 ? (
          <Grid container spacing={3}>
            {wallets.map((wallet) => (
              <Grid item xs={12} md={6} key={wallet.id}>
                <Card 
                  sx={{ 
                    borderRadius: '12px',
                    boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
                    },
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WalletIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6">{wallet.name}</Typography>
                      </Box>
                    }
                    action={
                      <Box>
                        <Tooltip title="Edit Wallet">
                          <IconButton onClick={() => handleEditWallet(wallet)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Wallet">
                          <IconButton onClick={() => handleDeleteWallet(wallet.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label={wallet.type} 
                          size="small" 
                          color="primary" 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                        </Typography>
                        <Tooltip title="Copy Address">
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(wallet.address)}>
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Balance
                        </Typography>
                        <Typography variant="h6">
                          {wallet.balance} {wallet.type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Risk Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ mr: 1 }}>
                            {wallet.riskScore}%
                          </Typography>
                          {wallet.riskScore > 70 ? (
                            <WarningIcon color="error" fontSize="small" />
                          ) : wallet.riskScore > 30 ? (
                            <InfoIcon color="warning" fontSize="small" />
                          ) : (
                            <CheckIcon color="success" fontSize="small" />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={wallet.isMonitored}
                              onChange={() => handleMonitoringToggle(wallet.id)}
                              color="primary"
                            />
                          }
                          label="Active Monitoring"
                        />
                      </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Recent Transactions
                    </Typography>
                    
                    {wallet.transactions.length > 0 ? (
                      <List dense>
                        {wallet.transactions.map((tx) => (
                          <ListItem key={tx.id} sx={{ px: 1, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${tx.value} ${wallet.type}`}
                              secondary={`${tx.hash.substring(0, 6)}... • ${formatDate(tx.timestamp)}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recent transactions
                      </Typography>
                    )}
                    
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      View All Transactions
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            You don't have any wallets yet. Add a wallet to start monitoring.
          </Alert>
        )}
        
        {/* Edit Wallet Dialog */}
        {editMode && selectedWallet && (
          <Paper
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '500px' },
              p: 4,
              zIndex: 1000,
              borderRadius: '12px',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Edit Wallet
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Name"
                  name="name"
                  value={selectedWallet.name}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  name="address"
                  value={selectedWallet.address}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="edit-wallet-type-label">Wallet Type</InputLabel>
                  <Select
                    labelId="edit-wallet-type-label"
                    id="edit-wallet-type"
                    name="type"
                    value={selectedWallet.type}
                    onChange={handleEditInputChange}
                    label="Wallet Type"
                  >
                    <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
                    <MenuItem value="BTC">Bitcoin (BTC)</MenuItem>
                    <MenuItem value="SOL">Solana (SOL)</MenuItem>
                    <MenuItem value="ADA">Cardano (ADA)</MenuItem>
                    <MenuItem value="DOT">Polkadot (DOT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSaveEdit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        )}
      </TabPanel>
      
      {/* Add Wallet Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" gutterBottom>
            Add New Wallet
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wallet Name"
                name="name"
                value={newWallet.name}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                placeholder="e.g., Main Wallet, Trading Account"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wallet Address"
                name="address"
                value={newWallet.address}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                placeholder="0x..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="wallet-type-label">Wallet Type</InputLabel>
                <Select
                  labelId="wallet-type-label"
                  id="wallet-type"
                  name="type"
                  value={newWallet.type}
                  onChange={handleInputChange}
                  label="Wallet Type"
                >
                  <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
                  <MenuItem value="BTC">Bitcoin (BTC)</MenuItem>
                  <MenuItem value="SOL">Solana (SOL)</MenuItem>
                  <MenuItem value="ADA">Cardano (ADA)</MenuItem>
                  <MenuItem value="DOT">Polkadot (DOT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddWallet}
              disabled={loading || !newWallet.name || !newWallet.address}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Wallet'}
            </Button>
          </Box>
        </Paper>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          Adding a wallet will enable BlockGuardian to monitor transactions and provide security alerts for this address. We never store your private keys.
        </Alert>
      </TabPanel>
      
      {/* Alert Settings Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" gutterBottom>
            Alert Thresholds
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Risk Score Thresholds
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography id="high-risk-threshold-label" gutterBottom>
                  High Risk Threshold: {alertThresholds.highRiskThreshold}%
                </Typography>
                <Slider
                  value={alertThresholds.highRiskThreshold}
                  onChange={(e, newValue) => 
                    setAlertThresholds({...alertThresholds, highRiskThreshold: newValue})
                  }
                  aria-labelledby="high-risk-threshold-label"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={50}
                  max={95}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography id="medium-risk-threshold-label" gutterBottom>
                  Medium Risk Threshold: {alertThresholds.mediumRiskThreshold}%
                </Typography>
                <Slider
                  value={alertThresholds.mediumRiskThreshold}
                  onChange={(e, newValue) => 
                    setAlertThresholds({...alertThresholds, mediumRiskThreshold: newValue})
                  }
                  aria-labelledby="medium-risk-threshold-label"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={10}
                  max={50}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Transaction Monitoring
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography id="large-transaction-label" gutterBottom>
                  Large Transaction Amount: {alertThresholds.largeTransactionAmount} ETH
                </Typography>
                <Slider
                  value={alertThresholds.largeTransactionAmount}
                  onChange={(e, newValue) => 
                    setAlertThresholds({...alertThresholds, largeTransactionAmount: newValue})
                  }
                  aria-labelledby="large-transaction-label"
                  valueLabelDisplay="auto"
                  step={0.1}
                  marks
                  min={0.1}
                  max={5.0}
                />
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={alertThresholds.enableRealTimeAlerts}
                    onChange={handleSwitchChange}
                    name="enableRealTimeAlerts"
                    color="primary"
                  />
                }
                label="Enable Real-time Alerts"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={alertThresholds.enableDailyDigest}
                    onChange={handleSwitchChange}
                    name="enableDailyDigest"
                    color="primary"
                  />
                }
                label="Enable Daily Digest"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={() => alert('Settings saved!')}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
}
