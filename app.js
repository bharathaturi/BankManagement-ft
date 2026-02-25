// Bank Management System - JavaScript Application

// Application State
let currentUser = null;
let currentAccount = null;

// Sample data initialization
const sampleData = {
  customers: [
    {
      id: "CUST001",
      firstName: "John",
      lastName: "Doe", 
      email: "john.doe@email.com",
      phone: "555-0123",
      address: "123 Main St, Cityville, ST 12345",
      dateCreated: "2024-01-15"
    },
    {
      id: "CUST002", 
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@email.com", 
      phone: "555-0456",
      address: "456 Oak Ave, Townsburg, ST 67890",
      dateCreated: "2024-02-20"
    }
  ],
  accounts: [
    {
      accountNumber: "ACC001234567",
      customerId: "CUST001",
      accountType: "Savings",
      balance: 5000.00,
      pin: "1234",
      isActive: true,
      dateCreated: "2024-01-15"
    },
    {
      accountNumber: "ACC001234568", 
      customerId: "CUST002",
      accountType: "Checking",
      balance: 3500.00,
      pin: "5678", 
      isActive: true,
      dateCreated: "2024-02-20"
    }
  ],
  transactions: [
    {
      id: "TXN001",
      fromAccount: "ACC001234567",
      toAccount: null,
      type: "deposit",
      amount: 1000.00,
      description: "Initial deposit",
      timestamp: "2024-01-15T10:00:00Z"
    },
    {
      id: "TXN002", 
      fromAccount: "ACC001234567",
      toAccount: null,
      type: "withdraw",
      amount: 200.00,
      description: "ATM withdrawal",
      timestamp: "2024-01-20T14:30:00Z"
    },
    {
      id: "TXN003",
      fromAccount: "ACC001234567", 
      toAccount: "ACC001234568",
      type: "transfer",
      amount: 500.00,
      description: "Transfer to Jane Smith",
      timestamp: "2024-01-25T03:15:00Z"
    }
  ]
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
});

// Initialize app with sample data if not exists
function initializeApp() {
  if (!localStorage.getItem('bankCustomers')) {
    localStorage.setItem('bankCustomers', JSON.stringify(sampleData.customers));
  }
  if (!localStorage.getItem('bankAccounts')) {
    localStorage.setItem('bankAccounts', JSON.stringify(sampleData.accounts));
  }
  if (!localStorage.getItem('bankTransactions')) {
    localStorage.setItem('bankTransactions', JSON.stringify(sampleData.transactions));
  }
  
  // Check if user is already logged in
  const loggedInAccount = localStorage.getItem('currentAccount');
  if (loggedInAccount) {
    currentAccount = JSON.parse(loggedInAccount);
    currentUser = getCustomerById(currentAccount.customerId);
    showDashboard();
  } else {
    showPage('landingPage');
    hideHeader();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Create Account Form
  document.getElementById('createAccountForm').addEventListener('submit', handleCreateAccount);
  
  // Login Form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Transaction Forms
  document.getElementById('depositForm').addEventListener('submit', handleDeposit);
  document.getElementById('withdrawForm').addEventListener('submit', handleWithdraw);
  document.getElementById('transferForm').addEventListener('submit', handleTransfer);
  
  // Transaction Filter
  document.getElementById('transactionFilter').addEventListener('change', filterTransactions);
}

// Navigation Functions
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.add('hidden'));
  
  // Show requested page
  document.getElementById(pageId).classList.remove('hidden');
  
  // Show/hide header based on page
  if (pageId === 'landingPage' || pageId === 'createAccountPage' || pageId === 'loginPage') {
    hideHeader();
  } else {
    showHeader();
  }
  
  // Update page-specific content
  if (pageId === 'dashboardPage') {
    updateDashboard();
  } else if (pageId === 'historyPage') {
    loadTransactionHistory();
  }
}

function showHeader() {
  document.getElementById('header').style.display = 'block';
}

function hideHeader() {
  document.getElementById('header').style.display = 'none';
}

