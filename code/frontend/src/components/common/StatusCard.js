import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  useTheme,
  Chip
} from '@mui/material';

const StatusCard = ({ title, value, total, status, color = 'primary' }) => {
  const theme = useTheme();
  const percentage = total ? Math.round((value / total) * 100) : null;
  
  // Determine background gradient based on color
  let backgroundGradient;
  switch (color) {
    case 'error':
      backgroundGradient = 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)';
      break;
    case 'warning':
      backgroundGradient = 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)';
      break;
    case 'success':
      backgroundGradient = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)';
      break;
    default:
      backgroundGradient = 'linear-gradient(135deg, rgba(58, 54, 224, 0.1) 0%, rgba(58, 54, 224, 0.05) 100%)';
  }

  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
        },
        background: backgroundGradient,
        borderLeft: `4px solid ${theme.palette[color].main}`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette[color].main
            }}
          >
            {value.toLocaleString()}
          </Typography>
          
          {percentage !== null && (
            <Chip 
              label={`${percentage}%`}
              size="small"
              sx={{ 
                ml: 1,
                bgcolor: theme.palette[color].main,
                color: '#fff',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
        
        {percentage !== null && (
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              color={color}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: theme.palette.mode === 'dark' ? 
                  'rgba(255, 255, 255, 0.1)' : 
                  'rgba(0, 0, 0, 0.1)',
              }}
            />
          </Box>
        )}
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mt: 1,
            fontStyle: 'italic'
          }}
        >
          {status}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
