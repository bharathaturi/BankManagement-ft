# Bank Management System

## Description
A comprehensive full-stack web application that allows users to seamlessly manage their banking activities. The platform provides a secure and intuitive interface for comprehensive account creation with KYC verification, profile management, investment tracking, loan EMI payments, and managing service subscriptions. 

## Live Demo
- **Frontend App:** https://bank-management-ft-chw2.vercel.app/
- **Backend API Server:** https://bankmanagement-bk.onrender.com

## Features
- Secure User Authentication and Authorization
- Comprehensive Account Creation with KYC Details
- Intuitive Dashboard with Quick Actions
- Real-time Profile and Account Management
- Investment Portfolio Tracking
- Loan EMI Payment Processing
- Manage and Track Subscriptions
- Responsive Design for Web and Mobile Devices

## Tech Stack

### Frontend
- **React:** UI library
- **Material UI:** UI components, styling, and icons (`@mui/material`, `@mui/icons-material`, `@emotion`)
- **React Router:** Client-side routing (`react-router-dom`)
- **React Hook Form:** Form state management and validation
- **Axios:** API requests
- **jsPDF & AutoTable:** PDF generation

### Backend
- **Java:** Version 21
- **Spring Boot:** Framework for building the RESTful API (Version 3.5.4)
  - **Spring Data JPA:** For database mapping and interactions
  - **Spring Security:** For securing API endpoints and managing authentication
  - **Spring Web:** For building web applications and RESTful APIs
  - **Spring Validation:** For input validation and error handling
- **PostgreSQL:** Primary relational database
- **Maven:** Build automation and dependency management

## Installation

### Prerequisites
- Node.js and npm
- Java SDK (JDK 17 or higher recommended)
- Maven
- PostgreSQL

### Backend Setup
1. Navigate to the backend directory (e.g., `bank-backend`):
   ```bash
   cd bank-backend
   ```
2. Configure your PostgreSQL database connection in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/your_database_name
   spring.datasource.username=your_postgres_username
   spring.datasource.password=your_postgres_password
   ```
3. Build and run the Spring Boot application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend repository directory:
   ```bash
   cd bank-frontend/frontend
   ```
2. Install the necessary frontend dependencies:
   ```bash
   npm install
   ```
3. Setup any required environment variables (e.g., `.env` file with `REACT_APP_API_URL=http://localhost:8080`).
4. Start the React development server:
   ```bash
   npm start
   ```

## Usage
1. Open your web browser and navigate to the frontend URL (typically `http://localhost:3000`).
2. Click on "Create Account" or "Register" to create a new banking profile by providing your personal and KYC details.
3. Log in using your newly created credentials.
4. Using the main dashboard, navigate through quick actions to review your profile, track investments, pay EMIs, and manage various subscriptions.

## Author
Aturi Bharath
