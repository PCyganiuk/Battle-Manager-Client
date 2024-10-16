import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Components/App/App.tsx'
import './index.css'
import { createTheme, ThemeProvider } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: "#4B0082",
    },
    secondary: {
      main: "#82ffff"
    }
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 20px',
          backdropFilter: 'blur(10px)',                 // Blurry background
          borderRadius: '25px',                         // Rounder corners for button
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',   // Subtle shadow
          textTransform: 'none',                        // Disable uppercase text
          fontSize: '16px',                             // Adjust font size
          '&:hover': {
            backgroundColor: 'rgba(130, 255, 255, 0.3)', // Darken slightly on hover
            backdropFilter: 'blur(5px)',                // Increase blur on hover
          },
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
    <App />
    </ThemeProvider>
  </StrictMode>,
)
