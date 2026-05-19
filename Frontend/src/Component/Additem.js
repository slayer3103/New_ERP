import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Breadcrumbs,
  InputBase,
  IconButton,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

export default function AddItems() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "Product",
    product_name: "",
    sku: "",
    tax_applicable: "",
    status: "Active",
    category: "",
    unit: "",
    sale_price: "",
    sale_discount: "",
    sale_discount_type: "%",
    sale_description: "",
    purchase_price: "",
    purchase_discount: "",
    purchase_discount_type: "%",
    purchase_description: "",
    preferred_vendor: "",
  });

  // Updated: units as state - will be fetched from backend
  const [units, setUnits] = useState([]);
  
  // New states for Add Unit dialog
  const [openAddUnitDialog, setOpenAddUnitDialog] = useState(false);
  const [newUnit, setNewUnit] = useState("");
  const [unitSelectOpen, setUnitSelectOpen] = useState(false);

  const [taxList, setTaxList] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Fetch Units from backend
  useEffect(() => {
    axios
      .get(`${BASE_URL}/product_units`)
      .then((res) => {
        const unitNames = res.data.map(unit => unit.unit_name);
        setUnits(unitNames);
      })
      .catch((err) => {
        console.error("Error fetching units:", err);
        // Fallback to default units if API fails
        setUnits(["cm", "mm", "kg", "pcs", "liters"]);
      });
  }, []);

  // Fetch Taxes
  useEffect(() => {
    axios
      .get(`${BASE_URL}/taxes`)
      .then((res) => {
        const activeTaxes = res.data.filter((tax) => tax.status === "Active");
        setTaxList(activeTaxes);
      })
      .catch((err) => console.error("Error fetching taxes:", err));
  }, []);

  // Fetch Vendors
  useEffect(() => {
    axios
      .get(`${BASE_URL}/vendors`)
      .then((res) => setVendors(res.data))
      .catch((err) => {
        console.error("Error fetching vendors:", err);
        setVendors([]);
      });
  }, []);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.product_name || !formData.product_name.trim()) e.product_name = 'Product name is required';
    if (formData.sale_price && (isNaN(formData.sale_price) || parseFloat(formData.sale_price) < 0))
      e.sale_price = 'Must be a positive number';
    if (formData.purchase_price && (isNaN(formData.purchase_price) || parseFloat(formData.purchase_price) < 0))
      e.purchase_price = 'Must be a positive number';
    
    if (formData.sale_discount) {
      if (isNaN(formData.sale_discount) || parseFloat(formData.sale_discount) < 0) {
        e.sale_discount = 'Must be a positive number';
      } else if (formData.sale_discount_type === '%' && parseFloat(formData.sale_discount) > 100) {
        e.sale_discount = 'Percentage cannot exceed 100';
      }
    }

    if (formData.purchase_discount) {
      if (isNaN(formData.purchase_discount) || parseFloat(formData.purchase_discount) < 0) {
        e.purchase_discount = 'Must be a positive number';
      } else if (formData.purchase_discount_type === '%' && parseFloat(formData.purchase_discount) > 100) {
        e.purchase_discount = 'Percentage cannot exceed 100';
      }
    }
    return e;
  };

  const generateSKU = () => {
    const prefix =
      formData.product_name?.substring(0, 3).toUpperCase() || "SKU";
    const uniqueNumber = Date.now().toString().slice(-5);
    return `${prefix}${uniqueNumber}`;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    const dataToSend = { ...formData, sku: generateSKU() };
    try {
      await axios.post(`${BASE_URL}/products`, dataToSend);
      navigate("/item-list");
    } catch (error) {
      console.error("Error saving item:", error);
      alert(error.response?.data?.error || 'Error saving item');
    }
  };

  // New handlers for Add Unit
  const handleOpenAddUnit = () => {
    setOpenAddUnitDialog(true);
    setNewUnit(""); // Reset input
  };

  const handleCloseAddUnit = () => {
    setOpenAddUnitDialog(false);
    setNewUnit("");
  };

  const handleAddUnit = async () => {
    if (newUnit.trim() && !units.includes(newUnit.trim())) {
      const trimmedUnit = newUnit.trim();
      
      try {
        // Save to backend first
        await axios.post(`${BASE_URL}/product_units`, {
          unit_name: trimmedUnit
        });
        
        // Update local state only if backend save is successful
        setUnits((prev) => [...prev, trimmedUnit]);
        
        // Auto-select the newly added unit
        setFormData((prev) => ({ ...prev, unit: trimmedUnit }));
        
        // Open the dropdown to show the new unit
        setTimeout(() => {
          setUnitSelectOpen(true);
        }, 100);
        
      } catch (error) {
        console.error("Error saving unit to backend:", error);
        // You can add a toast notification here for user feedback
        alert("Error saving unit. Please try again.");
      }
    }
    handleCloseAddUnit();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar active="Items" />
      <Box sx={{ flex: 1, bgcolor: "#f9fafc", minHeight: "100vh" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 1,
            px: 3,
          }}
        >
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Typography color="text.secondary" fontSize="14px">
              Product & Services
            </Typography>
            <Typography color="text.primary" fontWeight={600} fontSize="14px">
              Add
            </Typography>
          </Breadcrumbs>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: "999px",
                border: "1px solid #e0e0e0",
                bgcolor: "#f9fafb",
                width: 240,
              }}
            >
              <SearchIcon sx={{ fontSize: 20, color: "#999" }} />
              <InputBase
                placeholder="Search anything here..."
                sx={{ ml: 1, fontSize: 14, flex: 1 }}
              />
            </Paper>
            <IconButton
              sx={{
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                bgcolor: "#f9fafb",
                p: 1,
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 20, color: "#666" }} />
            </IconButton>
            <Box display="flex" alignItems="center" gap={1}>
              <NotificationsNoneIcon />
              <UserMenu />
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <Box sx={{ px: 4, py: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              New Product & Services
            </Typography>

            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Customer Type</FormLabel>
            <RadioGroup
              row
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Product"
                control={<Radio />}
                label="Product"
              />
              <FormControlLabel
                value="Service"
                control={<Radio />}
                label="Service"
              />
            </RadioGroup>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  name="product_name"
                  label="Product Name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  error={!!errors.product_name}
                  helperText={errors.product_name || ''}
                />
              </Grid>

              <Grid item xs="auto" >
                <TextField
                  select
                  size="small"
                  name="tax_applicable"
                  label="Tax Applicable"
                  value={formData.tax_applicable|| ""}
                  onChange={(e) => {
                    if (e.target.value === "add_new_tax") {
                      navigate("/add-tax");
                    } else {
                      handleChange(e);
                    }
                  }}
                  sx={{minWidth:200 }}
                >
                  <MenuItem value="">None</MenuItem>
                  {taxList.map((tax) => (
                    <MenuItem key={tax.id} value={tax.id}>
                      {tax.tax_name} {tax.tax_rate}%
                    </MenuItem>
                  ))}
                  <MenuItem
                    value="add_new_tax"
                    style={{ fontStyle: "italic", color: "#004085" }}
                  >
                    + Add New Tax
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="status"
                  label="Status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  name="category"
                  label="Category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs="auto">
                {/* Updated: Dynamic units dropdown with Add Unit button */}
                <Box sx={{ display: "flex", alignItems: "end", gap: 1 }}>
                  <TextField
                    select
                    size="small"
                    name="unit"
                    label="Unit"
                    value={formData.unit || ""}
                    onChange={handleChange}
                    open={unitSelectOpen}
                    onOpen={() => setUnitSelectOpen(true)}
                    onClose={() => setUnitSelectOpen(false)}
                    sx={{ minWidth: 100 }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Approximately 4 items (48px each + padding)
                            overflowY: 'auto',
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Unit</MenuItem>
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpenAddUnit}
                    sx={{ minWidth: "auto", px: 2, textTransform: "none" }}
                  >
                    + Add Unit
                  </Button>
                </Box>
              </Grid>

              {/* Sales Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Sales Information</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  step="0.01"
                  label="Sale Price"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  error={!!errors.sale_price}
                  helperText={errors.sale_price || ''}
                  inputProps={{ inputMode: 'numeric', min: 0 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  step="0.01"
                  label="Sale Discount"
                  name="sale_discount"
                  value={formData.sale_discount}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                  error={!!errors.sale_discount}
                  helperText={errors.sale_discount || ''}
                  inputProps={{ inputMode: 'numeric', min: 0, max: 100 }}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sale Discount Type"
                  name="sale_discount_type"
                  value={formData.sale_discount_type}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="%">%</MenuItem>
                  <MenuItem value="Flat">Flat</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Sale Description"
                  name="sale_description"
                  value={formData.sale_description}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                />
              </Grid>

              {/* Purchase Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  Purchase Information
                </Typography>
                {/* FIXED: Added type="number" to restrict to numbers only */}
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  step="0.01"
                  label="Purchase Price"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  error={!!errors.purchase_price}
                  helperText={errors.purchase_price || ''}
                  inputProps={{ inputMode: 'numeric', min: 0 }}
                />
                {/* FIXED: Same for discount */}
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  step="0.01"
                  label="Purchase Discount"
                  name="purchase_discount"
                  value={formData.purchase_discount}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                  error={!!errors.purchase_discount}
                  helperText={errors.purchase_discount || ''}
                  inputProps={{ inputMode: 'numeric', min: 0, max: 100 }}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Purchase Discount Type"
                  name="purchase_discount_type"
                  value={formData.purchase_discount_type}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="%">%</MenuItem>
                  <MenuItem value="Flat">Flat</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Purchase Description"
                  name="purchase_description"
                  value={formData.purchase_description}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Preferred Vendor"
                  name="preferred_vendor"
                  value={formData.preferred_vendor}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                >
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.vendor_name}>
                      {vendor.vendor_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                sx={{ textTransform: "none", borderRadius: 2, px: 4 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#004085",
                  "&:hover": { bgcolor: "#003366" },
                }}
              >
                Add
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* New: Add Unit Dialog */}
        <Dialog open={openAddUnitDialog} onClose={handleCloseAddUnit}>
          <DialogTitle>Add New Unit</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the name of the new unit (e.g., "meters").
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Unit Name"
              type="text"
              fullWidth
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddUnit}>Cancel</Button>
            <Button onClick={handleAddUnit} disabled={!newUnit.trim()}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}