// Account Creation
function handleCreateAccount(e) {
  e.preventDefault();
  showLoading();
  
  // Get form data
  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    accountType: document.getElementById('accountType').value,
    initialDeposit: parseFloat(document.getElementById('initialDeposit').value),
    pin: document.getElementById('pin').value
  };
  
  // Validate form data
  if (!validateCreateAccountForm(formData)) {
    hideLoading();
    return;
  }
  
  setTimeout(() => {
    try {
      // Create customer
      const customerId = generateCustomerId();
      const customer = {
        id: customerId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateCreated: new Date().toISOString().split('T')[0]
      };
      
      // Create account
      const accountNumber = generateAccountNumber();
      const account = {
        accountNumber: accountNumber,
        customerId: customerId,
        accountType: formData.accountType,
        balance: formData.initialDeposit,
        pin: formData.pin,
        isActive: true,
        dateCreated: new Date().toISOString().split('T')[0]
      };
      
      // Save to localStorage
      saveCustomer(customer);
      saveAccount(account);
      
      // Create initial deposit transaction
      const transaction = {
        id: generateTransactionId(),
        fromAccount: accountNumber,
        toAccount: null,
        type: 'deposit',
        amount: formData.initialDeposit,
        description: 'Initial deposit',
        timestamp: new Date().toISOString()
      };
      saveTransaction(transaction);
      
      hideLoading();
      showMessage('success', `Account created successfully! Your account number is: ${accountNumber}`);
      
      // Reset form and redirect to login
      document.getElementById('createAccountForm').reset();
      setTimeout(() => {
        showPage('loginPage');
      }, 2000);
      
    } catch (error) {
      hideLoading();
      showMessage('error', 'Failed to create account. Please try again.');
    }
  }, 1000);
}

// Form validation
function validateCreateAccountForm(data) {
  if (data.firstName.length < 2) {
    showMessage('error', 'First name must be at least 2 characters');
    return false;
  }
  if (data.lastName.length < 2) {
    showMessage('error', 'Last name must be at least 2 characters');
    return false;
  }
  if (!isValidEmail(data.email)) {
    showMessage('error', 'Please enter a valid email address');
    return false;
  }
  if (data.pin.length !== 4 || !isNumeric(data.pin)) {
    showMessage('error', 'PIN must be exactly 4 digits');
    return false;
  }
  if (data.initialDeposit < 100) {
    showMessage('error', 'Initial deposit must be at least $100');
    return false;
  }
  if (isEmailExists(data.email)) {
    showMessage('error', 'Email address already exists');
    return false;
  }
  return true;
}

// Login functionality
function handleLogin(e) {
  e.preventDefault();
  showLoading();
  
  const accountNumber = document.getElementById('loginAccountNumber').value.trim();
  const pin = document.getElementById('loginPin').value;
  
  setTimeout(() => {
    const account = getAccountByNumber(accountNumber);
    
    if (!account) {
      hideLoading();
      showMessage('error', 'Account not found');
      return;
    }
    
    if (account.pin !== pin) {
      hideLoading();
      showMessage('error', 'Invalid PIN');
      return;
    }
    
    if (!account.isActive) {
      hideLoading();
      showMessage('error', 'Account is not active');
      return;
    }
    
    // Login successful
    currentAccount = account;
    currentUser = getCustomerById(account.customerId);
    localStorage.setItem('currentAccount', JSON.stringify(account));
    
    hideLoading();
    showMessage('success', 'Login successful!');
    
    // Reset form and show dashboard
    document.getElementById('loginForm').reset();
    setTimeout(() => {
      showDashboard();
    }, 1000);
  }, 1000);
}

function showDashboard() {
  showPage('dashboardPage');
  updateDashboard();
}

function updateDashboard() {
  if (!currentUser || !currentAccount) return;
  
  // Refresh account data
  currentAccount = getAccountByNumber(currentAccount.accountNumber);
  
  document.getElementById('welcomeText').textContent = 
    `Welcome back, ${currentUser.firstName} ${currentUser.lastName}!`;
  document.getElementById('balanceAmount').textContent = 
    formatCurrency(currentAccount.balance);
  document.getElementById('dashboardAccountNumber').textContent = 
    currentAccount.accountNumber;
  document.getElementById('dashboardAccountType').textContent = 
    currentAccount.accountType;
}

// Transaction Functions
function handleDeposit(e) {
  e.preventDefault();
  showLoading();
  
  const amount = parseFloat(document.getElementById('depositAmount').value);
  const description = document.getElementById('depositDescription').value.trim() || 'Deposit';
  
  if (amount <= 0) {
    hideLoading();
    showMessage('error', 'Amount must be greater than 0');
    return;
  }
  
  setTimeout(() => {
    try {
      // Update account balance
      currentAccount.balance += amount;
      updateAccount(currentAccount);
      
      // Create transaction record
      const transaction = {
        id: generateTransactionId(),
        fromAccount: currentAccount.accountNumber,
        toAccount: null,
        type: 'deposit',
        amount: amount,
        description: description,
        timestamp: new Date().toISOString()
      };
      saveTransaction(transaction);
      
      hideLoading();
      showMessage('success', `Successfully deposited ${formatCurrency(amount)}`);
      
      // Reset form and update dashboard
      document.getElementById('depositForm').reset();
      updateDashboard();
      
    } catch (error) {
      hideLoading();
      showMessage('error', 'Failed to process deposit. Please try again.');
    }
  }, 1000);
}

