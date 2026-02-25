import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateAccount from './components/CreateAccount';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

function App() {
  const [account, setAccount] = useState(null);

  return (
    <Router>
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(90deg, #06203E 0%, #0F4C81 60%, #168AAD 100%)',
          boxShadow: '0 8px 24px rgba(6, 32, 62, 0.25)',
        }}
      >
        <Toolbar>
          <Box
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}
          >
            <AccountBalance />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              SecureBank
            </Typography>
          </Box>
          <Box>
            <Button color="inherit" component={Link} to="/">Login</Button>
            <Button color="inherit" component={Link} to="/create">Create Account</Button>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: { xs: 1.5, md: 2.5 },
          minHeight: 'calc(100vh - 64px)',
          background:
            'radial-gradient(circle at 15% 20%, rgba(22, 138, 173, 0.12) 0%, rgba(22, 138, 173, 0) 40%), radial-gradient(circle at 90% 10%, rgba(10, 42, 82, 0.12) 0%, rgba(10, 42, 82, 0) 36%), #f3f8ff',
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              account ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  onLogin={(acct) => {
                    setAccount(acct);
                  }}
                />
              )
            }
          />

          <Route path="/create" element={<CreateAccount />} />

          <Route
            path="/dashboard"
            element={
              account ? (
                <Dashboard account={account} onLogout={() => setAccount(null)} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
