import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './Component/Login';
import Dashboard from './Component/Dashboard';
import InvoicePage from './Component/Invoice';
import NewInvoicePage from './Component/NewInvoice';
import Invoicelist from './Component/Invoicelist';
import CustomerPage from './Component/Customer';
import AddCustomerForm from './Component/Addcustomerform';
import CustomerList from './Component/Customerlist';
import ItemsPage from './Component/Items';
import AddItem from './Component/Additem';
import ItemList from './Component/Itemlist';
import FirstTimePurchaseOrder from './Component/Purchaseorder';
import PurchaseOrderForm from './Component/NewpurchaseOrder';
import PurchaseOrderList from './Component/Purchaseorderlist';
import NewVendorForm from './Component/Addvendors';
import Vendors from './Component/Vendors';
import VendorListPage from './Component/Vendorslist';
import Quotation from './Component/Quotation';
import NewQuotation from './Component/AddQuatation';
import QuotationListPage from './Component/Quotationlist';
import Tax from './Component/Tax';
import AddTax from './Component/AddTax';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Taxlist from './Component/Taxlist';
import WorkOrder from './Component/WorkOrder';
import NewWorkOrder from './Component/AddWorkOrder';
import WorkOrderlist from './Component/Workorderlist';
import ProFormaInvoice from './Component/ProFormaInvoice';
import NewProFormaInvoice from './Component/AddproFrmainvoice';
import ProformaInvoicelist from './Component/Proformainvoicelist';
import FinancialYearSettings from './Component/Financialyearsetting';
import PaymentsSettings from './Component/Paymentsetting';
import AddPaymentsEntry from './Component/Addpaymententry';
import ReportsAndAnalytics from './Component/ReportandAnalytics';
import ReportView from './Component/ReportView';
import SalesAnalytics from './Component/SalesAnalytics';
import SalesByCustomers from './Component/SalesByCustomers';
import SalesByProducts from './Component/SalesByProducts';
import GstSummary from './Component/GstSummary';
import TaxLiability from './Component/TaxLiability';
import OutstandingInvoices from './Component/OutstandingInvoices';
import PaymentReceipts from './Component/PaymentReceipts';
import POSummaries from './Component/POSummaries';
import VendorSpendAnalysis from './Component/VendorSpendAnalysis';
import FinancialYearGuard from './Component/financial_year_check';
import AddFinancialYear from './Component/add_financial_year';
import FinancialYearMain from './Component/financial-year-home';
import EditTax from './Component/EditTax';
import EditQuotationPage from './Component/EditQuotationPage';
import EditInvoicePage from './Component/EditInvoicePage';
import EditPurchaseOrderPage from './Component/EditPurchaseOrderPage';
import EditVendorDialog from './Component/EditVendor';
import EditWorkOrderPage from './Component/EditWorkOrder';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Hide Invoice and Quotation sections for Admin role
  //  

  return children;
};

