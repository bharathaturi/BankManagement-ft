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
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
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
  { value: 'CHECKING', label: 'Current Account', description: 'For daily transactions' },
  { value: 'BUSINESS', label: 'Salary Account', description: 'Zero balance corporate salary account' },
];

const accountTypeIcon = (value) => {
  if (value === 'SAVINGS') return <SavingsOutlined color="primary" fontSize="small" />;
  if (value === 'CHECKING') return <CompareArrowsOutlined color="primary" fontSize="small" />;
  return <BusinessCenterOutlined color="primary" fontSize="small" />;
};

const steps = [
  'Personal Details',
  'Contact Info',
  'Identity Proof (KYC)',
  'Account Details',
  'Security Details',
  'Declaration',
];

const CreateAccount = () => {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '', lastName: '', dateOfBirth: '', gender: '', nationality: 'Indian',
    parentName: '', maritalStatus: '', occupation: '', annualIncome: '',

    // Step 2: Contact
    phone: '', email: '', address: '', city: '', state: '', pinCode: '',

    // Step 3: KYC
    aadhaarNumber: '', panNumber: '', passportNumber: '', voterId: '',

    // Step 4: Account
    accountType: 'SAVINGS', branchName: '', initialDeposit: '', nomineeName: '', nomineeRelationship: '',

    // Step 5: Security
    username: '', password: '', confirmPassword: '', pin: '', confirmPin: '', securityQuestion: '', securityAnswer: '',

    // Step 6: Declaration
    acceptedTerms: false, fatcaDeclaration: false, digitalSignatureConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    const d = formData;

    if (activeStep === 0) {
      if (!d.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!d.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!d.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!d.gender) newErrors.gender = 'Gender is required';
      if (!d.nationality) newErrors.nationality = 'Nationality is required';
      if (!d.parentName.trim()) newErrors.parentName = "Parent's Name is required";
      if (!d.maritalStatus) newErrors.maritalStatus = 'Marital Status is required';
      if (!d.occupation) newErrors.occupation = 'Occupation is required';
      if (!d.annualIncome) newErrors.annualIncome = 'Annual Income is required';
    } else if (activeStep === 1) {
      if (!d.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[+]?[0-9]{10,15}$/.test(d.phone.replace(/[\s\-\(\)]/g, ''))) newErrors.phone = 'Invalid phone number';
      if (!d.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(d.email)) newErrors.email = 'Invalid email format';
      if (!d.address.trim()) newErrors.address = 'Residential address is required';
      if (!d.city.trim()) newErrors.city = 'City is required';
      if (!d.state.trim()) newErrors.state = 'State is required';
      if (!d.pinCode.trim()) newErrors.pinCode = 'PIN Code is required';
    } else if (activeStep === 2) {
      if (!d.aadhaarNumber.trim()) newErrors.aadhaarNumber = 'Aadhaar Number is required for KYC';
      if (!d.panNumber.trim()) newErrors.panNumber = 'PAN Number is required for KYC';
    } else if (activeStep === 3) {
      if (!d.branchName.trim()) newErrors.branchName = 'Branch selection is required';
      if (!d.initialDeposit) newErrors.initialDeposit = 'Initial deposit amount is required';
      if (!d.nomineeName.trim()) newErrors.nomineeName = 'Nominee Name is required';
      if (!d.nomineeRelationship.trim()) newErrors.nomineeRelationship = 'Nominee Relationship is required';
    } else if (activeStep === 4) {
      if (!d.username.trim()) newErrors.username = 'Username is required';
      if (!d.password) newErrors.password = 'Password is required';
      if (d.password !== d.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!d.pin) newErrors.pin = 'Transaction PIN is required';
      else if (!/^\d{4}$/.test(d.pin)) newErrors.pin = 'PIN must be exactly 4 digits';
      if (d.pin !== d.confirmPin) newErrors.confirmPin = 'PINs do not match';
      if (!d.securityQuestion) newErrors.securityQuestion = 'Security Question is required';
      if (!d.securityAnswer.trim()) newErrors.securityAnswer = 'Security Answer is required';
    } else if (activeStep === 5) {
      if (!d.acceptedTerms) newErrors.acceptedTerms = 'You must accept the Terms & Conditions';
      if (!d.fatcaDeclaration) newErrors.fatcaDeclaration = 'FATCA Declaration is required';
      if (!d.digitalSignatureConsent) newErrors.digitalSignatureConsent = 'Digital Signature consent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        initialDeposit: Number(formData.initialDeposit) || 0
      };

      const response = await axios.post(`${API_BASE_URL}/accounts/register-and-create`, payload);
      setSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSuccess(null);
    setFormData({
      firstName: '', lastName: '', dateOfBirth: '', gender: '', nationality: 'Indian', parentName: '', maritalStatus: '', occupation: '', annualIncome: '',
      phone: '', email: '', address: '', city: '', state: '', pinCode: '',
      aadhaarNumber: '', panNumber: '', passportNumber: '', voterId: '',
      accountType: 'SAVINGS', branchName: '', initialDeposit: '', nomineeName: '', nomineeRelationship: '',
      username: '', password: '', confirmPassword: '', pin: '', confirmPin: '', securityQuestion: '', securityAnswer: '',
      acceptedTerms: false, fatcaDeclaration: false, digitalSignatureConsent: false,
    });
  };

  // Render specific step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="First Name" name="firstName" fullWidth required value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Last Name (as per ID)" name="lastName" fullWidth required value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date of Birth" name="dateOfBirth" type="date" InputLabelProps={{ shrink: true }} fullWidth required value={formData.dateOfBirth} onChange={handleChange} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} label="Gender" onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Nationality" name="nationality" fullWidth required value={formData.nationality} onChange={handleChange} error={!!errors.nationality} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Father's / Mother's Name" name="parentName" fullWidth required value={formData.parentName} onChange={handleChange} error={!!errors.parentName} helperText={errors.parentName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.maritalStatus}>
                <InputLabel>Marital Status</InputLabel>
                <Select name="maritalStatus" value={formData.maritalStatus} label="Marital Status" onChange={handleChange}>
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Occupation" name="occupation" fullWidth required value={formData.occupation} onChange={handleChange} error={!!errors.occupation} helperText={errors.occupation} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.annualIncome}>
                <InputLabel>Annual Income Range</InputLabel>
                <Select name="annualIncome" value={formData.annualIncome} label="Annual Income Range" onChange={handleChange}>
                  <MenuItem value="Under 2.5 LPA">Under ₹2.5 Lakhs</MenuItem>
                  <MenuItem value="2.5 - 5 LPA">₹2.5 - 5 Lakhs</MenuItem>
                  <MenuItem value="5 - 10 LPA">₹5 - 10 Lakhs</MenuItem>
                  <MenuItem value="Above 10 LPA">Above ₹10 Lakhs</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Mobile Number" name="phone" fullWidth required value={formData.phone} onChange={handleChange} error={!!errors.phone} helperText={errors.phone || "OTP verification will be required"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email Address" type="email" name="email" fullWidth required value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Residential Address" name="address" fullWidth required multiline rows={2} value={formData.address} onChange={handleChange} error={!!errors.address} helperText={errors.address} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="City" name="city" fullWidth required value={formData.city} onChange={handleChange} error={!!errors.city} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="State" name="state" fullWidth required value={formData.state} onChange={handleChange} error={!!errors.state} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="PIN Code" name="pinCode" fullWidth required value={formData.pinCode} onChange={handleChange} error={!!errors.pinCode} />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Under Know Your Customer (KYC) rules, banks must verify identity. Aadhaar and PAN are mandatory.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Aadhaar Number (12 Digits)" name="aadhaarNumber" fullWidth required value={formData.aadhaarNumber} onChange={handleChange} error={!!errors.aadhaarNumber} helperText={errors.aadhaarNumber} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="PAN Number" name="panNumber" fullWidth required value={formData.panNumber} onChange={handleChange} error={!!errors.panNumber} helperText={errors.panNumber} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Passport No. (Optional)" name="passportNumber" fullWidth value={formData.passportNumber} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Voter ID (Optional)" name="voterId" fullWidth value={formData.voterId} onChange={handleChange} />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select name="accountType" value={formData.accountType} label="Account Type" onChange={handleChange}>
                  {accountTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Branch Selection" name="branchName" fullWidth required value={formData.branchName} onChange={handleChange} error={!!errors.branchName} helperText={errors.branchName || "e.g., Main Head Office Mumbai"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Initial Deposit Amount (₹)" name="initialDeposit" type="number" fullWidth required value={formData.initialDeposit} onChange={handleChange} error={!!errors.initialDeposit} helperText={errors.initialDeposit} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Nominee Name" name="nomineeName" fullWidth required value={formData.nomineeName} onChange={handleChange} error={!!errors.nomineeName} helperText={errors.nomineeName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Nominee Relationship" name="nomineeRelationship" fullWidth required value={formData.nomineeRelationship} onChange={handleChange} error={!!errors.nomineeRelationship} helperText={errors.nomineeRelationship || "e.g., Spouse, Son, Mother"} />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Internet Banking Username" name="username" fullWidth required value={formData.username} onChange={handleChange} error={!!errors.username} helperText={errors.username} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Internet Banking Password" name="password" type="password" fullWidth required value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Confirm Password" name="confirmPassword" type="password" fullWidth required value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Transaction PIN (4 digits)" name="pin" type="password" fullWidth required value={formData.pin} onChange={handleChange} error={!!errors.pin} helperText={errors.pin} inputProps={{ maxLength: 4 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Confirm PIN" name="confirmPin" type="password" fullWidth required value={formData.confirmPin} onChange={handleChange} error={!!errors.confirmPin} helperText={errors.confirmPin} inputProps={{ maxLength: 4 }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.securityQuestion}>
                <InputLabel>Security Question</InputLabel>
                <Select name="securityQuestion" value={formData.securityQuestion} label="Security Question" onChange={handleChange}>
                  <MenuItem value="pet">What is the name of your first pet?</MenuItem>
                  <MenuItem value="school">What was the name of your first school?</MenuItem>
                  <MenuItem value="city">In what city were you born?</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Security Answer" name="securityAnswer" fullWidth required value={formData.securityAnswer} onChange={handleChange} error={!!errors.securityAnswer} helperText={errors.securityAnswer} />
            </Grid>
          </Grid>
        );
      case 5:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox required name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange} />}
                label="I accept the Bank's Terms & Conditions and Privacy Policy."
              />
              {errors.acceptedTerms && <Typography color="error" variant="caption" display="block">{errors.acceptedTerms}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox required name="fatcaDeclaration" checked={formData.fatcaDeclaration} onChange={handleChange} />}
                label="FATCA Declaration: I confirm that I am a tax resident of India and not of any other country."
              />
              {errors.fatcaDeclaration && <Typography color="error" variant="caption" display="block">{errors.fatcaDeclaration}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox required name="digitalSignatureConsent" checked={formData.digitalSignatureConsent} onChange={handleChange} />}
                label="I consent to the digital signature and electronic verification of my documents."
              />
              {errors.digitalSignatureConsent && <Typography color="error" variant="caption" display="block">{errors.digitalSignatureConsent}</Typography>}
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(10, 42, 82, 0.14)', boxShadow: '0 18px 40px rgba(12, 38, 65, 0.12)' }}>

        {/* Banner Section */}
        <Box sx={{ p: { xs: 3, md: 4 }, color: '#fff', background: 'linear-gradient(140deg, #06203E 0%, #0F4C81 48%, #168AAD 100%)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box display="flex" alignItems="center" gap={1.2} mb={1.2}>
                <AccountBalance sx={{ fontSize: 34 }} />
                <Typography variant="h4" fontWeight={700}>SecureBank Onboarding</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Open your account in minutes</Typography>
              <Typography variant="body1" sx={{ opacity: 0.92, mb: 2.2, maxWidth: 620 }}>
                Complete the comprehensive 6-step KYC and setup digital services instantly.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 }, backgroundColor: '#f9fcff' }}>
          {success ? (
            <Card sx={{ mb: 3, border: '1px solid #81c784', boxShadow: '0 10px 26px rgba(29, 108, 52, 0.16)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.main" fontWeight={700}>
                    Account Setup Complete!
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Customer Information</Typography>
                    <Typography variant="body1" fontWeight={700}>{success.customer.firstName} {success.customer.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">CRN / Customer ID: {success.customer.customerId}</Typography>
                    <Typography variant="body2" color="text.secondary">KYC Status: Pending Verification</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Account Information</Typography>
                    <Typography variant="body1" fontWeight={700}>Account Number: {success.account.accountNumber}</Typography>
                    <Chip label={success.account.accountType} color="primary" size="small" sx={{ mt: 1 }} />
                    <Typography variant="body2" color="text.secondary" mt={1}>Initial Deposit: INR {success.account.balance}</Typography>
                  </Grid>
                </Grid>
                <Box mt={3.5} display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                  <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ minWidth: 200, fontWeight: 'bold' }}>
                    LOGIN
                  </Button>
                  <Button variant="outlined" size="large" onClick={handleReset} sx={{ minWidth: 200 }}>
                    Create Another Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5, overflowX: 'auto' }}>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>

              {error && (
                <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Box sx={{ minHeight: '300px' }}>
                {renderStepContent(activeStep)}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
                <Button color="inherit" disabled={activeStep === 0 || loading} onClick={handleBack} sx={{ mr: 1, borderColor: '#ccc' }} variant="outlined">
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />

                {activeStep === steps.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary" size="large" sx={{ px: 4, background: 'linear-gradient(90deg, #0A2A52 0%, #145DA0 100%)' }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit & Create Account'}
                  </Button>
                ) : (
                  <Button onClick={handleNext} variant="contained" color="primary" sx={{ px: 4 }}>
                    Next Step
                  </Button>
                )}
              </Box>

              <Box mt={4} textAlign="center">
                <Button component={Link} to="/" disabled={loading} color="inherit">
                  Cancel & Return to Login
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAccount;