import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import BaccaratGame from './components/BaccaratGame';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BaccaratGame />
    </ThemeProvider>
  );
}

export default App;
