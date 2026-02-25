import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  Container,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Person,
  AccountBalance,
  CheckCircle,
  Error as ErrorIcon,
  MailOutline,
  PhoneIphone,
  HomeOutlined,
  LockOutlined,
  HowToRegOutlined,
  SavingsOutlined,
  BusinessCenterOutlined,
  CompareArrowsOutlined,
  VerifiedUserOutlined,
  SupportAgentOutlined,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../constants/api';
import bankingHero from '../assets/banking-hero.svg';

const API_BASE_URL = `${API_URL}/api`;

const accountTypes = [
  { value: 'SAVINGS', label: 'Savings Account', description: 'For personal savings with interest' },
  { value: 'CHECKING', label: 'Checking Account', description: 'For daily transactions' },
  { value: 'BUSINESS', label: 'Business Account', description: 'For business operations' },
];

const accountTypeIcon = (value) => {
  if (value === 'SAVINGS') {
    return <SavingsOutlined color="primary" fontSize="small" />;
  }

  if (value === 'CHECKING') {
    return <CompareArrowsOutlined color="primary" fontSize="small" />;
  }

  return <BusinessCenterOutlined color="primary" fontSize="small" />;
};

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    accountType: 'SAVINGS',
    pin: '',
    confirmPin: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    }

    if (!formData.confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const requestData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        accountType: formData.accountType,
        pin: formData.pin,
      };

      const response = await axios.post(`${API_BASE_URL}/accounts/register-and-create`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess(response.data);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        accountType: 'SAVINGS',
        pin: '',
        confirmPin: '',
      });

      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      accountType: 'SAVINGS',
      pin: '',
      confirmPin: '',
    });
    setSuccess(null);
    setError('');
    setErrors({});
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(10, 42, 82, 0.14)',
          boxShadow: '0 18px 40px rgba(12, 38, 65, 0.12)',
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            color: '#fff',
            background: 'linear-gradient(140deg, #06203E 0%, #0F4C81 48%, #168AAD 100%)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box display="flex" alignItems="center" gap={1.2} mb={1.2}>
                <AccountBalance sx={{ fontSize: 34 }} />
                <Typography variant="h4" fontWeight={700}>
                  SecureBank
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Open your account in minutes
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.92, mb: 2.2, maxWidth: 620 }}>
                Create a secure account for personal or business banking, then start using digital services instantly.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <VerifiedUserOutlined fontSize="small" />
                  <Typography variant="body2">Strong security</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <SupportAgentOutlined fontSize="small" />
                  <Typography variant="body2">24x7 support</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src={bankingHero}
                alt="SecureBank account opening"
                sx={{
                  width: '100%',
                  maxHeight: 220,
                  objectFit: 'contain',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.22)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  p: 1,
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 }, backgroundColor: '#f9fcff' }}>
          {success && (
            <Card sx={{ mb: 3, border: '1px solid #81c784', boxShadow: '0 10px 26px rgba(29, 108, 52, 0.16)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.main" fontWeight={700}>
                    Account Created Successfully
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Customer Information
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {success.customer.firstName} {success.customer.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customer ID: {success.customer.customerId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {success.customer.email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Information
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      Account Number: {success.account.accountNumber}
                    </Typography>
                    <Chip label={success.account.accountType} color="primary" size="small" sx={{ mt: 1 }} />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Initial Balance: INR {success.account.balance}
                    </Typography>
                  </Grid>
                </Grid>

                <Box mt={2.5} display="flex" gap={1.5} flexWrap="wrap">
                  <Button variant="contained" onClick={() => navigate('/')}>
                    Login to Your Account
                  </Button>
                  <Button variant="outlined" onClick={handleReset}>
                    Create Another Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {!success && (
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid rgba(12, 38, 65, 0.14)' }}>
              <Typography variant="h5" mb={1.1} display="flex" alignItems="center" fontWeight={700}>
                <HowToRegOutlined sx={{ mr: 1 }} />
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2.5}>
                Enter your details to open a new SecureBank account.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2.4}>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" />
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 1.8 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutline fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.phone}
                      helperText={errors.phone}
                      placeholder="+91 9876543210"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIphone fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                      required
                      error={!!errors.address}
                      helperText={errors.address}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeOutlined fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="h6"
                      color="primary"
                      gutterBottom
                      sx={{ mt: 1 }}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <AccountBalance fontSize="small" />
                      Account Setup
                    </Typography>
                    <Divider sx={{ mb: 1.8 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Account Type</InputLabel>
                      <Select
                        name="accountType"
                        value={formData.accountType}
                        label="Account Type"
                        onChange={handleChange}
                        disabled={loading}
                      >
                        {accountTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box display="flex" alignItems="flex-start" gap={1.2}>
                              {accountTypeIcon(type.value)}
                              <Box>
                                <Typography variant="body1">{type.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {type.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Create PIN"
                      name="pin"
                      type="password"
                      value={formData.pin}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.pin}
                      helperText={errors.pin}
                      inputProps={{ maxLength: 4, pattern: '[0-9]{4}' }}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm PIN"
                      name="confirmPin"
                      type="password"
                      value={formData.confirmPin}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.confirmPin}
                      helperText={errors.confirmPin}
                      inputProps={{ maxLength: 4, pattern: '[0-9]{4}' }}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error" icon={<ErrorIcon />} onClose={() => setError('')}>
                        {error}
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box display="flex" gap={1.5} mt={0.8} flexWrap="wrap">
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                          minWidth: 210,
                          fontWeight: 700,
                          background: 'linear-gradient(90deg, #0A2A52 0%, #145DA0 100%)',
                        }}
                      >
                        {loading ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>

                      <Button type="button" variant="outlined" size="large" onClick={handleReset} disabled={loading}>
                        Reset Form
                      </Button>

                      <Button component={Link} to="/" size="large" disabled={loading}>
                        Back to Login
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAccount;