import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  VerifiedUser as VerifiedUserIcon,
  AddAPhoto as AddAPhotoIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  Language as LanguageIcon
} from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

export default function Profile() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    company: 'Blockchain Innovations Inc.',
    bio: 'Blockchain security expert with 5+ years of experience in fraud detection and prevention. Passionate about creating secure and transparent blockchain ecosystems.',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    joinDate: '2023-06-15',
    verificationStatus: 'verified',
    profileImage: null,
    languages: ['English', 'Spanish'],
    skills: ['Blockchain Security', 'Smart Contract Auditing', 'Fraud Detection', 'Risk Analysis', 'Cryptocurrency']
  });

  const [editedProfile, setEditedProfile] = useState({...profile});

  // Activity history data
  const activityHistory = [
    { id: 1, type: 'login', description: 'Logged in from new device', timestamp: '2025-04-08T14:32:00Z' },
    { id: 2, type: 'alert', description: 'Created new alert for high-risk transactions', timestamp: '2025-04-07T09:15:00Z' },
    { id: 3, type: 'report', description: 'Generated risk report for address 0x123...', timestamp: '2025-04-05T16:45:00Z' },
    { id: 4, type: 'settings', description: 'Updated notification preferences', timestamp: '2025-04-03T11:20:00Z' },
    { id: 5, type: 'login', description: 'Logged in from San Francisco, CA', timestamp: '2025-04-01T08:05:00Z' }
  ];

  // Simulating loading profile from backend
  useEffect(() => {
    setLoading(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit mode, revert changes
      setEditedProfile({...profile});
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };

  const handleSaveProfile = () => {
    setLoading(true);
    
    // Simulate API call to save profile
    setTimeout(() => {
      setProfile({...editedProfile});
      setEditMode(false);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading && !editMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={3}
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
            <CardContent sx={{ textAlign: 'center', pt: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    profile.verificationStatus === 'verified' ? (
                      <Chip
                        icon={<VerifiedUserIcon />}
                        label="Verified"
                        size="small"
                        color="primary"
                        sx={{ 
                          borderRadius: '16px',
                          backgroundColor: theme.palette.success.main,
                          '& .MuiChip-icon': { color: 'white' },
                          '& .MuiChip-label': { color: 'white' }
                        }}
                      />
                    ) : null
                  }
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '3rem',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {profile.name.charAt(0)}
                  </Avatar>
                </Badge>
                {editMode && (
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <AddAPhotoIcon />
                  </IconButton>
                )}
              </Box>
              
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                {profile.name}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Chip 
                  icon={<WorkIcon />} 
                  label={profile.company} 
                  variant="outlined" 
                  size="small" 
                  sx={{ borderRadius: '16px' }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                {profile.skills.slice(0, 3).map((skill, index) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    size="small" 
                    sx={{ 
                      borderRadius: '16px',
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText
                    }} 
                  />
                ))}
                {profile.skills.length > 3 && (
                  <Chip 
                    label={`+${profile.skills.length - 3}`} 
                    size="small" 
                    sx={{ 
                      borderRadius: '16px',
                      backgroundColor: theme.palette.grey[300],
                      color: theme.palette.text.primary
                    }} 
                  />
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={profile.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={profile.phone} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={profile.location} />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Wallet Address
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {profile.walletAddress}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body2">
                  {formatDate(profile.joinDate)}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Languages
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {profile.languages.map((language, index) => (
                    <Chip 
                      key={index} 
                      icon={<LanguageIcon />}
                      label={language} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderRadius: '16px' }} 
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Profile Details Tabs */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={3}
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="profile tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab 
                  icon={<AccountCircleIcon />} 
                  label="Personal Info" 
                  id="profile-tab-0" 
                  aria-controls="profile-tabpanel-0" 
                />
                <Tab 
                  icon={<SecurityIcon />} 
                  label="Security" 
                  id="profile-tab-1" 
                  aria-controls="profile-tabpanel-1" 
                />
                <Tab 
                  icon={<HistoryIcon />} 
                  label="Activity" 
                  id="profile-tab-2" 
                  aria-controls="profile-tabpanel-2" 
                />
                <Tab 
                  icon={<NotificationsIcon />} 
                  label="Notifications" 
                  id="profile-tab-3" 
                  aria-controls="profile-tabpanel-3" 
                />
              </Tabs>
            </Box>
            
            {/* Personal Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                {editMode ? (
                  <>
                    <Button 
                      variant="outlined" 
                      startIcon={<CancelIcon />} 
                      onClick={handleEditToggle}
                      sx={{ mr: 1 }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<SaveIcon />} 
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />} 
                    onClick={handleEditToggle}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={editMode ? editedProfile.name : profile.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editMode ? editedProfile.email : profile.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={editMode ? editedProfile.phone : profile.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={editMode ? editedProfile.location : profile.location}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={editMode ? editedProfile.company : profile.company}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={editMode ? editedProfile.bio : profile.bio}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Wallet Address"
                    name="walletAddress"
                    value={editMode ? editedProfile.walletAddress : profile.walletAddress}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Security Tab */}
            <TabPanel value={tabValue} index={1}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Enhance your account security by enabling two-factor authentication and regularly updating your password.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Password" 
                      action={
                        <Button variant="outlined" size="small">
                          Change Password
                        </Button>
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Last changed: 30 days ago
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Two-Factor Authentication" 
                      action={
                        <Button variant="outlined" size="small" color="primary">
                          Enable
                        </Button>
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account by requiring a verification code in addition to your password.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Login Sessions" 
                      action={
                        <Button variant="outlined" size="small" color="error">
                          Sign Out All
                        </Button>
                      }
                    />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Current Session" 
                            secondary="San Francisco, CA - Chrome on macOS - April 9, 2025" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mobile App" 
                            secondary="San Francisco, CA - iOS App - April 8, 2025" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Activity Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              <List>
                {activityHistory.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        {activity.type === 'login' && <SecurityIcon color="primary" />}
                        {activity.type === 'alert' && <NotificationsIcon color="error" />}
                        {activity.type === 'report' && <HistoryIcon color="info" />}
                        {activity.type === 'settings' && <SettingsIcon color="action" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={formatTimestamp(activity.timestamp)}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="outlined">
                  View Full History
                </Button>
              </Box>
            </TabPanel>
            
            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Manage how you receive notifications about blockchain security events, alerts, and account activity.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title="Email Notifications" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Security Alerts" 
                            secondary="Receive notifications about suspicious activities and security threats" 
                          />
                          <Button variant="outlined" size="small">
                            Enabled
                          </Button>
                        </ListItem>
                        <Divider component="li" />
                        <ListItem>
                          <ListItemText 
                            primary="Transaction Reports" 
                            secondary="Receive weekly summaries of transaction activities" 
                          />
                          <Button variant="outlined" size="small">
                            Enabled
                          </Button>
                        </ListItem>
                        <Divider component="li" />
                        <ListItem>
                          <ListItemText 
                            primary="Product Updates" 
                            secondary="Receive information about new features and improvements" 
                          />
                          <Button variant="outlined" size="small" color="error">
                            Disabled
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title="Push Notifications" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="High-Risk Alerts" 
                            secondary="Receive immediate notifications for high-risk transactions" 
                          />
                          <Button variant="outlined" size="small">
                            Enabled
                          </Button>
                        </ListItem>
                        <Divider component="li" />
                        <ListItem>
                          <ListItemText 
                            primary="Account Activity" 
                            secondary="Receive notifications about login attempts and account changes" 
                          />
                          <Button variant="outlined" size="small">
                            Enabled
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
      
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
