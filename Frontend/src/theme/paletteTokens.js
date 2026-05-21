// Design system tokens — single source of truth
export const tokens = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  sidebarBg: '#0F172A',
  pageBg: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  mutedSurface: '#F1F5F9',
  sidebarText: '#94A3B8',
  sidebarTextMuted: '#64748B',
  sidebarHover: 'rgba(255, 255, 255, 0.06)',

  // ── Report & Analytics Tokens ──
  // Surface variants
  surfaceSubtle: '#F8FAFC',
  surfaceHover: '#F1F5F9',
  cardHover: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Chart grid & axis
  chartGrid: '#E2E8F0',
  chartAxisText: '#64748B',

  // Table
  tableHeaderBg: '#F8FAFC',
  tableHeaderText: '#334155',
  tableBorder: '#E2E8F0',
  tableRowHover: '#F1F5F9',

  // Curated chart color palette (WCAG-compliant, visually distinct)
  chartBlue: '#3B82F6',
  chartGreen: '#10B981',
  chartAmber: '#F59E0B',
  chartViolet: '#8B5CF6',
  chartRose: '#EF4444',
  chartCyan: '#06B6D4',
  chartPink: '#EC4899',
  chartIndigo: '#6366F1',
  chartTeal: '#14B8A6',
  chartOrange: '#F97316',

  // Status colors (for chips / badges)
  statusPaid: '#10B981',
  statusDraft: '#94A3B8',
  statusPartial: '#F59E0B',
  statusOverdue: '#EF4444',

  // Page header gradient presets
  gradientSlate: ['#1E293B', '#334155'],
  gradientBlue: ['#3B82F6', '#1D4ED8'],
  gradientTeal: ['#0F766E', '#115E59'],
  gradientIndigo: ['#1E293B', '#4338CA'],
  gradientAmber: ['#78350F', '#92400E'],
  gradientEmerald: ['#10B981', '#059669'],
  gradientViolet: ['#7C3AED', '#4F46E5'],
  gradientPurple: ['#667EEA', '#764BA2'],
};

// Ordered chart palette for easy iteration
export const CHART_PALETTE = [
  tokens.chartBlue,
  tokens.chartGreen,
  tokens.chartAmber,
  tokens.chartViolet,
  tokens.chartRose,
  tokens.chartCyan,
  tokens.chartPink,
  tokens.chartIndigo,
  tokens.chartTeal,
  tokens.chartOrange,
];

export default tokens;
