import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  InputBase,
  Avatar,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "axios";
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

const AddTax = () => {
  const [taxType, setTaxType] = useState("GST");
  const [rate, setRate] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("Active");
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const e = {};
    if (!taxType.trim())                          e.taxType = 'Tax type is required';
    if (!rate)                                    e.rate    = 'Rate is required';
    else if (isNaN(rate) || rate < 0 || rate > 100) e.rate = 'Rate must be between 0 and 100';
    if (!label.trim())                            e.label   = 'Label is required';
    if (!date)                                    e.date    = 'Effective date is required';

    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});

   const payload = {
  tax_name: taxType,
  tax_rate: rate,
  tax_code: label,
  details: `Effective from ${date.toISOString().split("T")[0]}`,
  status,
  effective_date: date.toISOString().split("T")[0]  // <-- add this line
};


    try {
      await axios.post(`${BASE_URL}/taxes`, payload);
      alert("Tax added successfully!");
      navigate("/tax"); // Go back to tax list
    } catch (err) {
      console.error(err);
      alert("Error adding tax");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, bgcolor: "#F9FAFB", minHeight: "100vh" }}>
        {/* Header */}
        <Box
          sx={{
            height: 60,
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            px: 3,
            justifyContent: "space-between",
            bgcolor: "#fff",
          }}
        >
          <Typography fontWeight="bold" fontSize={18}>
            Tax &nbsp;/&nbsp; <span style={{ fontWeight: 400 }}>Add Tax</span>
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#F0F0F0",
                px: 2,
                py: 0.5,
                borderRadius: 5,
                minWidth: 250,
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: "#555" }} />
              <InputBase
                placeholder="Search anything here..."
                sx={{ ml: 1, flex: 1, fontSize: 14 }}
              />
            </Box>

            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>

            <Box display="flex" alignItems="center" gap={1}>
              <NotificationsNoneIcon />
              <UserMenu />
            </Box>
          </Box>
        </Box>

        {/* Main Form */}
        <Box sx={{ px: 4, py: 4 }}>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 3,
                  p: 4,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Add Tax
                </Typography>

                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Tax Type"
                    value={taxType}
                    onChange={(e) => { setTaxType(e.target.value); setErrors({...errors, taxType:''}); }}
                    placeholder="Enter tax type (e.g., GST)"
                    fullWidth
                    required
                    error={!!errors.taxType}
                    helperText={errors.taxType || ''}
                    sx={{ flex: 1, minWidth: 220 }}
                  />

                  <TextField
                    label="Rate (%)"
                    placeholder="Enter rate (0-100)"
                    required
                    fullWidth
                    type="number"
                    value={rate}
                    onChange={(e) => { setRate(e.target.value); setErrors({...errors, rate:''}); }}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    error={!!errors.rate}
                    helperText={errors.rate || ''}
                    sx={{ flex: 1, minWidth: 220 }}
                  />

                  <TextField
                    label="Label/Category"
                    placeholder="Enter Label/Category"
                    required
                    fullWidth
                    value={label}
                    onChange={(e) => { setLabel(e.target.value); setErrors({...errors, label:''}); }}
                    error={!!errors.label}
                    helperText={errors.label || ''}
                    sx={{ flex: 1, minWidth: 220 }}
                  />

                  <TextField
                    label="Status"
                    select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    fullWidth
                    sx={{ flex: 1, minWidth: 220 }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>

                  <DatePicker
                    label="Effective Date"
                    value={date}
                    onChange={(newValue) => {
                      setDate(newValue);
                      if (errors.date) setErrors({...errors, date: ''});
                    }}
                    sx={{ flex: 1, minWidth: 220 }}
                    slotProps={{
                      textField: {
                        required: true,
                        error: !!errors.date,
                        helperText: errors.date || ''
                      }
                    }}
                  />
                </Box>

                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/tax")}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "#004085",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#003060",
                      },
                    }}
                    onClick={handleSubmit}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AddTax;
