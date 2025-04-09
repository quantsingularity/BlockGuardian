import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Language as LanguageIcon,
  ColorLens as ColorLensIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';

export default function Settings() {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      highRiskOnly: false,
      frequency: 'immediate'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      ipWhitelist: '',
      apiKeyVisible: false,
      apiKey: 'bg_api_28f7s9d7f9sd87f9sd87f9s8d7f'
    },
    display: {
      language: 'en',
      currency: 'USD',
      theme: 'system',
      riskThreshold: 70
    }
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [loading, setLoading] = useState(false);

  // Simulating loading settings from backend
  useEffect(() => {
    // In a real app, this would be an API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: checked
      }
    });
  };

  const handleFrequencyChange = (event) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        frequency: event.target.value
      }
    });
  };

  const handleSecurityChange = (event) => {
    const { name, checked } = event.target;
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [name]: checked
      }
    });
  };

  const handleSessionTimeoutChange = (event, newValue) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        sessionTimeout: newValue
      }
    });
  };

  const handleIpWhitelistChange = (event) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        ipWhitelist: event.target.value
      }
    });
  };

  const toggleApiKeyVisibility = () => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        apiKeyVisible: !settings.security.apiKeyVisible
      }
    });
  };

  const handleDisplayChange = (event) => {
    const { name, value } = event.target;
    setSettings({
      ...settings,
      display: {
        ...settings.display,
        [name]: value
      }
    });
  };

  const handleRiskThresholdChange = (event, newValue) => {
    setSettings({
      ...settings,
      display: {
        ...settings.display,
        riskThreshold: newValue
      }
    });
  };

  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success'
      });
    }, 1500);
  };

  const handleResetSettings = () => {
    setLoading(true);
    
    // Simulate API call to reset settings
    setTimeout(() => {
      setSettings({
        notifications: {
          email: true,
          push: true,
          sms: false,
          highRiskOnly: false,
          frequency: 'immediate'
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          ipWhitelist: '',
          apiKeyVisible: false,
          apiKey: 'bg_api_28f7s9d7f9sd87f9sd87f9s8d7f'
        },
        display: {
          language: 'en',
          currency: 'USD',
          theme: 'system',
          riskThreshold: 70
        }
      });
      
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Settings reset to defaults',
        severity: 'info'
      });
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Notifications Settings */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
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
              title="Notification Preferences"
              avatar={<NotificationsIcon color="primary" />}
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiCardHeader-title': {
                  fontWeight: 600,
                }
              }}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={handleNotificationChange}
                    name="email"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.push}
                    onChange={handleNotificationChange}
                    name="push"
                    color="primary"
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.sms}
                    onChange={handleNotificationChange}
                    name="sms"
                    color="primary"
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.highRiskOnly}
                    onChange={handleNotificationChange}
                    name="highRiskOnly"
                    color="primary"
                  />
                }
                label="High Risk Alerts Only"
              />
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="frequency-label">Alert Frequency</InputLabel>
                  <Select
                    labelId="frequency-label"
                    id="frequency"
                    value={settings.notifications.frequency}
                    onChange={handleFrequencyChange}
                    label="Alert Frequency"
                  >
                    <MenuItem value="immediate">Immediate</MenuItem>
                    <MenuItem value="hourly">Hourly Digest</MenuItem>
                    <MenuItem value="daily">Daily Digest</MenuItem>
                    <MenuItem value="weekly">Weekly Digest</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <NotificationsActiveIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Receive timely alerts about suspicious blockchain activities and potential fraud attempts.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Security Settings */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
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
              title="Security Settings"
              avatar={<SecurityIcon color="primary" />}
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiCardHeader-title': {
                  fontWeight: 600,
                }
              }}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={handleSecurityChange}
                    name="twoFactorAuth"
                    color="primary"
                  />
                }
                label="Two-Factor Authentication"
              />
              
              <Box sx={{ mt: 2 }}>
                <Typography id="session-timeout-slider" gutterBottom>
                  Session Timeout (minutes): {settings.security.sessionTimeout}
                </Typography>
                <Slider
                  value={settings.security.sessionTimeout}
                  onChange={handleSessionTimeoutChange}
                  aria-labelledby="session-timeout-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={5}
                  max={60}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="IP Whitelist (comma separated)"
                  variant="outlined"
                  size="small"
                  value={settings.security.ipWhitelist}
                  onChange={handleIpWhitelistChange}
                  placeholder="e.g., 192.168.1.1, 10.0.0.1"
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  API Key
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={settings.security.apiKeyVisible ? settings.security.apiKey : '••••••••••••••••••••••••••••••'}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <IconButton onClick={toggleApiKeyVisibility} sx={{ ml: 1 }}>
                    {settings.security.apiKeyVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Enhanced security settings help protect your account and sensitive blockchain data.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Display Settings */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
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
              title="Display Preferences"
              avatar={<ColorLensIcon color="primary" />}
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiCardHeader-title': {
                  fontWeight: 600,
                }
              }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="language-label">Language</InputLabel>
                  <Select
                    labelId="language-label"
                    id="language"
                    name="language"
                    value={settings.display.language}
                    onChange={handleDisplayChange}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="currency-label">Currency</InputLabel>
                  <Select
                    labelId="currency-label"
                    id="currency"
                    name="currency"
                    value={settings.display.currency}
                    onChange={handleDisplayChange}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="JPY">JPY (¥)</MenuItem>
                    <MenuItem value="BTC">BTC (₿)</MenuItem>
                    <MenuItem value="ETH">ETH (Ξ)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="theme-label">Theme Preference</InputLabel>
                  <Select
                    labelId="theme-label"
                    id="theme"
                    name="theme"
                    value={settings.display.theme}
                    onChange={handleDisplayChange}
                    label="Theme Preference"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography id="risk-threshold-slider" gutterBottom>
                  Risk Alert Threshold: {settings.display.riskThreshold}%
                </Typography>
                <Slider
                  value={settings.display.riskThreshold}
                  onChange={handleRiskThresholdChange}
                  aria-labelledby="risk-threshold-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <LanguageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Customize your BlockGuardian experience with these display preferences.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleResetSettings}
          disabled={loading}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
