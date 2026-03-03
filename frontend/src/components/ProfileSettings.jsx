import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Avatar,
    Grid,
    TextField,
    Switch,
    FormControlLabel,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import {
    Person as PersonIcon,
    Close as CloseIcon,
    AccountBalance as AccountIcon,
    Security as SecurityIcon,
    CreditCard as CardIcon,
    Notifications as NotificationIcon,
    Link as LinkIcon,
    Description as DocumentIcon,
    SupportAgent as SupportIcon,
    ExitToApp as LogoutIcon,
    Visibility,
    VisibilityOff,
    ContentCopy
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../constants/api';

const API_BASE_URL = `${API_URL}/api`;

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
            style={{ width: '100%', height: '100%', overflowY: 'auto' }}
        >
            {value === index && (
                <Box sx={{ p: 4, height: '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const ProfileSettings = ({
    open,
    onClose,
    profileData,
    setProfileData,
    currentAccountNumber,
    setSnack,
    onLogout
}) => {
    const [tabValue, setTabValue] = useState(0);

    // Edit Profile State
    const [editProfileMode, setEditProfileMode] = useState(false);
    const [editEmail, setEditEmail] = useState(profileData?.customer?.email || '');
    const [editPhone, setEditPhone] = useState(profileData?.customer?.phone || '');
    const [editAddress, setEditAddress] = useState(profileData?.customer?.address || '');
    const [editDob, setEditDob] = useState(profileData?.customer?.dateOfBirth || '');
    const [editAadhaar, setEditAadhaar] = useState(profileData?.customer?.aadhaarNumber || '');
    const [editPan, setEditPan] = useState(profileData?.customer?.panNumber || '');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Security State
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [changingPin, setChangingPin] = useState(false);
    const [changePinSuccess, setChangePinSuccess] = useState('');
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [showPin, setShowPin] = useState(false);

    // Mock Settings States
    const [smsAlerts, setSmsAlerts] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(false);
    const [intlUsage, setIntlUsage] = useState(false);
    const [cardBlocked, setCardBlocked] = useState(false);

    // Card Limits State
    const [cardLimitDialog, setCardLimitDialog] = useState(false);
    const [newCardLimit, setNewCardLimit] = useState('');
    const [updatingLimit, setUpdatingLimit] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleUpdateProfile = async () => {
        if (!editEmail && !editPhone && !editAddress && !editDob && !editAadhaar && !editPan) {
            setSnack({ open: true, message: 'At least one profile field must be provided to update', severity: 'error' });
            return;
        }

        if (!profileData?.customer?.customerId) {
            setSnack({ open: true, message: 'Customer profile details not found for this account.', severity: 'error' });
            return;
        }

        setUpdatingProfile(true);
        try {
            const payload = {};
            if (editEmail) payload.email = editEmail;
            if (editPhone) payload.phone = editPhone;
            if (editAddress) payload.address = editAddress;
            if (editDob) payload.dateOfBirth = editDob;
            if (editAadhaar) payload.aadhaarNumber = editAadhaar;
            if (editPan) payload.panNumber = editPan;

            const res = await axios.put(`${API_BASE_URL}/accounts/customer/${profileData.customer.customerId}`, payload);

            if (res.data?.success || res.status === 200) {
                setSnack({ open: true, message: 'Profile updated successfully!', severity: 'success' });
                if (setProfileData) {
                    setProfileData(prev => ({ ...prev, customer: res.data.customer || payload }));
                }
                setEditProfileMode(false);
            }
        } catch (err) {
            setSnack({ open: true, message: 'Failed to update profile', severity: 'error' });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleUpdateCardLimit = async () => {
        if (!newCardLimit || isNaN(newCardLimit) || Number(newCardLimit) < 0) {
            setSnack({ open: true, message: 'Please enter a valid positive amount', severity: 'error' });
            return;
        }

        setUpdatingLimit(true);
        try {
            const res = await axios.put(`${API_BASE_URL}/accounts/${currentAccountNumber}/card-limit`, {
                dailyCardLimit: Number(newCardLimit)
            });

            if (res.data?.success || res.status === 200) {
                setSnack({ open: true, message: 'Card limit updated successfully!', severity: 'success' });
                if (setProfileData) {
                    setProfileData(prev => ({ ...prev, account: res.data.account || { ...prev.account, dailyCardLimit: newCardLimit } }));
                }
                setCardLimitDialog(false);
            }
        } catch (err) {
            setSnack({ open: true, message: 'Failed to update card limit', severity: 'error' });
        } finally {
            setUpdatingLimit(false);
        }
    };

    const handleChangePin = async () => {
        if (!oldPin || !newPin) return setSnack({ open: true, message: 'PINs are required', severity: 'error' });
        if (newPin !== confirmNewPin) return setSnack({ open: true, message: 'New PINs do not match', severity: 'error' });
        if (!/^[0-9]{4}$/.test(newPin)) return setSnack({ open: true, message: 'PIN must be exactly 4 digits', severity: 'error' });

        setChangingPin(true);
        setChangePinSuccess('');
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/change-pin`, {
                accountNumber: currentAccountNumber,
                oldPin,
                newPin,
            });
            if (res.data?.success) {
                setChangePinSuccess('PIN changed successfully');
                setSnack({ open: true, message: 'PIN changed successfully', severity: 'success' });
                setOldPin(''); setNewPin(''); setConfirmNewPin('');
            } else {
                setSnack({ open: true, message: res.data?.error || 'Change PIN failed', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.error || 'Change PIN failed', severity: 'error' });
        } finally {
            setChangingPin(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSnack({ open: true, message: 'Copied to clipboard', severity: 'info' });
    };

    // Ensure these are initialized when dialog opens
    React.useEffect(() => {
        if (open && profileData?.customer) {
            setEditEmail(profileData.customer.email || '');
            setEditPhone(profileData.customer.phone || '');
            setEditAddress(profileData.customer.address || '');
            setEditDob(profileData.customer.dateOfBirth || '');
            setEditAadhaar(profileData.customer.aadhaarNumber || '');
            setEditPan(profileData.customer.panNumber || '');
        }
    }, [open, profileData]);

    if (!profileData) {
        return (
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        );
    }

    const customer = profileData.customer || {};

    // --- Render Sections ---

    const renderPersonalInfo = () => (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="600">Personal Information</Typography>
                {!editProfileMode && (
                    <Button variant="outlined" startIcon={<PersonIcon />} onClick={() => setEditProfileMode(true)}>
                        Edit Profile
                    </Button>
                )}
            </Box>

            <Box display="flex" gap={3} alignItems="center" mb={5}>
                <Avatar sx={{ bgcolor: '#0F4C81', width: 80, height: 80, fontSize: '2rem' }}>
                    {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight="bold">{customer.firstName} {customer.lastName}</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Customer ID: {customer.customerId}
                        <IconButton size="small" onClick={() => copyToClipboard(customer.customerId)}>
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Typography>
                    <Chip label="KYC Verified" color="success" size="small" sx={{ mt: 1 }} />
                </Box>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Email Address</Typography>
                    {editProfileMode ? (
                        <TextField fullWidth size="small" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                    ) : (
                        <Typography variant="body1" fontWeight="500">{customer.email || 'Not provided'}</Typography>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Registered Mobile Number</Typography>
                    {editProfileMode ? (
                        <TextField fullWidth size="small" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                    ) : (
                        <Typography variant="body1" fontWeight="500">{customer.phone || 'Not provided'}</Typography>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Date of Birth</Typography>
                    {editProfileMode ? (
                        <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }} value={editDob} onChange={(e) => setEditDob(e.target.value)} />
                    ) : (
                        <Typography variant="body1" fontWeight="500">{customer.dateOfBirth || 'Not provided'}</Typography>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Opening Date</Typography>
                    <Typography variant="body1" fontWeight="500">
                        {customer.dateCreated ? new Date(customer.dateCreated).toLocaleDateString() : 'N/A'}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Residential Address</Typography>
                    {editProfileMode ? (
                        <TextField fullWidth size="small" multiline rows={2} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                    ) : (
                        <Typography variant="body1" fontWeight="500">{customer.address || 'Not provided'}</Typography>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Aadhaar Number</Typography>
                    {editProfileMode ? (
                        <TextField fullWidth size="small" value={editAadhaar} onChange={(e) => setEditAadhaar(e.target.value)} />
                    ) : (
                        <Typography variant="body1" fontWeight="500">{customer.aadhaarNumber || 'Not provided'}</Typography>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>PAN Number</Typography>
                    {editProfileMode ? (
                        <TextField fullWidth size="small" value={editPan} onChange={(e) => setEditPan(e.target.value)} />
                    ) : (
                        <Typography variant="body1" fontWeight="500">{customer.panNumber || 'Not provided'}</Typography>
                    )}
                </Grid>
            </Grid>

            {editProfileMode && (
                <Box display="flex" gap={2} mt={5} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => setEditProfileMode(false)}>Discard Changes</Button>
                    <Button variant="contained" onClick={handleUpdateProfile} disabled={updatingProfile} sx={{ backgroundColor: '#0F4C81' }}>
                        {updatingProfile ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                </Box>
            )}
        </Box>
    );

    const renderAccountInfo = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" mb={4}>Account Information</Typography>

            <Card variant="outlined" sx={{ mb: 4, borderColor: '#e0e0e0', borderRadius: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
                            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                                XXXX{currentAccountNumber.slice(-4)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Account Status</Typography>
                            <Chip label="Active" color="success" size="small" sx={{ mt: 0.5 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Account Type</Typography>
                            <Typography variant="body1" fontWeight="500">{profileData.account?.accountType || 'Savings Account'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Branch Name</Typography>
                            <Typography variant="body1" fontWeight="500">{profileData.account?.branchName || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">IFSC Code</Typography>
                            <Typography variant="body1" fontWeight="500">SBIN0001234</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Nominee Details</Typography>
                            <Typography variant="body1" fontWeight="500">{profileData.account?.nomineeName ? `${profileData.account.nomineeName} (${profileData.account.nomineeRelationship})` : 'Not provided'}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );

    const renderSecuritySettings = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" mb={4}>Security Settings 🔐</Typography>

            <Typography variant="h6" fontWeight="500" gutterBottom>Change Transaction PIN</Typography>
            <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                    <Grid container spacing={2} maxWidth="sm">
                        <Grid item xs={12}>
                            <TextField
                                label="Current PIN"
                                type={showPin ? 'text' : 'password'}
                                value={oldPin}
                                onChange={(e) => setOldPin(e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="New PIN (4 digits)"
                                type={showPin ? 'text' : 'password'}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                fullWidth
                                size="small"
                                inputProps={{ maxLength: 4 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Confirm New PIN"
                                type={showPin ? 'text' : 'password'}
                                value={confirmNewPin}
                                onChange={(e) => setConfirmNewPin(e.target.value)}
                                fullWidth
                                size="small"
                                inputProps={{ maxLength: 4 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={showPin} onChange={(e) => setShowPin(e.target.checked)} />}
                                label="Show PINs"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" onClick={handleChangePin} disabled={changingPin || !oldPin || !newPin || !confirmNewPin} sx={{ bgcolor: '#0F4C81' }}>
                                {changingPin ? <CircularProgress size={24} color="inherit" /> : 'Update PIN'}
                            </Button>
                        </Grid>
                        {changePinSuccess && (
                            <Grid item xs={12}>
                                <Alert severity="success">{changePinSuccess}</Alert>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="500" gutterBottom mt={4}>Advanced Security</Typography>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="500">Two-Factor Authentication (2FA)</Typography>
                            <Typography variant="body2" color="text.secondary">Require an OTP sent to your phone for sensitive actions.</Typography>
                        </Box>
                        <Switch checked={twoFAEnabled} onChange={(e) => setTwoFAEnabled(e.target.checked)} color="primary" />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="500">Biometric Login</Typography>
                            <Typography variant="body2" color="text.secondary">Use Fingerprint/FaceID on supported mobile devices.</Typography>
                        </Box>
                        <Switch checked={biometricEnabled} onChange={(e) => setBiometricEnabled(e.target.checked)} color="primary" />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" fontWeight="500">Device Management</Typography>
                            <Typography variant="body2" color="text.secondary">Manage devices currently logged into your account.</Typography>
                        </Box>
                        <Button variant="outlined" size="small">View Devices</Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );

    const renderCardsManagement = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" mb={4}>Cards Management 💳</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #0f4c81 0%, #168aad 100%)',
                        color: 'white',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(15, 76, 129, 0.3)'
                    }}>
                        <CardContent sx={{ p: 4, position: 'relative' }}>
                            <Typography variant="h6" sx={{ opacity: 0.8, letterSpacing: 2 }}>DEBIT CARD</Typography>
                            <Box mt={3} mb={4}>
                                <Typography variant="h4" sx={{ fontFamily: 'monospace', letterSpacing: 4 }}>
                                    4532 **** **** {currentAccountNumber.slice(-4).padEnd(4, '0')}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>CARDHOLDER</Typography>
                                    <Typography variant="subtitle1" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {customer.firstName} {customer.lastName}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>VALID THRU</Typography>
                                    <Typography variant="subtitle1">12/28</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>CVV</Typography>
                                    <Typography variant="subtitle1">***</Typography>
                                </Box>
                            </Box>

                            {/* Fake chip/wifi logo */}
                            <Box sx={{ position: 'absolute', top: 24, right: 32, opacity: 0.8 }}>
                                <Typography variant="h5" fontWeight="bold" fontStyle="italic">VISA</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Card Controls</Typography>

                            <Box mb={2} p={1.5} sx={{ bgcolor: 'rgba(15, 76, 129, 0.05)', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Daily Transfer Limit</Typography>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    ₹{profileData?.account?.dailyCardLimit ? Number(profileData.account.dailyCardLimit).toLocaleString() : '50,000'}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Typography variant="body2">Block Card Temporarily</Typography>
                                <Switch checked={cardBlocked} onChange={(e) => setCardBlocked(e.target.checked)} color="error" />
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Typography variant="body2">International Usage</Typography>
                                <Switch checked={intlUsage} onChange={(e) => setIntlUsage(e.target.checked)} color="primary" />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => {
                                setNewCardLimit(profileData?.account?.dailyCardLimit || '50000.00');
                                setCardLimitDialog(true);
                            }}>Set Card Limits</Button>
                            <Button fullWidth variant="text" color="error">Report Lost/Stolen</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderNotifications = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" mb={4}>Notifications & Preferences 🔔</Typography>

            <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Alerts Routing</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="500">SMS Alerts</Typography>
                            <Typography variant="body2" color="text.secondary">Receive transactional OTPs and deduction alerts via SMS.</Typography>
                        </Box>
                        <Switch checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="500">Email Notifications</Typography>
                            <Typography variant="body2" color="text.secondary">Detailed statements, login alerts, and marketing offers.</Typography>
                        </Box>
                        <Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" fontWeight="500">Push Notifications</Typography>
                            <Typography variant="body2" color="text.secondary">Real-time alerts sent directly to your mobile app.</Typography>
                        </Box>
                        <Switch checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} />
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="500" gutterBottom>Statement Preferences</Typography>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">E-Statement Frequency</Typography>
                        <Chip label="Monthly (Default)" variant="outlined" />
                    </Box>
                    <Box mt={2}>
                        <Button variant="text" size="small">Change Frequency</Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );

    const renderLinkedServices = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" mb={4}>Linked Services 🔗</Typography>

            <Typography variant="h6" fontWeight="500" gutterBottom>UPI ID Management</Typography>
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight="500">{customer.phone}@securebank</Typography>
                        <Chip label="Primary" color="success" size="small" />
                    </Box>
                    <Box mt={2} display="flex" gap={2}>
                        <Button variant="outlined" size="small">Manage UPI PIN</Button>
                        <Button variant="text" size="small" color="error">Deregister</Button>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="500" gutterBottom>Auto Debit & Subscriptions</Typography>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">No active standing instructions found.</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>Setup New Auto-Debit</Button>
                </CardContent>
            </Card>
        </Box>
    );

    const renderDocuments = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" mb={4}>Documents & Statements 📄</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">Account Statement</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                Download detailed transaction history for tax filing or personal records.
                            </Typography>
                        </CardContent>
                        <Box px={2} pb={2}>
                            <Button fullWidth variant="contained" sx={{ bgcolor: '#0F4C81' }}>Download Latest PDF</Button>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">Interest Certificate</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                Required for IT returns showing interest earned during the financial year.
                            </Typography>
                        </CardContent>
                        <Box px={2} pb={2}>
                            <Button fullWidth variant="outlined">Generate Form 16A</Button>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderSupport = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" mb={4}>Support & Help 🎧</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8fbff', borderColor: '#cce3f9' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <SupportIcon sx={{ fontSize: 48, color: '#0F4C81', mr: 3 }} />
                            <Box>
                                <Typography variant="h6">Need immediate assistance?</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                    Our customer care team is available 24/7 to help you with banking queries.
                                </Typography>
                                <Typography variant="h6" color="primary">1800-420-1234 (Toll-free)</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Button fullWidth variant="outlined" size="large" sx={{ py: 2 }}>Raise a Service Request</Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button fullWidth variant="outlined" size="large" sx={{ py: 2 }}>Chat with AI Assistant</Button>
                </Grid>
                <Grid item xs={12}>
                    <Button fullWidth variant="contained" color="error" size="large" sx={{ py: 2 }}>
                        Report Fraud / Unauthorized Transaction
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );

    const renderLogout = () => (
        <Box textAlign="center" py={8}>
            <Typography variant="h5" fontWeight="600" gutterBottom>Secure Logout</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Are you sure you want to log out of your SecureBank account securely?
            </Typography>
            <Box display="flex" justifyContent="center" gap={3}>
                <Button variant="outlined" size="large" onClick={() => setTabValue(0)}>Cancel</Button>
                <Button variant="contained" color="error" size="large" startIcon={<LogoutIcon />} onClick={onLogout}>
                    Yes, Logout Now
                </Button>
            </Box>
            <Box mt={6}>
                <Button variant="text" color="error">Logout from all active devices</Button>
            </Box>
        </Box>
    );


    // Maps tab index to content function
    const tabPanels = [
        renderPersonalInfo,
        renderAccountInfo,
        renderSecuritySettings,
        renderCardsManagement,
        renderNotifications,
        renderLinkedServices,
        renderDocuments,
        renderSupport,
        renderLogout
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            sx={{ '& .MuiDialog-paper': { height: '85vh', borderRadius: 3, overflow: 'hidden' } }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ borderBottom: '1px solid #eee', bgcolor: '#fcfcfc' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ px: 2 }}>Profile & Settings</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', height: 'calc(100% - 65px)', bgcolor: 'background.paper', overflow: 'hidden' }}>
                {/* Left Side: Vertical Tabs */}
                <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="Profile Settings Tabs"
                        sx={{
                            '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', py: 2, px: 3, textTransform: 'none', fontSize: '1rem' },
                            '& .Mui-selected': { fontWeight: 'bold', bgcolor: 'rgba(15, 76, 129, 0.05)' }
                        }}
                    >
                        <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Information" {...a11yProps(0)} />
                        <Tab icon={<AccountIcon />} iconPosition="start" label="Account Information" {...a11yProps(1)} />
                        <Tab icon={<SecurityIcon />} iconPosition="start" label="Security Settings" {...a11yProps(2)} />
                        <Tab icon={<CardIcon />} iconPosition="start" label="Cards Management" {...a11yProps(3)} />
                        <Tab icon={<NotificationIcon />} iconPosition="start" label="Notifications & Preferences" {...a11yProps(4)} />
                        <Tab icon={<LinkIcon />} iconPosition="start" label="Linked Services" {...a11yProps(5)} />
                        <Tab icon={<DocumentIcon />} iconPosition="start" label="Documents & Statements" {...a11yProps(6)} />
                        <Tab icon={<SupportIcon />} iconPosition="start" label="Support & Help" {...a11yProps(7)} />
                        <Tab icon={<LogoutIcon sx={{ color: '#d32f2f' }} />} iconPosition="start" label="Logout Option" sx={{ color: '#d32f2f' }} {...a11yProps(8)} />
                    </Tabs>
                </Box>

                {/* Right Side: Tab Panel Content */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#ffffff' }}>
                    {tabPanels.map((renderFn, idx) => (
                        <TabPanel value={tabValue} index={idx} key={idx}>
                            {renderFn()}
                        </TabPanel>
                    ))}
                </Box>
            </Box>

            {/* Set Card Limit Dialog */}
            <Dialog open={cardLimitDialog} onClose={() => setCardLimitDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Set Daily Card Limit</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Enter the new maximum daily limit for your debit card transactions.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Daily Limit (₹)"
                        type="number"
                        value={newCardLimit}
                        onChange={(e) => setNewCardLimit(e.target.value)}
                        disabled={updatingLimit}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCardLimitDialog(false)} disabled={updatingLimit}>Cancel</Button>
                    <Button
                        onClick={handleUpdateCardLimit}
                        variant="contained"
                        color="primary"
                        disabled={updatingLimit}
                    >
                        {updatingLimit ? <CircularProgress size={24} color="inherit" /> : 'Save Limit'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Dialog>
    );
};

export default ProfileSettings;
