import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import BASE_URL from '../config/api';

const statusOptions = ["Active", "Inactive"];
const unitOptions = ["kg", "cm", "pcs", "litre"];
const typeOptions = ["Product", "Service"];
const discountTypes = ["%", "Flat"];

export default function EditProductDialog({ open, onClose, product, onSave }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [taxList, setTaxList] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/vendors`)
      .then((res) => {
        console.log("Vendors loaded:", res.data);
        setVendors(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching vendors:", err);
        setVendors([]);
      });
  }, []);

  useEffect(() => {
    if (open) {
      console.log("Product data:", product);
      setFormData(product || {});
      axios
        .get(`${BASE_URL}/taxes`)
        .then((res) => {
          const activeTaxes = res.data.filter((tax) => tax.status === "Active");
          setTaxList(activeTaxes);
        })
        .catch((err) => console.error("Error fetching taxes:", err));
    }
  }, [open, product]);

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

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Product / Service</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Name"
              name="product_name"
              value={formData.product_name || ""}
              onChange={handleChange}
              error={!!errors.product_name}
              helperText={errors.product_name || ''}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SKU"
              name="sku"
              disabled
              value={formData.sku || ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type"
              name="type"
              select
              value={formData.type || ""}
              onChange={handleChange}
            >
              {typeOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Unit"
              name="unit"
              select
              value={formData.unit || ""}
              onChange={handleChange}
            >
              {unitOptions.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Status"
              name="status"
              select
              value={formData.status || ""}
              onChange={handleChange}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ✅ Tax Applicable */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Tax Applicable"
              name="tax_applicable"
              value={formData.tax_applicable || ""}
              onChange={handleChange}
              style={{ width: "200px" }}
            >
              <MenuItem value="None">None</MenuItem>
              {taxList.map((tax) => (
                <MenuItem key={tax.id} value={tax.id}>
                  {tax.tax_name} {tax.tax_rate}%
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sale Price"
              name="sale_price"
              type="number"
              value={formData.sale_price || ""}
              onChange={handleChange}
              error={!!errors.sale_price}
              helperText={errors.sale_price || ''}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sale Discount"
              name="sale_discount"
              type="number"
              value={formData.sale_discount || ""}
              onChange={handleChange}
              error={!!errors.sale_discount}
              helperText={errors.sale_discount || ''}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sale Discount Type"
              name="sale_discount_type"
              select
              value={formData.sale_discount_type || ""}
              onChange={handleChange}
            >
              {discountTypes.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Sale Description"
              name="sale_description"
              value={formData.sale_description || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Price"
              name="purchase_price"
              type="number"
              value={formData.purchase_price || ""}
              onChange={handleChange}
              error={!!errors.purchase_price}
              helperText={errors.purchase_price || ''}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Discount"
              name="purchase_discount"
              type="number"
              value={formData.purchase_discount || ""}
              onChange={handleChange}
              error={!!errors.purchase_discount}
              helperText={errors.purchase_discount || ''}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Discount Type"
              name="purchase_discount_type"
              select
              value={formData.purchase_discount_type || ""}
              onChange={handleChange}
            >
              {discountTypes.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Purchase Description"
              name="purchase_description"
              value={formData.purchase_description || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Preferred Vendor"
              name="preferred_vendor"
              value={formData.preferred_vendor || ""}
              onChange={handleChange}
              helperText={vendors.length === 0 ? "Loading vendors..." : ""}
            >
              <MenuItem value="">None</MenuItem>
              {vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <MenuItem key={vendor.id || vendor.vendor_name} value={vendor.vendor_name}>
                    {vendor.vendor_name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No vendors available</MenuItem>
              )}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
