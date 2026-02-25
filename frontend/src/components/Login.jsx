import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  LockOutlined,
  CreditCardOutlined,
  VerifiedUserOutlined,
  SpeedOutlined,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../constants/api';
import bankingHero from '../assets/banking-hero.svg';

const Login = ({ onLogin }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/accounts/authenticate`, {
        accountNumber,
        pin,
      });

      if (response.data.authenticated) {
        onLogin(response.data.account);
        navigate('/dashboard');
        setError('');
      } else {
        setError('Invalid account number or PIN');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(10, 42, 82, 0.12)',
          boxShadow: '0 18px 40px rgba(12, 38, 65, 0.12)',
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            color: '#fff',
            background: 'linear-gradient(145deg, #0A2A52 0%, #145DA0 46%, #168AAD 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1.2} mb={1.5}>
              <AccountBalance sx={{ fontSize: 34 }} />
              <Typography variant="h5" fontWeight={700}>
                SecureBank
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.15 }}>
              Banking that feels modern and safe.
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, opacity: 0.9, maxWidth: 460 }}>
              Manage your account with secure access, fast transactions, and trusted support.
            </Typography>
          </Box>

          <Box
            component="img"
            src={bankingHero}
            alt="Modern banking illustration"
            sx={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.22)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              p: 1,
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Box display="flex" alignItems="center" gap={1}>
              <VerifiedUserOutlined fontSize="small" />
              <Typography variant="body2">Bank-grade security</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <SpeedOutlined fontSize="small" />
              <Typography variant="body2">Fast account access</Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 }, backgroundColor: '#f9fcff' }}>
          <Typography variant="h5" component="h2" fontWeight={700}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
            Sign in to continue to your dashboard.
          </Typography>
          <Divider sx={{ my: 2.2 }} />

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              fullWidth
              margin="normal"
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="PIN"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              fullWidth
              margin="normal"
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.3,
                fontWeight: 700,
                background: 'linear-gradient(90deg, #0A2A52 0%, #145DA0 100%)',
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Button component={Link} to="/create" fullWidth sx={{ mt: 1.6 }}>
              Create an account
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;