function handleWithdraw(e) {
  e.preventDefault();
  showLoading();
  
  const amount = parseFloat(document.getElementById('withdrawAmount').value);
  const description = document.getElementById('withdrawDescription').value.trim() || 'Withdrawal';
  
  if (amount <= 0) {
    hideLoading();
    showMessage('error', 'Amount must be greater than 0');
    return;
  }
  
  if (amount > currentAccount.balance) {
    hideLoading();
    showMessage('error', 'Insufficient funds');
    return;
  }
  
  setTimeout(() => {
    try {
      // Update account balance
      currentAccount.balance -= amount;
      updateAccount(currentAccount);
      
      // Create transaction record
      const transaction = {
        id: generateTransactionId(),
        fromAccount: currentAccount.accountNumber,
        toAccount: null,
        type: 'withdraw',
        amount: amount,
        description: description,
        timestamp: new Date().toISOString()
      };
      saveTransaction(transaction);
      
      hideLoading();
      showMessage('success', `Successfully withdrew ${formatCurrency(amount)}`);
      
      // Reset form and update dashboard
      document.getElementById('withdrawForm').reset();
      updateDashboard();
      
    } catch (error) {
      hideLoading();
      showMessage('error', 'Failed to process withdrawal. Please try again.');
    }
  }, 1000);
}

function handleTransfer(e) {
  e.preventDefault();
  showLoading();
  
  const toAccountNumber = document.getElementById('transferToAccount').value.trim();
  const amount = parseFloat(document.getElementById('transferAmount').value);
  const description = document.getElementById('transferDescription').value.trim() || 'Transfer';
  
  if (amount <= 0) {
    hideLoading();
    showMessage('error', 'Amount must be greater than 0');
    return;
  }
  
  if (amount > currentAccount.balance) {
    hideLoading();
    showMessage('error', 'Insufficient funds');
    return;
  }
  
  if (toAccountNumber === currentAccount.accountNumber) {
    hideLoading();
    showMessage('error', 'Cannot transfer to the same account');
    return;
  }
  
  const toAccount = getAccountByNumber(toAccountNumber);
  if (!toAccount) {
    hideLoading();
    showMessage('error', 'Recipient account not found');
    return;
  }
  
  if (!toAccount.isActive) {
    hideLoading();
    showMessage('error', 'Recipient account is not active');
    return;
  }
  
  setTimeout(() => {
    try {
      // Update balances
      currentAccount.balance -= amount;
      toAccount.balance += amount;
      
      updateAccount(currentAccount);
      updateAccount(toAccount);
      
      // Create transaction record
      const transaction = {
        id: generateTransactionId(),
        fromAccount: currentAccount.accountNumber,
        toAccount: toAccountNumber,
        type: 'transfer',
        amount: amount,
        description: description,
        timestamp: new Date().toISOString()
      };
      saveTransaction(transaction);
      
      hideLoading();
      showMessage('success', `Successfully transferred ${formatCurrency(amount)} to ${toAccountNumber}`);
      
      // Reset form and update dashboard
      document.getElementById('transferForm').reset();
      updateDashboard();
      
    } catch (error) {
      hideLoading();
      showMessage('error', 'Failed to process transfer. Please try again.');
    }
  }, 1000);
}

// Transaction History
function loadTransactionHistory() {
  const transactions = getTransactionsByAccount(currentAccount.accountNumber);
  const tableBody = document.getElementById('transactionTableBody');
  
  if (transactions.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found</td></tr>';
    return;
  }
  
  // Sort transactions by date (oldest first for balance calculation)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Calculate running balance for each transaction
  let runningBalance = 0;
  const transactionsWithBalance = sortedTransactions.map((transaction, index) => {
    let balanceChange = 0;
    
    if (transaction.type === 'deposit') {
      balanceChange = transaction.amount;
    } else if (transaction.type === 'withdraw') {
      balanceChange = -transaction.amount;
    } else if (transaction.type === 'transfer') {
      if (transaction.fromAccount === currentAccount.accountNumber) {
        balanceChange = -transaction.amount;
      } else {
        balanceChange = transaction.amount;
      }
    }
    
    runningBalance += balanceChange;
    
    return {
      ...transaction,
      balanceAfter: runningBalance,
      balanceChange: balanceChange
    };
  });
  
  // Reverse to show newest first
  transactionsWithBalance.reverse();
  
  tableBody.innerHTML = transactionsWithBalance.map(transaction => {
    const date = new Date(transaction.timestamp).toLocaleDateString();
    const time = new Date(transaction.timestamp).toLocaleTimeString();
    
    let amountDisplay = '';
    let amountClass = '';
    
    if (transaction.balanceChange > 0) {
      amountDisplay = `+${formatCurrency(Math.abs(transaction.balanceChange))}`;
      amountClass = 'amount-positive';
    } else if (transaction.balanceChange < 0) {
      amountDisplay = `-${formatCurrency(Math.abs(transaction.balanceChange))}`;
      amountClass = 'amount-negative';
    } else {
      amountDisplay = formatCurrency(Math.abs(transaction.balanceChange));
      amountClass = 'amount-neutral';
    }
    
    return `
      <tr>
        <td>${date}<br><small>${time}</small></td>
        <td><span class="transaction-type ${transaction.type}">${transaction.type}</span></td>
        <td>${transaction.description}</td>
        <td class="${amountClass}">${amountDisplay}</td>
        <td>${formatCurrency(transaction.balanceAfter)}</td>
      </tr>
    `;
  }).join('');
}

