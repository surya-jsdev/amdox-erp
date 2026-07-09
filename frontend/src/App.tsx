import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Spinner from './components/Spinner.js';

const Registration = lazy(() => import('./pages/Auth/Registration.js'));
const FinanceLedger = lazy(() => import('./pages/Finance/FinanceLedger.js'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers.js'));
const Hrpayroll = lazy(() => import('./pages/Hr/Hrpayroll.js'));
const PurchaseOrderPage = lazy(() => import('./pages/Supplychain/PurchaseOrder'));
const Inventory = lazy(() => import('./pages/Supplychain/Inventory.js'));
const Profile = lazy(() => import('./pages/Profile/Profile.js'));
const ProjectPage = lazy(() => import('./pages/Project/Project.js'));
const BusinessIntelligence = lazy(() => import('./pages/BusinessIntelligence/BusinessIntelligence'));
const AiForecasting = lazy(() => import('./pages/AiForecasting/AiForecasting'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.js'));
const Login = lazy(() => import('./pages/Auth/Login.js'));
const Vendors = lazy(() => import('./pages/Supplychain/Vendors.js'));

function App() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <Suspense fallback={<Spinner/>}>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/Dashboard" /> : <Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/dashboard' element={<Navigate to="/Dashboard" replace />} />
        <Route path='/finance-ledger' element={<FinanceLedger />} />
        <Route path='/vendors' element={<Vendors />} />
        <Route path='/inventory' element={<Inventory />} />
        <Route path='/purchase-orders' element={<PurchaseOrderPage />} />
        <Route path='/projects' element={<ProjectPage />} />
        <Route path='/admin/users' element={<AdminUsers />} />
        <Route path='/hr-payroll' element={<Hrpayroll />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/business-intelligence' element={<BusinessIntelligence />} />
        <Route path='/ai-forecasting' element={<AiForecasting />} />
      </Routes>
    </Suspense>
  );
}

export default App;