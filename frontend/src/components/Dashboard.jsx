import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Card,
  CardContent,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person as PersonIcon } from '@mui/icons-material';
import { API_URL } from '../constants/api';

const API_BASE_URL = `${API_URL}/api`;

/**
 * Dashboard component
 * Features added:
 * - Transfer money to another account (requires PIN)
 * - Mini-statement (latest transactions)
 * - Check balance by verifying account PIN
 *
 * Assumptions about backend endpoints (adjust if different):
 * - POST /api/accounts/transfer  { fromAccount, toAccount, amount, description, pin }
 * - GET  /api/accounts/{accountNumber}/transactions
 * - GET  /api/accounts/{accountNumber}  (returns account with balance)
 * - POST /api/accounts/verify-pin { accountNumber, pin } -> { verified: true, balance }
 */

const Dashboard = ({ account, onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loadingTx, setLoadingTx] = useState(false);

  // Allow switching/using a dynamic account number (user may have multiple accounts)
  const [currentAccountNumber, setCurrentAccountNumber] = useState(account?.accountNumber || '');

  // Transfer form state
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState('');

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState('');

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Balance verification dialog
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balancePin, setBalancePin] = useState('');
  const [verifyingBalance, setVerifyingBalance] = useState(false);
  const [verifiedBalance, setVerifiedBalance] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  // Profile dialog state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [changingPin, setChangingPin] = useState(false);
  const [changePinSuccess, setChangePinSuccess] = useState('');

  const navigate = useNavigate();

  // sync currentAccountNumber when parent `account` prop changes
  useEffect(() => {
    if (account?.accountNumber) {
      setCurrentAccountNumber(account.accountNumber);
    }
  }, [account]);

  // fetch transactions whenever the selected account number changes
  useEffect(() => {
    if (!currentAccountNumber) return;
    fetchTransactions();
  }, [currentAccountNumber]);

  const fetchTransactions = async () => {
    setLoadingTx(true);
    setError('');
    try {
  const res = await axios.get(`${API_BASE_URL}/accounts/${currentAccountNumber}/transactions`);
      // Ensure we display most recent first
      setTransactions(Array.isArray(res.data) ? res.data.slice().reverse() : []);
    } catch (err) {
      setError('Could not load transactions.');
    } finally {
      setLoadingTx(false);
    }
  };

  // Validate PIN: must be exactly 4 digits (numeric)
  const validatePin = (pin) => {
    if (!pin) return { ok: false, message: 'PIN is required' };
    const trimmed = String(pin).trim();
    if (!/^[0-9]{4}$/.test(trimmed)) {
      return { ok: false, message: 'PIN must be exactly 4 digits' };
    }
    return { ok: true };
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferSuccess('');
    setError('');

    // Basic validation
    if (!toAccount || !amount || !transferPin) {
      setSnack({ open: true, message: 'Please fill all transfer fields (including PIN).', severity: 'error' });
      return;
    }

    // PIN validation (client-side)
    const pinCheck = validatePin(transferPin);
    if (!pinCheck.ok) {
      setSnack({ open: true, message: pinCheck.message, severity: 'error' });
      return;
    }

    setTransferLoading(true);
    try {
      const payload = {
        toAccount: toAccount.trim(),
        amount: Number(amount),
        description: 'Transfer from web UI',
        pin: transferPin,
      };

      // POST /accounts/{fromAccount}/transfer
      const res = await axios.post(`${API_BASE_URL}/accounts/${currentAccountNumber}/transfer`, payload);
      setTransferSuccess(res.data?.message || 'Transfer successful');
      setSnack({ open: true, message: 'Transfer successful', severity: 'success' });
      // Refresh transactions and update verified balance if backend returns account
      if (res.data?.balance !== undefined) setVerifiedBalance(res.data.balance);
      await fetchTransactions();
      // clear form
      setToAccount('');
      setAmount('');
      setTransferPin('');
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Transfer failed', severity: 'error' });
    } finally {
      setTransferLoading(false);
    }
  };

  const openBalanceDialog = () => {
    setVerifiedBalance(null);
    setBalancePin('');
    setBalanceDialogOpen(true);
  };

  const openProfile = async () => {
    setProfileOpen(true);
  setShowAddress(true);
    setChangePinOpen(false);
    setChangePinSuccess('');
    setOldPin('');
    setNewPin('');
    setConfirmNewPin('');
    try {
      const res = await axios.get(`${API_BASE_URL}/accounts/${currentAccountNumber}`);
      setProfileData(res.data);
    } catch (err) {
      setSnack({ open: true, message: 'Could not load profile', severity: 'error' });
    }
  };

  const handleChangePin = async () => {
    // validate
    if (!oldPin) return setSnack({ open: true, message: 'Current PIN required', severity: 'error' });
    const newCheck = validatePin(newPin);
    if (!newCheck.ok) return setSnack({ open: true, message: newCheck.message, severity: 'error' });
    if (newPin !== confirmNewPin) return setSnack({ open: true, message: 'New PINs do not match', severity: 'error' });

    setChangingPin(true);
    try {
      // Backend auth endpoint expects POST /api/auth/change-pin with a map payload
      const res = await axios.post(`${API_BASE_URL}/auth/change-pin`, {
        accountNumber: currentAccountNumber,
        oldPin,
        newPin,
      });
      // backend returns { success: true } per provided snippet
      if (res.data?.success) {
        setChangePinSuccess('PIN changed');
        setSnack({ open: true, message: 'PIN changed successfully', severity: 'success' });

        // Attempt to verify new PIN by authenticating immediately.
        try {
          const auth = await axios.post(`${API_BASE_URL}/accounts/authenticate`, {
            accountNumber: currentAccountNumber,
            pin: newPin,
          });
          console.log('Post-change auth response:', auth.data);
          if (auth.data?.authenticated) {
            // update parent/app state so the new PIN/session is reflected
            if (onLogin) onLogin(auth.data.account);
            setSnack({ open: true, message: 'PIN verified — your session was updated.', severity: 'success' });
          } else {
            setSnack({ open: true, message: 'PIN changed but could not verify with login — please try logging in.', severity: 'warning' });
          }
        } catch (authErr) {
          console.error('Error verifying new PIN:', authErr);
          setSnack({ open: true, message: 'PIN changed but verification failed (network).', severity: 'warning' });
        }

        setChangePinOpen(false);
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

  const handleVerifyBalance = async () => {
    // PIN validation before calling backend
    const pinCheck = validatePin(balancePin);
    if (!pinCheck.ok) {
      setSnack({ open: true, message: pinCheck.message, severity: 'error' });
      return;
    }

    setVerifyingBalance(true);
    setVerifiedBalance(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/verify-pin`, {
        accountNumber: currentAccountNumber,
        pin: balancePin,
      });
      console.log('PIN verification response:', res);
      if (res.data.validPin) {
        setVerifiedBalance(res.data.balance ?? account.balance);
      } else {
        setSnack({ open: true, message: 'PIN verification failed', severity: 'error' });
      }
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Verification failed', severity: 'error' });
    } finally {
      setVerifyingBalance(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6">Welcome</Typography>
          <Typography variant="subtitle2">Active Account:</Typography>
          <TextField
            value={currentAccountNumber}
            onChange={(e) => setCurrentAccountNumber(e.target.value)}
            size="small"
            sx={{ mt: 0.5, width: 220 }}
            helperText="Edit or paste an account number to switch"
          />
        </Box>
        <Box>
          <Button variant="outlined" color="primary" onClick={openBalanceDialog} sx={{ mr: 1 }}>
            Verify PIN & Check Balance
          </Button>
          <Button variant="outlined" color="info" onClick={openProfile} sx={{ mr: 1 }}>
            Profile
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
        </Box>
      </Box>

  <Typography variant="subtitle1">Available Balance (hidden until PIN verified)</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>—</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Transfer Money</Typography>
              <form onSubmit={handleTransfer}>
                <TextField
                  label="To Account Number"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Your PIN"
                  type="password"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Box display="flex" gap={2} mt={2}>
                  <Button type="submit" variant="contained" disabled={transferLoading}>
                    {transferLoading ? <CircularProgress size={20} /> : 'Send'}
                  </Button>
                  <Button variant="outlined" onClick={() => { setToAccount(''); setAmount(''); setTransferPin(''); }} disabled={transferLoading}>
                    Reset
                  </Button>
                </Box>
                {transferSuccess && <Alert severity="success" sx={{ mt: 2 }}>{transferSuccess}</Alert>}
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mini Statement (Latest Transactions)</Typography>
              {error && <Alert severity="error">{error}</Alert>}
              {loadingTx ? (
                <CircularProgress />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>To/From</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.slice(0, 10).map((txn, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{txn.transactionDate}</TableCell>
                        <TableCell>{txn.transactionType}</TableCell>
                        <TableCell>{txn.amount}</TableCell>
                        <TableCell>{txn.toAccount || txn.fromAccount || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Deposit and Withdraw row */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Deposit Funds</Typography>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setDepositSuccess('');
                if (!depositAmount || Number(depositAmount) <= 0) {
                  setSnack({ open: true, message: 'Enter a valid deposit amount', severity: 'error' });
                  return;
                }
                setDepositLoading(true);
                try {
                  const payload = {
                    amount: Number(depositAmount),
                    description: 'Deposit via web UI'
                  };
                  // POST /accounts/{accountNumber}/deposit
                  const res = await axios.post(`${API_BASE_URL}/accounts/${currentAccountNumber}/deposit`, payload);
                  // backend returns updated account object; show balance if present
                  setDepositSuccess(res.data?.message || 'Deposit successful');
                  setSnack({ open: true, message: 'Deposit successful', severity: 'success' });
                  if (res.data?.balance !== undefined) setVerifiedBalance(res.data.balance);
                  await fetchTransactions();
                  setDepositAmount('');
                } catch (err) {
                  setSnack({ open: true, message: err.response?.data?.error || 'Deposit failed', severity: 'error' });
                } finally {
                  setDepositLoading(false);
                }
              }}>
                <TextField
                  label="Amount to Deposit"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Box display="flex" gap={2} mt={2}>
                  <Button type="submit" variant="contained" disabled={depositLoading}>
                    {depositLoading ? <CircularProgress size={20} /> : 'Deposit'}
                  </Button>
                  <Button variant="outlined" onClick={() => setDepositAmount('')} disabled={depositLoading}>Reset</Button>
                </Box>
                {depositSuccess && <Alert severity="success" sx={{ mt: 2 }}>{depositSuccess}</Alert>}
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Withdraw Funds</Typography>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setWithdrawSuccess('');
                if (!withdrawAmount || Number(withdrawAmount) <= 0) {
                  setSnack({ open: true, message: 'Enter a valid withdrawal amount', severity: 'error' });
                  return;
                }
                // PIN validation
                const pinCheck = validatePin(withdrawPin);
                if (!pinCheck.ok) {
                  setSnack({ open: true, message: pinCheck.message, severity: 'error' });
                  return;
                }
                setWithdrawLoading(true);
                try {
                  const payload = {
                    amount: Number(withdrawAmount),
                    pin: withdrawPin,
                    description: 'Withdrawal via web UI'
                  };
                  // POST /accounts/{accountNumber}/withdraw
                  const res = await axios.post(`${API_BASE_URL}/accounts/${currentAccountNumber}/withdraw`, payload);
                  setWithdrawSuccess(res.data?.message || 'Withdrawal successful');
                  setSnack({ open: true, message: 'Withdrawal successful', severity: 'success' });
                  if (res.data?.balance !== undefined) setVerifiedBalance(res.data.balance);
                  await fetchTransactions();
                  setWithdrawAmount('');
                  setWithdrawPin('');
                } catch (err) {
                  setSnack({ open: true, message: err.response?.data?.error || 'Withdrawal failed', severity: 'error' });
                } finally {
                  setWithdrawLoading(false);
                }
              }}>
                <TextField
                  label="Amount to Withdraw"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Your PIN"
                  type="password"
                  value={withdrawPin}
                  onChange={(e) => setWithdrawPin(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Box display="flex" gap={2} mt={2}>
                  <Button type="submit" variant="contained" disabled={withdrawLoading}>
                    {withdrawLoading ? <CircularProgress size={20} /> : 'Withdraw'}
                  </Button>
                  <Button variant="outlined" onClick={() => { setWithdrawAmount(''); setWithdrawPin(''); }} disabled={withdrawLoading}>Reset</Button>
                </Box>
                {withdrawSuccess && <Alert severity="success" sx={{ mt: 2 }}>{withdrawSuccess}</Alert>}
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Balance verification dialog */}
      <Dialog open={balanceDialogOpen} onClose={() => setBalanceDialogOpen(false)}>
        <DialogTitle>Verify PIN to view balance</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter PIN"
            type="password"
            value={balancePin}
            onChange={(e) => setBalancePin(e.target.value)}
            fullWidth
            margin="normal"
          />
          {verifyingBalance && <CircularProgress size={20} />}
          {verifiedBalance !== null && (
            <Alert severity="success" sx={{ mt: 2 }}>Balance: ₹ {verifiedBalance}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalanceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleVerifyBalance} variant="contained" disabled={verifyingBalance || !balancePin}>Verify</Button>
        </DialogActions>
      </Dialog>

      {/* Profile dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          {profileData ? (
            <Box display="flex" gap={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{profileData.customer?.firstName} {profileData.customer?.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">Customer ID: {profileData.customer?.customerId}</Typography>
              </Box>
            </Box>
          ) : (
            <Typography>Loading profile…</Typography>
          )}

          <Box mt={2}>
            <Button variant="text" onClick={() => setShowAddress(prev => !prev)}>
              Address
            </Button>
            {showAddress && (
              <Box mt={1}>
                <Typography>{profileData?.customer?.address || 'No address on file'}</Typography>
              </Box>
            )}
          </Box>

          <Box mt={2}>
            <Button variant="text" onClick={() => setChangePinOpen(true)}>Change PIN</Button>
            {changePinOpen && (
              <Box mt={1}>
                <TextField label="Current PIN" type="password" value={oldPin} onChange={(e) => setOldPin(e.target.value)} fullWidth margin="normal" />
                <TextField label="New PIN" type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} fullWidth margin="normal" />
                <TextField label="Confirm New PIN" type="password" value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value)} fullWidth margin="normal" />
                <Box display="flex" gap={2} mt={1}>
                  <Button variant="contained" onClick={handleChangePin} disabled={changingPin}>{changingPin ? <CircularProgress size={18} /> : 'Save'}</Button>
                  <Button variant="outlined" onClick={() => setChangePinOpen(false)}>Cancel</Button>
                </Box>
                {changePinSuccess && <Alert severity="success" sx={{ mt: 1 }}>{changePinSuccess}</Alert>}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(prev => ({ ...prev, open: false }))}
        message={snack.message}
      />
    </Box>
  );
};

export default Dashboard;
