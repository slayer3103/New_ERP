import {
  Box,
  Paper,
  Typography,
  Chip,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import ReportSearchBar from './ReportSearchBar';
import { tokens } from '../../theme/paletteTokens';

/**
 * Shared wrapper for all report data tables.
 * Integrates a header with title, row count, optional search, and horizontal scroll.
 *
 * @param {string}           title             – Table section title
 * @param {string[]}         columns           – Array of column header labels
 * @param {Object[]}         columnAligns      – Optional array of {label, align} for column alignment
 * @param {React.ReactNode}  children          – TableBody content
 * @param {string}           searchValue       – Current search text (optional)
 * @param {function}         onSearchChange    – Search change handler (optional)
 * @param {string}           searchPlaceholder – Placeholder for search input
 * @param {number}           rowCount          – Number of visible rows for the chip
 * @param {string}           accentColor       – Accent color for icons/chips
 * @param {number}           minWidth          – Minimum table width for scroll (default 700)
 */
export default function ReportTable({
  title,
  columns = [],
  columnAligns = [],
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  rowCount,
  accentColor = tokens.chartBlue,
  minWidth = 700,
}) {
  // Build aligned columns: merge columns + columnAligns
  const cols = columns.map((col, i) => {
    if (typeof col === 'object') return col;
    const alignObj = columnAligns[i];
    return {
      label: col,
      align: alignObj?.align || (i === 0 ? 'left' : 'left'),
    };
  });

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${tokens.tableBorder}`,
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${tokens.surfaceHover}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <TableChartIcon sx={{ color: accentColor, fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="bold" color={tokens.textPrimary}>
            {title}
          </Typography>
          {rowCount != null && (
            <Chip
              label={`${rowCount} rows`}
              size="small"
              sx={{
                bgcolor: `${accentColor}12`,
                color: accentColor,
                fontWeight: 'bold',
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
        {onSearchChange && (
          <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 240 } }}>
            <ReportSearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Table with horizontal scroll */}
      <TableContainer>
        <Table sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {cols.map((col, i) => (
                <TableCell key={i} align={col.align}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {children}
        </Table>
      </TableContainer>
    </Paper>
  );
}
