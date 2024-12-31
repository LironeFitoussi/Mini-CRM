import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  TextField,
  Stack,
  Autocomplete,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function GlobalDonator() {
  // Controlled value for selected option
  const [value, setValue] = useState(null);
  // Shows exactly what the user typed (with leading zeros).
  const [inputValue, setInputValue] = useState("");
  // The trimmed string we send to the server.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [donators, setDonators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const inputRef = useRef(null); // Reference to the input element

  // Debounce the search
  const debouncedChangeHandler = useCallback(
    debounce((rawValue) => {
      const trimmed = rawValue.replace(/^0+/, ""); // remove leading zeros
      console.log("debounced => trimmed search string:", trimmed);
      setDebouncedSearch(trimmed);
    }, 500),
    []
  );

  // Whenever user types in the Autocomplete
  const handleInputChange = (event, newValue) => {
    setInputValue(newValue);
    debouncedChangeHandler(newValue);
  };

  // Handle selection of an option
  const handleOptionChange = (event, selectedDonator) => {
    if (selectedDonator) {
      // Clear the selected value and input before navigating
      setValue(null); // Clear selected option
      setInputValue(""); // Clear the input field
      setDebouncedSearch(""); // Optionally clear the search term

      // Remove focus from the input
      if (inputRef.current) {
        inputRef.current.blur();
      }

      // Navigate to the selected donator's page
      navigate(`/dashboard/donators/${selectedDonator._id}`);
    }
  };

  // Whenever debouncedSearch changes, fetch from server
  useEffect(() => {
    if (!debouncedSearch) {
      setDonators([]);
      return;
    }

    const fetchDonators = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("search", debouncedSearch);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donators?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.donators)) {
          throw new Error("Invalid data format received from server.");
        }

        setDonators(data.donators);
      } catch (err) {
        console.error("Error fetching donators:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonators();
  }, [debouncedSearch]);

  // Safely get phone number
  const getPhoneNumber = (donator) =>
    donator?.phone_number_1?.number || "N/A";

  // Tells MUI how to label each item if user picks from the dropdown
  const getOptionLabel = (option) => {
    const fName = option.fName || "";
    const lName = option.lName || "";
    const email = option?.email_1 || "";
    const phone = getPhoneNumber(option);

    // Prioritize name, then email, then phone
    return `${fName} ${lName}`.trim() || email || phone;
  };

  return (
    <Stack spacing={2} sx={{ width: 600 }}>
      <Autocomplete
        freeSolo
        openOnFocus
        filterOptions={(options) => options}
        disableClearable
        loading={loading}
        options={donators}
        // Controlled component props
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          handleOptionChange(event, newValue);
        }}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        getOptionLabel={getOptionLabel}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={option._id} // Ensure unique key
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>
                {option.fName} {option.lName}
              </span>
              <span>{option?.email_1?.email || "N/A"}</span>
              <span>{getPhoneNumber(option)}</span>
            </div>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("general.searchDonors")}
            type="search"
            inputRef={inputRef} // Attach the ref here
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error} — Please try again later.
        </Alert>
      )}
    </Stack>
  );
}