function filterTransactions() {
  const filterValue = document.getElementById('transactionFilter').value;
  const rows = document.querySelectorAll('#transactionTableBody tr');
  
  rows.forEach(row => {
    if (filterValue === 'all') {
      row.style.display = '';
    } else {
      const typeCell = row.querySelector('.transaction-type');
      if (typeCell && typeCell.textContent === filterValue) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

// Logout function
function logout() {
  localStorage.removeItem('currentAccount');
  currentUser = null;
  currentAccount = null;
  showPage('landingPage');
  showMessage('info', 'You have been logged out successfully');
}

// Data Management Functions
function getCustomers() {
  return JSON.parse(localStorage.getItem('bankCustomers') || '[]');
}

function getAccounts() {
  return JSON.parse(localStorage.getItem('bankAccounts') || '[]');
}

function getTransactions() {
  return JSON.parse(localStorage.getItem('bankTransactions') || '[]');
}

function saveCustomer(customer) {
  const customers = getCustomers();
  customers.push(customer);
  localStorage.setItem('bankCustomers', JSON.stringify(customers));
}

function saveAccount(account) {
  const accounts = getAccounts();
  accounts.push(account);
  localStorage.setItem('bankAccounts', JSON.stringify(accounts));
}

function updateAccount(account) {
  const accounts = getAccounts();
  const index = accounts.findIndex(acc => acc.accountNumber === account.accountNumber);
  if (index !== -1) {
    accounts[index] = account;
    localStorage.setItem('bankAccounts', JSON.stringify(accounts));
  }
}

function saveTransaction(transaction) {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem('bankTransactions', JSON.stringify(transactions));
}

function getCustomerById(customerId) {
  const customers = getCustomers();
  return customers.find(customer => customer.id === customerId);
}

function getAccountByNumber(accountNumber) {
  const accounts = getAccounts();
  return accounts.find(account => account.accountNumber === accountNumber);
}

function getTransactionsByAccount(accountNumber) {
  const transactions = getTransactions();
  return transactions.filter(transaction => 
    transaction.fromAccount === accountNumber || transaction.toAccount === accountNumber
  );
}

function isEmailExists(email) {
  const customers = getCustomers();
  return customers.some(customer => customer.email.toLowerCase() === email.toLowerCase());
}

// Utility Functions
function generateCustomerId() {
  const customers = getCustomers();
  const maxId = customers.reduce((max, customer) => {
    const num = parseInt(customer.id.replace('CUST', ''));
    return num > max ? num : max;
  }, 0);
  return `CUST${String(maxId + 1).padStart(3, '0')}`;
}

function generateAccountNumber() {
  const accounts = getAccounts();
  const maxNum = accounts.reduce((max, account) => {
    const num = parseInt(account.accountNumber.replace('ACC', ''));
    return num > max ? num : max;
  }, 1234567);
  return `ACC${String(maxNum + 1).padStart(9, '0')}`;
}

function generateTransactionId() {
  const transactions = getTransactions();
  const maxId = transactions.reduce((max, transaction) => {
    const num = parseInt(transaction.id.replace('TXN', ''));
    return num > max ? num : max;
  }, 0);
  return `TXN${String(maxId + 1).padStart(3, '0')}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isNumeric(str) {
  return /^\d+$/.test(str);
}

// UI Helper Functions
function showMessage(type, message) {
  const container = document.getElementById('messageContainer');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  container.appendChild(messageDiv);
  
  // Auto remove message after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 5000);
}

function showLoading() {
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}