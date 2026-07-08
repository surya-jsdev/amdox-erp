import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login.js';
import Registration from './pages/Auth/Registration.js';
import FinanceLedger from './pages/Finance/FinanceLedger.js';
import AdminUsers from './pages/Admin/AdminUsers.js';
import Hrpayroll from './pages/Hr/Hrpayroll.js';
import Supplychain from './pages/Supplychain/Supplychain.js';
import PurchaseOrderPage from './pages/Supplychain/PurchaseOrder';
import Inventory from './pages/Supplychain/Inventory.js';
import Profile from './pages/Profile/Profile.js';
import ProjectPage from './pages/Project/Project.js';
import BusinessIntelligence from './pages/BusinessIntelligence/BusinessIntelligence';
import AiForecasting from './pages/AiForecasting/AiForecasting';
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.js'));

function App() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-blue-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-900 border-t-blue-400"></div>
        <p className="mt-4 text-sm font-medium text-blue-300">Loading...</p>
      </div>
    }>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/Dashboard" /> : <Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/dashboard' element={<Navigate to="/Dashboard" replace />} />
        <Route path='/finance-ledger' element={<FinanceLedger />} />
        <Route path='/vendors' element={<Supplychain />} />
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