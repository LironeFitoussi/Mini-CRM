import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Alert,
  CircularProgress,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TablePagination,
} from "@mui/material";

/**
 * Renders the donations table with sorting and pagination.
 */
const DonationsTable = ({
  donations,
  loadingDonations,
  errorDonations,
  order,
  orderBy,
  handleRequestSort,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  totalPages,
}) => {
  if (loadingDonations) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorDonations) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {errorDonations} — Please try again later.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "donator_id" ? order : false}>
                <TableSortLabel
                  active={orderBy === "donator_id"}
                  direction={orderBy === "donator_id" ? order : "asc"}
                  onClick={() => handleRequestSort("donator_id")}
                >
                  Donor ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "amount" ? order : false}>
                <TableSortLabel
                  active={orderBy === "amount"}
                  direction={orderBy === "amount" ? order : "asc"}
                  onClick={() => handleRequestSort("amount")}
                >
                  Amount (€)
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "date" ? order : false}>
                <TableSortLabel
                  active={orderBy === "date"}
                  direction={orderBy === "date" ? order : "asc"}
                  onClick={() => handleRequestSort("date")}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "type" ? order : false}>
                <TableSortLabel
                  active={orderBy === "type"}
                  direction={orderBy === "type" ? order : "asc"}
                  onClick={() => handleRequestSort("type")}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "method" ? order : false}>
                <TableSortLabel
                  active={orderBy === "method"}
                  direction={orderBy === "method" ? order : "asc"}
                  onClick={() => handleRequestSort("method")}
                >
                  Method
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "notes" ? order : false}>
                <TableSortLabel
                  active={orderBy === "notes"}
                  direction={orderBy === "notes" ? order : "asc"}
                  onClick={() => handleRequestSort("notes")}
                >
                  Notes
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donations && donations.length > 0 ? (
              donations.map((donation) => (
                <TableRow key={donation._id}>
                  <TableCell>
                    <Link
                      to={`/dashboard/donators/${donation.donator_id}`}
                      style={{ textDecoration: "none", color: "#1976d2" }}
                    >
                      {donation.donator_id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {donation.amount.toLocaleString(undefined, {
                      style: "currency",
                      currency: donation.currency,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(donation.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{donation.type}</TableCell>
                  <TableCell>{donation.method}</TableCell>
                  <TableCell>{donation.notes}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No donations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        // This count might need to match your API’s total items, not just pages * rowsPerPage
        count={totalPages * rowsPerPage}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rows per page:"
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default DonationsTable;
