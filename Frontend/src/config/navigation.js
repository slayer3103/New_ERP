import {
  Dashboard,
  Category,
  People,
  RequestQuote,
  ReceiptLong,
  ShoppingCart,
  Business,
  Construction,
  Gavel,
  EventNote,
  BarChart,
  Payments,
} from '@mui/icons-material';

export const DRAWER_WIDTH = 260;

export const menuItems = [
  {
    text: 'Dashboard',
    icon: Dashboard,
    path: '/dashboard',
    matchPaths: ['/dashboard'],
    roles: ['admin', 'superadmin'],
  },
  {
    text: 'Product & Services',
    icon: Category,
    path: '/items',
    matchPaths: ['/items', '/add-items', '/item-list'],
    roles: ['superadmin'],
  },
];

export const salesItems = [
  {
    text: 'Customers',
    icon: People,
    path: '/customer',
    matchPaths: ['/customer', '/add-customer', '/customer-list'],
    roles: ['admin', 'superadmin'],
  },
  {
    text: 'Quotation',
    icon: RequestQuote,
    path: '/Quotation',
    matchPaths: ['/Quotation', '/add-Quotation', '/Quotation-list', '/editQuotation'],
    roles: ['superadmin'],
  },
  {
    text: 'Invoice',
    icon: ReceiptLong,
    path: '/invoice',
    matchPaths: ['/invoice', '/new-invoice', '/invoice-list', '/edit-invoice'],
    roles: ['admin', 'superadmin'],
  },
];

export const purchaseItems = [
  {
    text: 'Purchase Order',
    icon: ShoppingCart,
    path: '/purchase-order',
    matchPaths: ['/purchase-order', '/add-purchase-order', '/purchase-order-list', '/edit-purchase'],
    roles: ['superadmin'],
  },
  {
    text: 'Vendors',
    icon: Business,
    path: '/vendors',
    matchPaths: ['/vendors', '/add-vendor', '/vendor-list', '/edit-vendor'],
    roles: ['superadmin'],
  },
  {
    text: 'Work Order',
    icon: Construction,
    path: '/Work-Order',
    matchPaths: ['/Work-Order', '/add-Work-Order', '/Work-Order-list', '/edit-work-order'],
    roles: ['admin', 'superadmin'],
  },
];

export const othersItems = [
  {
    text: 'Tax',
    icon: Gavel,
    path: '/Tax',
    matchPaths: ['/Tax', '/add-Tax', '/Tax-list', '/edit-tax'],
    roles: ['superadmin'],
  },
  {
    text: 'Financial Year Settings',
    icon: EventNote,
    path: '/add-financial-year-settings',
    matchPaths: ['/add-financial-year-settings'],
    roles: ['superadmin'],
  },
  {
    text: 'Report & Analytics',
    icon: BarChart,
    path: '/Report-and-analytics',
    matchPaths: [
      '/Report-and-analytics',
      '/sales-analytics',
      '/sales-by-customers',
      '/sales-by-products',
      '/gst-summary',
      '/tax-liability',
      '/outstanding-invoices',
      '/payment-receipts',
      '/po-summaries',
      '/vendor-spend-analysis',
      '/report',
    ],
    roles: ['superadmin'],
  },
  {
    text: 'Payment Settings',
    icon: Payments,
    path: '/Payment-settings',
    matchPaths: ['/Payment-settings', '/Add-Payment-settings'],
    roles: ['superadmin'],
  },
];

export const navSections = [
  { title: 'Menu', items: menuItems },
  { title: 'Sales', items: salesItems },
  { title: 'Purchases', items: purchaseItems },
  { title: 'Others', items: othersItems },
];
