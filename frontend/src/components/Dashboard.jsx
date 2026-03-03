import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Tabs,
  Tab,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Subscriptions as SubscriptionsIcon,
  EventRepeat as EventRepeatIcon,
  PhoneIphone as PhoneIphoneIcon,
  DirectionsCar as DirectionsCarIcon,
  ElectricBolt as ElectricBoltIcon,
  Tv as TvIcon,
  Subway as SubwayIcon,
  FlightTakeoff as FlightTakeoffIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  LiveTv as LiveTvIcon,
  Theaters as TheatersIcon,
  OndemandVideo as OndemandVideoIcon,
  MedicalServices as MedicalServicesIcon
} from '@mui/icons-material';
import { API_URL } from '../constants/api';
import ProfileSettings from './ProfileSettings';

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
  const [depositPin, setDepositPin] = useState('');
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

  // Mini statement verified state
  const [miniStatementPin, setMiniStatementPin] = useState('');
  const [verifyingMiniStatement, setVerifyingMiniStatement] = useState(false);
  const [miniStatementVerified, setMiniStatementVerified] = useState(false);

  // Date filtering state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const [featureSnack, setFeatureSnack] = useState(false);

  // Bank Loans State
  const [loansDialog, setLoansDialog] = useState(false);
  const [loansTab, setLoansTab] = useState(0);
  const [loansData, setLoansData] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loanType, setLoanType] = useState('Personal Loan');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTenure, setLoanTenure] = useState(12);
  const [applyingLoan, setApplyingLoan] = useState(false);
  const [loanSuccessMessage, setLoanSuccessMessage] = useState('');

  // Fixed Deposits State
  const [fdDialog, setFdDialog] = useState(false);
  const [fdTab, setFdTab] = useState(0);
  const [fdData, setFdData] = useState([]);
  const [loadingFd, setLoadingFd] = useState(false);
  const [fdAmount, setFdAmount] = useState('');
  const [fdTenure, setFdTenure] = useState(12);
  const [openingFd, setOpeningFd] = useState(false);
  const [fdSuccessMessage, setFdSuccessMessage] = useState('');

  // Investments State
  const [investmentsDialog, setInvestmentsDialog] = useState(false);
  const [investmentsTab, setInvestmentsTab] = useState(0);
  const [investmentsData, setInvestmentsData] = useState([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [investmentType, setInvestmentType] = useState('Stocks');
  const [investmentSymbol, setInvestmentSymbol] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentQuantity, setInvestmentQuantity] = useState(1);
  const [purchasingInvestment, setPurchasingInvestment] = useState(false);
  const [investmentSuccessMessage, setInvestmentSuccessMessage] = useState('');

  // Pay Bills State
  const [billsDialog, setBillsDialog] = useState(false);
  const [billsTab, setBillsTab] = useState(0); // 0 = Category Grid, 1 = Form, 2 = History
  const [billsHistoryData, setBillsHistoryData] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [billerCategory, setBillerCategory] = useState('');
  const [billerName, setBillerName] = useState('');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [payingBill, setPayingBill] = useState(false);
  const [billSuccessMessage, setBillSuccessMessage] = useState('');

  // Subscriptions State
  const [subscriptionsDialog, setSubscriptionsDialog] = useState(false);
  const [subscriptionsTab, setSubscriptionsTab] = useState(0); // 0 = Active list, 1 = Platform Grid, 2 = Form
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedPlanDetails, setSelectedPlanDetails] = useState({ name: '', price: 0, duration: 0 });
  const [purchasingSubscription, setPurchasingSubscription] = useState(false);
  const [subscriptionSuccessMessage, setSubscriptionSuccessMessage] = useState('');

  // EMIs State
  const [emisDialog, setEmisDialog] = useState(false);
  const [emisData, setEmisData] = useState([]);
  const [loadingEmis, setLoadingEmis] = useState(false);
  const [payingEmiId, setPayingEmiId] = useState(null);
  const [emiSuccessMessage, setEmiSuccessMessage] = useState('');

  // Profile dialog state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  // Edit profile state (legacy kept for minimal disruption, though mostly moved to ProfileSettings)

  // Edit profile state
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

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
    setMiniStatementVerified(false);
    setMiniStatementPin('');
    setStartDate('');
    setEndDate('');
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

  const openLoansDialog = () => {
    setLoansDialog(true);
    setLoansTab(0);
    fetchLoans();
  };

  const fetchLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/loans/${currentAccountNumber}`);
      setLoansData(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to fetch loans', severity: 'error' });
    } finally {
      setLoadingLoans(false);
    }
  };

  const calculateEmiPreview = () => {
    let rate = 14.0;
    if (loanType === 'Home Loan') rate = 8.5;
    if (loanType === 'Car Loan') rate = 10.5;
    if (loanType === 'Education Loan') rate = 11.0;

    const p = Number(loanAmount);
    if (!p || p <= 0) return 0;

    const r = rate / 12 / 100;
    const n = Number(loanTenure);
    if (!n || n <= 0) return 0;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi.toFixed(2);
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    if (!loanAmount || Number(loanAmount) <= 0) {
      setSnack({ open: true, message: 'Enter a valid principal amount', severity: 'error' });
      return;
    }

    setApplyingLoan(true);
    setLoanSuccessMessage('');
    try {
      const payload = {
        accountNumber: currentAccountNumber,
        loanType,
        principalAmount: Number(loanAmount),
        tenureMonths: Number(loanTenure)
      };
      const res = await axios.post(`${API_BASE_URL}/loans/apply`, payload);
      setSnack({ open: true, message: res.data?.message || 'Loan Approved!', severity: 'success' });
      await fetchLoans(); // Refresh the list
      setLoansTab(0); // Shift user to My Loans view
      setLoanAmount('');
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Loan application failed', severity: 'error' });
    } finally {
      setApplyingLoan(false);
    }
  };

  const openFdDialog = () => {
    setFdDialog(true);
    setFdTab(0);
    fetchFd();
  };

  const fetchFd = async () => {
    setLoadingFd(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/fds/${currentAccountNumber}`);
      setFdData(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to fetch Fixed Deposits', severity: 'error' });
    } finally {
      setLoadingFd(false);
    }
  };

  const calculateFdMaturity = () => {
    const p = Number(fdAmount);
    if (!p || p <= 0) return 0;

    const m = Number(fdTenure);
    if (!m || m <= 0) return 0;

    let rate = 7.5;
    if (m < 6) rate = 4.5;
    else if (m < 12) rate = 5.5;
    else if (m < 36) rate = 6.5;

    const r = rate / 100;
    const t = m / 12.0;
    const n = 4; // Quarterly compounding

    const amount = p * Math.pow(1 + (r / n), n * t);
    return amount.toFixed(2);
  };

  const handleOpenFd = async (e) => {
    e.preventDefault();
    if (!fdAmount || Number(fdAmount) <= 0) {
      setSnack({ open: true, message: 'Enter a valid principal amount for your FD', severity: 'error' });
      return;
    }

    setOpeningFd(true);
    setFdSuccessMessage('');
    try {
      const payload = {
        accountNumber: currentAccountNumber,
        principalAmount: Number(fdAmount),
        tenureMonths: Number(fdTenure)
      };
      const res = await axios.post(`${API_BASE_URL}/fds/create`, payload);
      setSnack({ open: true, message: res.data?.message || 'Fixed Deposit Opened!', severity: 'success' });
      await fetchFd();
      setFdTab(0);
      setFdAmount('');
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Failed to open Fixed Deposit', severity: 'error' });
    } finally {
      setOpeningFd(false);
    }
  };

  const openInvestmentsDialog = () => {
    setInvestmentsDialog(true);
    setInvestmentsTab(0);
    fetchInvestments();
  };

  const fetchInvestments = async () => {
    setLoadingInvestments(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/investments/${currentAccountNumber}`);
      setInvestmentsData(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to fetch Investments', severity: 'error' });
    } finally {
      setLoadingInvestments(false);
    }
  };

  const handlePurchaseInvestment = async (e) => {
    e.preventDefault();
    if (!investmentAmount || Number(investmentAmount) <= 0) {
      setSnack({ open: true, message: 'Enter a valid investment amount', severity: 'error' });
      return;
    }
    if (!investmentSymbol) {
      setSnack({ open: true, message: 'Please enter a valid stock or fund symbol', severity: 'error' });
      return;
    }

    setPurchasingInvestment(true);
    setInvestmentSuccessMessage('');
    try {
      const payload = {
        accountNumber: currentAccountNumber,
        investmentType,
        symbol: investmentSymbol,
        amountInvested: Number(investmentAmount),
        quantity: Number(investmentQuantity)
      };
      const res = await axios.post(`${API_BASE_URL}/investments/purchase`, payload);
      setSnack({ open: true, message: res.data?.message || 'Investment Executed!', severity: 'success' });
      await fetchInvestments();
      setInvestmentsTab(0);
      setInvestmentAmount('');
      setInvestmentSymbol('');
      setInvestmentQuantity(1);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Failed to purchase investment', severity: 'error' });
    } finally {
      setPurchasingInvestment(false);
    }
  };

  const openBillsDialog = () => {
    setBillsDialog(true);
    setBillsTab(0);
    fetchBillsHistory();
  };

  const fetchBillsHistory = async () => {
    setLoadingBills(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/bills/${currentAccountNumber}`);
      setBillsHistoryData(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to fetch Bills History', severity: 'error' });
    } finally {
      setLoadingBills(false);
    }
  };

  const handleCategorySelect = (category) => {
    setBillerCategory(category);
    setBillsTab(1); // Switch to payment form
  };

  const handlePayBill = async (e) => {
    e.preventDefault();
    if (!billAmount || Number(billAmount) <= 0) {
      setSnack({ open: true, message: 'Enter a valid payment amount', severity: 'error' });
      return;
    }
    if (!billerName || !consumerNumber) {
      setSnack({ open: true, message: 'Please enter Biller Name and Consumer Number', severity: 'error' });
      return;
    }

    setPayingBill(true);
    setBillSuccessMessage('');
    try {
      const payload = {
        accountNumber: currentAccountNumber,
        billerCategory,
        billerName,
        consumerNumber,
        amount: Number(billAmount)
      };
      const res = await axios.post(`${API_BASE_URL}/bills/pay`, payload);
      setSnack({ open: true, message: res.data?.message || 'Bill Paid Successfully!', severity: 'success' });
      await fetchBillsHistory();
      setBillsTab(2); // Auto switch to History
      setBillerCategory('');
      setBillerName('');
      setConsumerNumber('');
      setBillAmount('');
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Failed to pay bill', severity: 'error' });
    } finally {
      setPayingBill(false);
    }
  };

  const openSubscriptionsDialog = () => {
    setSubscriptionsDialog(true);
    setSubscriptionsTab(0);
    fetchSubscriptions();
  };

  const fetchSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/subscriptions/${currentAccountNumber}`);
      setSubscriptionsData(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to fetch Subscriptions', severity: 'error' });
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setSubscriptionsTab(2); // Switch to payment form
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!selectedPlanDetails.price || selectedPlanDetails.price <= 0) {
      setSnack({ open: true, message: 'Please select a valid plan', severity: 'error' });
      return;
    }

    setPurchasingSubscription(true);
    setSubscriptionSuccessMessage('');
    try {
      const payload = {
        accountNumber: currentAccountNumber,
        platform: selectedPlatform,
        planName: selectedPlanDetails.name,
        amount: selectedPlanDetails.price,
        durationMonths: selectedPlanDetails.duration
      };
      const res = await axios.post(`${API_BASE_URL}/subscriptions/subscribe`, payload);
      setSnack({ open: true, message: res.data?.message || 'Subscribed Successfully!', severity: 'success' });
      await fetchSubscriptions();
      setSubscriptionsTab(0); // Auto switch to Active list
      setSelectedPlatform('');
      setSelectedPlanDetails({ name: '', price: 0, duration: 0 });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Failed to subscribe', severity: 'error' });
    } finally {
      setPurchasingSubscription(false);
    }
  };

  const openEmisDialog = () => {
    setEmisDialog(true);
    fetchEmis();
  };

  const fetchEmis = async () => {
    setLoadingEmis(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/emis/${currentAccountNumber}`);
      setEmisData(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to fetch EMIs', severity: 'error' });
    } finally {
      setLoadingEmis(false);
    }
  };

  const handlePayEmi = async (emiId, emiAmount) => {
    setPayingEmiId(emiId);
    setEmiSuccessMessage('');
    try {
      const payload = {
        emiId,
        accountNumber: currentAccountNumber,
        amountPaid: emiAmount
      };
      const res = await axios.post(`${API_BASE_URL}/emis/pay`, payload);
      setSnack({ open: true, message: res.data?.message || 'EMI Paid Successfully!', severity: 'success' });
      await fetchEmis(); // Refresh EMI data
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Failed to pay EMI', severity: 'error' });
    } finally {
      setPayingEmiId(null);
    }
  };

  const openProfile = async () => {
    setProfileOpen(true);
    setEditProfileMode(false);
    try {
      const res = await axios.get(`${API_BASE_URL}/accounts/${currentAccountNumber}`);
      setProfileData(res.data);
      // Removed initialization of edit form states here as they are handled in ProfileSettings
    } catch (err) {
      setSnack({ open: true, message: 'Could not load profile', severity: 'error' });
    }
  };

  // Removed handleUpdateProfile and handleChangePin as they are moved to ProfileSettings

  const handleVerifyMiniStatement = async (e) => {
    e.preventDefault();
    if (!miniStatementPin) {
      setSnack({ open: true, message: 'Please enter your PIN', severity: 'error' });
      return;
    }
    setVerifyingMiniStatement(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/verify-pin`, {
        accountNumber: currentAccountNumber,
        pin: miniStatementPin,
      });
      if (res.data.validPin) {
        setMiniStatementVerified(true);
        // Refresh transactions once verified
        await fetchTransactions();
      } else {
        setSnack({ open: true, message: 'Invalid PIN', severity: 'error' });
      }
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Verification failed', severity: 'error' });
    } finally {
      setVerifyingMiniStatement(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    if (startDate) {
      filtered = filtered.filter(txn => new Date(txn.transactionDate) >= new Date(startDate));
    }
    if (endDate) {
      // Add 1 day to include the entire endDate
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filtered = filtered.filter(txn => new Date(txn.transactionDate) < end);
    }
    return filtered;
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Mini Statement", 14, 15);
    doc.setFontSize(11);
    doc.text(`Account Number: ${currentAccountNumber}`, 14, 25);

    if (startDate && endDate) {
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 32);
    } else if (startDate) {
      doc.text(`From: ${startDate}`, 14, 32);
    } else if (endDate) {
      doc.text(`To: ${endDate}`, 14, 32);
    }

    const tableColumn = ["Date", "Type", "Amount", "To/From"];
    const tableRows = [];

    const filteredTxns = getFilteredTransactions();
    filteredTxns.forEach(txn => {
      const row = [
        txn.transactionDate,
        txn.transactionType,
        txn.amount,
        txn.toAccount || txn.fromAccount || '-'
      ];
      tableRows.push(row);
    });

    const startY = (startDate || endDate) ? 38 : 32;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
    });

    doc.save(`statement_${currentAccountNumber}.pdf`);
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
            Check Balance
          </Button>
          <Button variant="outlined" color="info" onClick={openProfile} sx={{ mr: 1 }}>
            Profile
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
        </Box>
      </Box>

      <Typography variant="subtitle1">Available Balance (hidden until PIN verified)</Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>—</Typography>

      {/* Quick Actions Grid */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>Quick Actions</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { icon: <AccountBalanceIcon color="primary" />, label: 'Bank Loans' },
          { icon: <SavingsIcon color="success" />, label: 'Fixed Deposits' },
          { icon: <TrendingUpIcon color="secondary" />, label: 'Trading & Investments' },
          { icon: <ReceiptIcon color="warning" />, label: 'Pay Bills' },
          { icon: <SubscriptionsIcon color="info" />, label: 'Subscriptions' },
          { icon: <EventRepeatIcon color="error" />, label: 'EMIs' }
        ].map((item, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Card
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: '0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 2, borderColor: 'primary.main' },
                textAlign: 'center',
                py: 2
              }}
              onClick={() => {
                if (item.label === 'Bank Loans') {
                  openLoansDialog();
                } else if (item.label === 'Fixed Deposits') {
                  openFdDialog();
                } else if (item.label === 'Trading & Investments') {
                  openInvestmentsDialog();
                } else if (item.label === 'Pay Bills') {
                  openBillsDialog();
                } else if (item.label === 'Subscriptions') {
                  openSubscriptionsDialog();
                } else if (item.label === 'EMIs') {
                  openEmisDialog();
                } else {
                  setFeatureSnack(true);
                }
              }}
            >
              <Box mb={1}>{item.icon}</Box>
              <Typography variant="body2" fontWeight="500">{item.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

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

              {!miniStatementVerified ? (
                <form onSubmit={handleVerifyMiniStatement}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Please verify your PIN to view the mini statement.
                  </Typography>
                  <TextField
                    label="Your PIN"
                    type="password"
                    value={miniStatementPin}
                    onChange={(e) => setMiniStatementPin(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button type="submit" variant="contained" disabled={verifyingMiniStatement} sx={{ mt: 1 }}>
                    {verifyingMiniStatement ? <CircularProgress size={20} /> : 'Verify'}
                  </Button>
                </form>
              ) : loadingTx ? (
                <CircularProgress />
              ) : (
                <>
                  <Box display="flex" gap={2} mb={2} alignItems="center">
                    <TextField
                      label="From Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="To Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      fullWidth
                    />
                  </Box>
                  <Button variant="outlined" sx={{ mb: 2 }} onClick={handleDownloadPdf}>
                    Download PDF
                  </Button>
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
                      {getFilteredTransactions().slice(0, 50).map((txn, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{txn.transactionDate}</TableCell>
                          <TableCell>{txn.transactionType}</TableCell>
                          <TableCell>{txn.amount}</TableCell>
                          <TableCell>{txn.toAccount || txn.fromAccount || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {getFilteredTransactions().length === 0 && (
                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                      No transactions found for the selected date range.
                    </Typography>
                  )}
                </>
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
                // PIN validation
                const pinCheck = validatePin(depositPin);
                if (!pinCheck.ok) {
                  setSnack({ open: true, message: pinCheck.message, severity: 'error' });
                  return;
                }
                setDepositLoading(true);
                try {
                  const payload = {
                    amount: Number(depositAmount),
                    pin: depositPin,
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
                  setDepositPin('');
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
                <TextField
                  label="Your PIN"
                  type="password"
                  value={depositPin}
                  onChange={(e) => setDepositPin(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Box display="flex" gap={2} mt={2}>
                  <Button type="submit" variant="contained" disabled={depositLoading}>
                    {depositLoading ? <CircularProgress size={20} /> : 'Deposit'}
                  </Button>
                  <Button variant="outlined" onClick={() => { setDepositAmount(''); setDepositPin(''); }} disabled={depositLoading}>Reset</Button>
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

      {/* Bank Loans Dialog */}
      <Dialog open={loansDialog} onClose={() => setLoansDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">Bank Loans</Typography>
          <Tabs value={loansTab} onChange={(e, v) => setLoansTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="My Loans" />
            <Tab label="Apply for Loan" />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '350px' }}>
          {loansTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Active & Past Loans</Typography>
              {loadingLoans ? (
                <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
              ) : loansData.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>You do not have any active loans linked to your account.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Loan Type</TableCell>
                      <TableCell>Principal</TableCell>
                      <TableCell>Rate (%)</TableCell>
                      <TableCell>Tenure (Mos)</TableCell>
                      <TableCell>EMI Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loansData.map((loan, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{loan.loanType}</TableCell>
                        <TableCell>₹{loan.principalAmount}</TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>{loan.tenureMonths}</TableCell>
                        <TableCell>₹{loan.emiAmount}</TableCell>
                        <TableCell><Chip label={loan.status} size="small" color={loan.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
          {loansTab === 1 && (
            <Box component="form" onSubmit={handleApplyLoan}>
              <Typography variant="h6" gutterBottom>New Loan Application</Typography>
              {loanSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{loanSuccessMessage}</Alert>}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Loan Type</InputLabel>
                    <Select value={loanType} onChange={(e) => setLoanType(e.target.value)} label="Loan Type">
                      <MenuItem value="Personal Loan">Personal Loan (14.0%)</MenuItem>
                      <MenuItem value="Home Loan">Home Loan (8.5%)</MenuItem>
                      <MenuItem value="Car Loan">Car Loan (10.5%)</MenuItem>
                      <MenuItem value="Education Loan">Education Loan (11.0%)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Principal Amount (₹)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    required
                  />
                  <TextField
                    label="Tenure (Months)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(15, 76, 129, 0.05)', height: '100%', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>EMI Calculator Preview</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Based on your selections, below is the estimated monthly installment.
                      </Typography>
                      <Box mt={3} mb={1}>
                        <Typography variant="caption" color="text.secondary">Estimated EMI</Typography>
                        <Typography variant="h4" fontWeight="bold">₹{calculateEmiPreview()}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={applyingLoan || !loanAmount}>
                  {applyingLoan ? <CircularProgress size={20} /> : 'Submit Application'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoansDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Fixed Deposits Dialog */}
      <Dialog open={fdDialog} onClose={() => setFdDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">Fixed Deposits</Typography>
          <Tabs value={fdTab} onChange={(e, v) => setFdTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="My FDs" />
            <Tab label="Open New FD" />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '350px' }}>
          {fdTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Active Fixed Deposits</Typography>
              {loadingFd ? (
                <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
              ) : fdData.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>You do not have any active Fixed Deposits.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Principal</TableCell>
                      <TableCell>Rate (%)</TableCell>
                      <TableCell>Tenure (Mos)</TableCell>
                      <TableCell>Maturity Amt</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fdData.map((fd, idx) => (
                      <TableRow key={idx}>
                        <TableCell>₹{fd.principalAmount}</TableCell>
                        <TableCell>{fd.interestRate}%</TableCell>
                        <TableCell>{fd.tenureMonths}</TableCell>
                        <TableCell>₹{fd.maturityAmount}</TableCell>
                        <TableCell><Chip label={fd.status} size="small" color={fd.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
          {fdTab === 1 && (
            <Box component="form" onSubmit={handleOpenFd}>
              <Typography variant="h6" gutterBottom>Open New Fixed Deposit</Typography>
              {fdSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{fdSuccessMessage}</Alert>}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Principal Amount (₹)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={fdAmount}
                    onChange={(e) => setFdAmount(e.target.value)}
                    required
                  />
                  <TextField
                    label="Tenure (Months)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={fdTenure}
                    onChange={(e) => setFdTenure(e.target.value)}
                    required
                    helperText="Minimum 6 months (4.5%), 12 months (5.5%), 36 months (6.5%), 36+ (7.5%)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(76, 175, 80, 0.05)', height: '100%', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="success.main" gutterBottom>Maturity Calculator Preview</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Based on your principal and tenure, here is your estimated maturity amount (compounded quarterly).
                      </Typography>
                      <Box mt={3} mb={1}>
                        <Typography variant="caption" color="text.secondary">Estimated Maturity Amount</Typography>
                        <Typography variant="h4" fontWeight="bold">₹{calculateFdMaturity()}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={openingFd || !fdAmount}>
                  {openingFd ? <CircularProgress size={20} /> : 'Open Fixed Deposit'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFdDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Investments Dialog */}
      <Dialog open={investmentsDialog} onClose={() => setInvestmentsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">Trading & Investments</Typography>
          <Tabs value={investmentsTab} onChange={(e, v) => setInvestmentsTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="My Portfolio" />
            <Tab label="Invest Now" />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '350px' }}>
          {investmentsTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Active Holdings</Typography>
              {loadingInvestments ? (
                <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
              ) : investmentsData.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>You do not have any active investments.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Amount Invested</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Current Value</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {investmentsData.map((inv, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{inv.investmentType}</TableCell>
                        <TableCell fontWeight="bold">{inv.symbol}</TableCell>
                        <TableCell>₹{inv.amountInvested}</TableCell>
                        <TableCell>{inv.quantity}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>₹{inv.currentReturn}</TableCell>
                        <TableCell><Chip label={inv.status} size="small" color={inv.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
          {investmentsTab === 1 && (
            <Box component="form" onSubmit={handlePurchaseInvestment}>
              <Typography variant="h6" gutterBottom>Execute New Trade</Typography>
              {investmentSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{investmentSuccessMessage}</Alert>}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Investment Type</InputLabel>
                    <Select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)} label="Investment Type">
                      <MenuItem value="Stocks">Stocks</MenuItem>
                      <MenuItem value="Mutual Funds">Mutual Funds</MenuItem>
                      <MenuItem value="Bonds">Bonds</MenuItem>
                      <MenuItem value="Gold (SGB)">Gold (SGB)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Ticker/Symbol (e.g., AAPL, RELIANCE)"
                    fullWidth
                    margin="normal"
                    value={investmentSymbol}
                    onChange={(e) => setInvestmentSymbol(e.target.value.toUpperCase())}
                    required
                  />
                  <TextField
                    label="Amount to Invest (₹)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    required
                  />
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={investmentQuantity}
                    onChange={(e) => setInvestmentQuantity(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(33, 150, 243, 0.05)', height: '100%', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary.main" gutterBottom>Market Risks</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Please be aware that trading and investments are subject to market risks. Past performance is not indicative of future returns.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        The current return value for this demonstration is hardcoded to equal your invested basis.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" color="secondary" disabled={purchasingInvestment || !investmentAmount || !investmentSymbol}>
                  {purchasingInvestment ? <CircularProgress size={20} /> : 'Execute Purchase'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvestmentsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Subscriptions Dialog */}
      <Dialog open={subscriptionsDialog} onClose={() => setSubscriptionsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">Manage Subscriptions</Typography>
          <Tabs value={subscriptionsTab} onChange={(e, v) => setSubscriptionsTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="My Subscriptions" />
            <Tab label="Browse Plans" />
            <Tab label="Checkout" disabled={subscriptionsTab !== 2} />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '350px' }}>
          {subscriptionsTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Active Subscriptions</Typography>
              {loadingSubscriptions ? (
                <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
              ) : subscriptionsData.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>You do not have any active subscriptions.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>Valid Until</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptionsData.map((sub, idx) => {
                      const isExpired = new Date(sub.endDate) < new Date();
                      return (
                        <TableRow key={idx}>
                          <TableCell fontWeight="bold">{sub.platform}</TableCell>
                          <TableCell>{sub.planName}</TableCell>
                          <TableCell>₹{sub.amount}</TableCell>
                          <TableCell>{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ color: isExpired ? 'error.main' : 'inherit' }}>
                            {new Date(sub.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isExpired ? 'EXPIRED' : sub.status}
                              size="small"
                              color={isExpired ? 'error' : (sub.status === 'ACTIVE' ? 'success' : 'default')}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}

          {subscriptionsTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>Select a Platform</Typography>
              <Grid container spacing={2}>
                {[
                  { icon: <OndemandVideoIcon color="error" />, label: 'ZEE5' },
                  { icon: <LiveTvIcon color="info" />, label: 'SonyLiv' },
                  { icon: <LiveTvIcon color="primary" />, label: 'Amazon Prime' },
                  { icon: <TheatersIcon color="success" />, label: 'JioHotstar' },
                  { icon: <MedicalServicesIcon color="primary" />, label: 'APOLLO24/7' },
                  { icon: <OndemandVideoIcon color="error" />, label: 'Airtel Xstreme' },
                  { icon: <SubscriptionsIcon color="secondary" />, label: 'Others' }
                ].map((plat, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: '0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 2, borderColor: 'primary.main' },
                        textAlign: 'center',
                        py: 2
                      }}
                      onClick={() => handlePlatformSelect(plat.label)}
                    >
                      <Box mb={1}>{plat.icon}</Box>
                      <Typography variant="body2" fontWeight="500">{plat.label}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {subscriptionsTab === 2 && (
            <Box component="form" onSubmit={handleSubscribe}>
              <Typography variant="h6" gutterBottom>Subscribe to <strong>{selectedPlatform}</strong></Typography>
              {subscriptionSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{subscriptionSuccessMessage}</Alert>}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Select a Plan</InputLabel>
                    <Select
                      value={selectedPlanDetails.price || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 299) setSelectedPlanDetails({ name: '1 Month Premium', price: 299, duration: 1 });
                        else if (val === 899) setSelectedPlanDetails({ name: '6 Months Super', price: 899, duration: 6 });
                        else if (val === 1499) setSelectedPlanDetails({ name: '12 Months Annual VIP', price: 1499, duration: 12 });
                      }}
                      label="Select a Plan"
                      required
                    >
                      <MenuItem value={299}>1 Month Premium - ₹299</MenuItem>
                      <MenuItem value={899}>6 Months Super - ₹899</MenuItem>
                      <MenuItem value={1499}>12 Months Annual VIP - ₹1499</MenuItem>
                    </Select>
                  </FormControl>

                  {selectedPlanDetails.price > 0 && (
                    <Box mt={2} p={2} sx={{ bgcolor: 'background.default', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle2" color="text.secondary">Order Summary</Typography>
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="body2">{selectedPlatform} ({selectedPlanDetails.name})</Typography>
                        <Typography variant="body2" fontWeight="bold">₹{selectedPlanDetails.price}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="body2">Validity</Typography>
                        <Typography variant="body2" fontWeight="bold">{selectedPlanDetails.duration} Month(s)</Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(33, 150, 243, 0.05)', height: '100%', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary.main" gutterBottom>Auto-Renewal Enabled</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Your bank account will be securely debited today for the selected amount.
                        By proceeding, you agree to auto-renew this plan upon expiration.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Subscription details will securely reflect in your profile instantly.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setSubscriptionsTab(1)}>Back</Button>
                <Button type="submit" variant="contained" color="secondary" disabled={purchasingSubscription || selectedPlanDetails.price === 0}>
                  {purchasingSubscription ? <CircularProgress size={20} /> : `Pay ₹${selectedPlanDetails.price || 0}`}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Pay Bills Dialog */}
      <Dialog open={billsDialog} onClose={() => setBillsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">Pay Bills</Typography>
          <Tabs value={billsTab} onChange={(e, v) => setBillsTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Categories" />
            <Tab label="Pay Bill" disabled={billsTab === 0 && !billerCategory} />
            <Tab label="Payment History" />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '350px' }}>
          {billsTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>Select a Biller Category</Typography>
              <Grid container spacing={2}>
                {[
                  { icon: <PhoneIphoneIcon color="primary" />, label: 'Mobile Recharge' },
                  { icon: <DirectionsCarIcon color="success" />, label: 'FASTag Recharge' },
                  { icon: <ElectricBoltIcon color="warning" />, label: 'Electricity' },
                  { icon: <TvIcon color="info" />, label: 'DTH' },
                  { icon: <SubwayIcon color="secondary" />, label: 'NCMC Recharge' },
                  { icon: <FlightTakeoffIcon color="primary" />, label: 'International Roaming' },
                  { icon: <TvIcon color="error" />, label: 'Cable TV' },
                  { icon: <LocalFireDepartmentIcon color="error" />, label: 'Book a Cylinder' }
                ].map((cat, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: '0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 2, borderColor: 'primary.main' },
                        textAlign: 'center',
                        py: 2
                      }}
                      onClick={() => handleCategorySelect(cat.label)}
                    >
                      <Box mb={1}>{cat.icon}</Box>
                      <Typography variant="body2" fontWeight="500">{cat.label}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          {billsTab === 1 && (
            <Box component="form" onSubmit={handlePayBill}>
              <Typography variant="h6" gutterBottom>Pay <strong>{billerCategory}</strong> Bill</Typography>
              {billSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{billSuccessMessage}</Alert>}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Biller Name (e.g., Airtel, BESCOM)"
                    fullWidth
                    margin="normal"
                    value={billerName}
                    onChange={(e) => setBillerName(e.target.value)}
                    required
                  />
                  <TextField
                    label="Consumer / Account Number"
                    fullWidth
                    margin="normal"
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                    required
                  />
                  <TextField
                    label="Amount (₹)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(255, 152, 0, 0.05)', height: '100%', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="warning.main" gutterBottom>Secure Payment</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Your payment will be processed securely and settled instantly with the respective biller.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please verify the exact Consumer/Account Number and the Amount, as errors cannot easily be reversed.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setBillsTab(0)}>Back</Button>
                <Button type="submit" variant="contained" color="primary" disabled={payingBill || !billAmount || !billerName}>
                  {payingBill ? <CircularProgress size={20} /> : 'Pay Now'}
                </Button>
              </Box>
            </Box>
          )}
          {billsTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Recent Bill Payments</Typography>
              {loadingBills ? (
                <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
              ) : billsHistoryData.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>No recent bill payments found.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Biller Name</TableCell>
                      <TableCell>Consumer No.</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billsHistoryData.map((bill, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(bill.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{bill.billerCategory}</TableCell>
                        <TableCell>{bill.billerName}</TableCell>
                        <TableCell>{bill.consumerNumber}</TableCell>
                        <TableCell fontWeight="bold">₹{bill.amount}</TableCell>
                        <TableCell><Chip label={bill.status} size="small" color={bill.status === 'SUCCESS' ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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

      {/* EMIs Dialog */}
      <Dialog open={emisDialog} onClose={() => setEmisDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">My EMIs</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '350px' }}>
          <Box>
            <Typography variant="h6" gutterBottom>Active EMIs</Typography>
            {emiSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{emiSuccessMessage}</Alert>}
            {loadingEmis ? (
              <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
            ) : emisData.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>You do not have any active EMIs.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Loan ID</TableCell>
                    <TableCell>EMI Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emisData.map((emi, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{emi.loanId}</TableCell>
                      <TableCell fontWeight="bold">₹{emi.emiAmount}</TableCell>
                      <TableCell>{new Date(emi.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={emi.status}
                          size="small"
                          color={emi.status === 'PAID' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={emi.status === 'PAID' || payingEmiId === emi.id}
                          onClick={() => handlePayEmi(emi.id, emi.emiAmount)}
                        >
                          {payingEmiId === emi.id ? <CircularProgress size={14} color="inherit" /> : 'Pay Now'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmisDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Profile dialog replaced by ProfileSettings mapping component */}
      <ProfileSettings
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profileData={profileData}
        setProfileData={setProfileData}
        currentAccountNumber={currentAccountNumber}
        setSnack={setSnack}
        onLogout={handleLogout}
      />

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
