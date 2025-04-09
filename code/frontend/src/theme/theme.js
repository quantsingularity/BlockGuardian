import { createTheme } from '@mui/material/styles';

// Create theme function that accepts mode (light/dark)
export const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4361ee',
        light: '#6f86ff',
        dark: '#3a0ca3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#7209b7',
        light: '#9d4edd',
        dark: '#560bad',
        contrastText: '#ffffff',
      },
      error: {
        main: '#ef476f',
        light: '#ff7a9c',
        dark: '#d64161',
      },
      warning: {
        main: '#ffd166',
        light: '#ffe08e',
        dark: '#e6b800',
      },
      success: {
        main: '#06d6a0',
        light: '#2df6c5',
        dark: '#05a882',
      },
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#212529' : '#e9ecef',
        secondary: mode === 'light' ? '#6c757d' : '#adb5bd',
      },
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.2,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.2,
        letterSpacing: '0em',
      },
      h4: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.2,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.2,
        letterSpacing: '0em',
      },
      h6: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.2,
        letterSpacing: '0.0075em',
      },
      subtitle1: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0.00714em',
      },
      body1: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.5,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0.01071em',
      },
      button: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
        textTransform: 'none',
      },
      caption: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.5,
        letterSpacing: '0.03333em',
      },
      overline: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 2.66,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.1)',
      '0px 8px 16px rgba(0, 0, 0, 0.1)',
      '0px 16px 24px rgba(0, 0, 0, 0.1)',
      '0px 24px 32px rgba(0, 0, 0, 0.1)',
      '0px 32px 40px rgba(0, 0, 0, 0.1)',
      '0px 40px 48px rgba(0, 0, 0, 0.1)',
      '0px 48px 56px rgba(0, 0, 0, 0.1)',
      '0px 56px 64px rgba(0, 0, 0, 0.1)',
      '0px 64px 72px rgba(0, 0, 0, 0.1)',
      '0px 72px 80px rgba(0, 0, 0, 0.1)',
      '0px 80px 88px rgba(0, 0, 0, 0.1)',
      '0px 88px 96px rgba(0, 0, 0, 0.1)',
      '0px 96px 104px rgba(0, 0, 0, 0.1)',
      '0px 104px 112px rgba(0, 0, 0, 0.1)',
      '0px 112px 120px rgba(0, 0, 0, 0.1)',
      '0px 120px 128px rgba(0, 0, 0, 0.1)',
      '0px 128px 136px rgba(0, 0, 0, 0.1)',
      '0px 136px 144px rgba(0, 0, 0, 0.1)',
      '0px 144px 152px rgba(0, 0, 0, 0.1)',
      '0px 152px 160px rgba(0, 0, 0, 0.1)',
      '0px 160px 168px rgba(0, 0, 0, 0.1)',
      '0px 168px 176px rgba(0, 0, 0, 0.1)',
      '0px 176px 184px rgba(0, 0, 0, 0.1)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '10px 20px',
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s ease',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3a0ca3 0%, #4361ee 100%)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #7209b7 0%, #560bad 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #560bad 0%, #7209b7 100%)',
            },
          },
          outlinedPrimary: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
          outlinedSecondary: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '20px',
          },
          title: {
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px',
            '&:last-child': {
              paddingBottom: '20px',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          colorPrimary: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
          },
          colorSecondary: {
            background: 'linear-gradient(135deg, #7209b7 0%, #560bad 100%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
          },
          elevation1: {
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
          },
          elevation2: {
            boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
          },
          elevation3: {
            boxShadow: '0 15px 30px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundImage: 'none',
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'rgba(30, 30, 30, 0.8)',
            borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
          },
          colorPrimary: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
          },
          colorSecondary: {
            background: 'linear-gradient(135deg, #7209b7 0%, #560bad 100%)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? 'rgba(67, 97, 238, 0.1)' : 'rgba(67, 97, 238, 0.2)',
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.3)',
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: '40px',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
          },
          colorDefault: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
            margin: 8,
          },
          switchBase: {
            padding: 1,
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#4361ee',
                opacity: 1,
                border: 'none',
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#4361ee',
              border: '6px solid #fff',
            },
          },
          thumb: {
            width: 24,
            height: 24,
          },
          track: {
            borderRadius: 26 / 2,
            backgroundColor: mode === 'light' ? '#E9E9EA' : '#39393D',
            opacity: 1,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(67, 97, 238, 0.2)',
              },
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            color: mode === 'light' ? '#fff' : '#000',
            fontSize: '0.75rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
            padding: '8px 12px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 600,
            fontSize: '0.65rem',
            padding: '0 4px',
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
          },
        },
      },
    },
  });
};
