import React from 'react';
import { Box, Typography, Container, Grid, Paper, Card, CardContent, CardHeader, Divider, useTheme, Button, Avatar, Chip, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';

// Styled components
const ReportCard = styled(Card)(({ theme }) => ({
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

const IconWrapper = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: theme.palette[color || 'primary'].main,
  width: 56,
  height: 56,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
}));

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  ...(selected && {
    background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
    color: '#fff',
    boxShadow: '0 4px 8px rgba(67, 97, 238, 0.2)',
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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

export default function RiskReports() {
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  // Mock data
  const reports = [
    { 
      id: 1, 
      title: 'Monthly Security Analysis', 
      date: 'April 5, 2025', 
      type: 'periodic',
      riskScore: 82,
      description: 'Comprehensive monthly analysis of all wallet activities and transaction patterns.',
      icon: <AssessmentIcon />,
      color: 'primary'
    },
    { 
      id: 2, 
      title: 'High-Risk Transaction Report', 
      date: 'April 3, 2025', 
      type: 'incident',
      riskScore: 68,
      description: 'Detailed analysis of recent high-risk transactions flagged by the system.',
      icon: <WarningIcon />,
      color: 'error'
    },
    { 
      id: 3, 
      title: 'Smart Contract Audit', 
      date: 'March 28, 2025', 
      type: 'audit',
      riskScore: 91,
      description: 'Security audit of smart contracts interacted with in the past month.',
      icon: <DescriptionIcon />,
      color: 'secondary'
    },
    { 
      id: 4, 
      title: 'Wallet Security Assessment', 
      date: 'March 15, 2025', 
      type: 'assessment',
      riskScore: 88,
      description: 'Comprehensive assessment of wallet security and transaction patterns.',
      icon: <SecurityIcon />,
      color: 'success'
    },
  ];

  const filteredReports = selectedFilter === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedFilter);

  const getRiskColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box className="slide-up">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Risk Reports
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and analyze detailed risk assessment reports for your blockchain activities
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '16px',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(30, 30, 30, 0.6) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              placeholder="Search reports..."
              variant="outlined"
              InputProps={{
                sx: { pr: 1 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 600 }}>
                Filter:
              </Typography>
              <FilterChip 
                label="All Reports" 
                onClick={() => setSelectedFilter('all')}
                selected={selectedFilter === 'all'}
              />
              <FilterChip 
                label="Periodic" 
                onClick={() => setSelectedFilter('periodic')}
                selected={selectedFilter === 'periodic'}
              />
              <FilterChip 
                label="Incidents" 
                onClick={() => setSelectedFilter('incident')}
                selected={selectedFilter === 'incident'}
              />
              <FilterChip 
                label="Audits" 
                onClick={() => setSelectedFilter('audit')}
                selected={selectedFilter === 'audit'}
              />
              <FilterChip 
                label="Assessments" 
                onClick={() => setSelectedFilter('assessment')}
                selected={selectedFilter === 'assessment'}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Grid */}
      <Grid container spacing={3}>
        {filteredReports.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <ReportCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconWrapper color={report.color}>
                    {report.icon}
                  </IconWrapper>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {report.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {report.date}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 3, minHeight: '40px' }}>
                  {report.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Risk Score
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        color: getRiskColor(report.riskScore)
                      }}
                    >
                      {report.riskScore}/100
                    </Typography>
                  </Box>
                  <Chip 
                    label={report.type.charAt(0).toUpperCase() + report.type.slice(1)} 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                    }}
                  />
                </Box>
                
                <GradientButton 
                  variant="contained" 
                  fullWidth
                >
                  View Full Report
                </GradientButton>
              </CardContent>
            </ReportCard>
          </Grid>
        ))}
      </Grid>

      {/* Generate Report Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mt: 4, 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.1) 0%, rgba(114, 9, 183, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(67, 97, 238, 0.2)'}`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Generate Custom Risk Report
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create a customized risk assessment report based on specific parameters and time periods
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <GradientButton 
              variant="contained" 
              size="large"
            >
              Create New Report
            </GradientButton>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