// Public Route Component (Redirects logged-in users to dashboard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <FinancialYearGuard />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/invoice" element={
            <ProtectedRoute>
              <Invoicelist />
            </ProtectedRoute>
          } />
          <Route path="/new-invoice" element={
            <ProtectedRoute>
              <NewInvoicePage />
            </ProtectedRoute>
          } />
          <Route path="/invoice-list" element={
            <ProtectedRoute>
              <Invoicelist />
            </ProtectedRoute>
          } />
          <Route path="/customer" element={
            <ProtectedRoute>
              <CustomerPage />
            </ProtectedRoute>
          } />
          <Route path="/add-customer" element={
            <ProtectedRoute>
              <AddCustomerForm />
            </ProtectedRoute>
          } />
          <Route path="/customer-list" element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          } />
          <Route path="/items" element={
            <ProtectedRoute>
              <ItemsPage />
            </ProtectedRoute>
          } />
          <Route path="/add-items" element={
            <ProtectedRoute>
              <AddItem />
            </ProtectedRoute>
          } />
          <Route path="/item-list" element={
            <ProtectedRoute>
              <ItemList />
            </ProtectedRoute>
          } />
          <Route path="/purchase-order" element={
            <ProtectedRoute>
              <PurchaseOrderList />
            </ProtectedRoute>
          } />
          <Route path="/add-purchase-order" element={
            <ProtectedRoute>
              <PurchaseOrderForm />
            </ProtectedRoute>
          } />
          <Route path="/purchase-order-list" element={
            <ProtectedRoute>
              <PurchaseOrderList />
            </ProtectedRoute>
          } />
          <Route path="/edit-purchase/:id" element={
            <ProtectedRoute>
              <EditPurchaseOrderPage />
            </ProtectedRoute>
          } />
          <Route path="/vendors" element={
            <ProtectedRoute>
              <VendorListPage />
            </ProtectedRoute>
          } />
          <Route path="/add-vendor" element={
            <ProtectedRoute>
              <NewVendorForm />
            </ProtectedRoute>
          } />
          <Route path="/vendor-list" element={
            <ProtectedRoute>
              <VendorListPage />
            </ProtectedRoute>
          } />
          <Route path="/edit-vendor/:id" element={
            <ProtectedRoute>
              <EditVendorDialog />
            </ProtectedRoute>
          } />
          <Route path="/Quotation" element={
            <ProtectedRoute>
              <QuotationListPage />
            </ProtectedRoute>
          } />
          <Route path="/add-Quotation" element={
            <ProtectedRoute>
              <NewQuotation />
            </ProtectedRoute>
          } />
          <Route path="/editQuotation/:id" element={
            <ProtectedRoute>
              <EditQuotationPage />
            </ProtectedRoute>
          } />
          <Route path="/Quotation-list" element={
            <ProtectedRoute>
              <QuotationListPage />
            </ProtectedRoute>
          } />
          <Route path="/Tax" element={
            <ProtectedRoute>
              <Tax />
            </ProtectedRoute>
          } />
          <Route path="/add-Tax" element={
            <ProtectedRoute>
              <AddTax />
            </ProtectedRoute>
          } />
          <Route path="/Tax-list" element={
            <ProtectedRoute>
              <Taxlist />
            </ProtectedRoute>
          } />
          <Route path="/Work-Order" element={
            <ProtectedRoute>
              <WorkOrderlist />
            </ProtectedRoute>
          } />
          <Route path="/add-Work-Order" element={
            <ProtectedRoute>
              <NewWorkOrder />
            </ProtectedRoute>
          } />
          <Route path="/Work-Order-list" element={
            <ProtectedRoute>
              <WorkOrderlist />
            </ProtectedRoute>
          } />
          <Route path="/edit-work-order/:id" element={
            <ProtectedRoute>
              <EditWorkOrderPage />
            </ProtectedRoute>
          } />
          <Route path="/pro-forma-invoice" element={
            <ProtectedRoute>
              <ProformaInvoicelist />
            </ProtectedRoute>
          } />
          <Route path="/add-pro-forma-invoice" element={
            <ProtectedRoute>
              <NewProFormaInvoice />
            </ProtectedRoute>
          } />
          <Route path="/pro-forma-invoice-list" element={
            <ProtectedRoute>
              <ProformaInvoicelist />
            </ProtectedRoute>
          } />
          <Route path="/add-financial-year-settings" element={
            <ProtectedRoute>
              <FinancialYearMain />
            </ProtectedRoute>
          } />
          <Route path="/Payment-settings" element={
            <ProtectedRoute>
              <PaymentsSettings />
            </ProtectedRoute>
          } />
          <Route path="/Add-Payment-settings" element={
            <ProtectedRoute>
              <AddPaymentsEntry />
            </ProtectedRoute>
          } />
          <Route path="/Report-and-analytics" element={
            <ProtectedRoute>
              <ReportsAndAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/sales-analytics" element={
            <ProtectedRoute>
              <SalesAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/sales-by-customers" element={
            <ProtectedRoute>
              <SalesByCustomers />
            </ProtectedRoute>
          } />
          <Route path="/sales-by-products" element={
            <ProtectedRoute>
              <SalesByProducts />
            </ProtectedRoute>
          } />
          <Route path="/gst-summary" element={
            <ProtectedRoute>
              <GstSummary />
            </ProtectedRoute>
          } />
          <Route path="/tax-liability" element={
            <ProtectedRoute>
              <TaxLiability />
            </ProtectedRoute>
          } />
          <Route path="/outstanding-invoices" element={
            <ProtectedRoute>
              <OutstandingInvoices />
            </ProtectedRoute>
          } />
          <Route path="/report/:reportKey" element={
            <ProtectedRoute>
              <ReportView />
            </ProtectedRoute>
          } />
          <Route path="/payment-receipts" element={
            <ProtectedRoute>
              <PaymentReceipts />
            </ProtectedRoute>
          } />
          <Route path="/po-summaries" element={
            <ProtectedRoute>
              <POSummaries />
            </ProtectedRoute>
          } />
          <Route path="/vendor-spend-analysis" element={
            <ProtectedRoute>
              <VendorSpendAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/add/financial_year" element={
            <ProtectedRoute>
              <AddFinancialYear />
            </ProtectedRoute>
          } />
          <Route path="/edit-tax/:id" element={
            <ProtectedRoute>
              <EditTax />
            </ProtectedRoute>
          } />
          <Route path="/edit-invoice/:id" element={
            <ProtectedRoute>
              <EditInvoicePage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
