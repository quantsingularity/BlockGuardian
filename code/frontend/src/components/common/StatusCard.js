import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

const StatusCard = ({ title, value, total, status, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" color={color || 'primary'}>
          {value}
          {total > 0 && <Typography variant="body2" component="span" color="text.secondary">
            /{total}
          </Typography>}
        </Typography>
        {status && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {status}
          </Typography>
        )}
        {total > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={percentage} color={color || "primary"} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.round(percentage)}%`}</Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
