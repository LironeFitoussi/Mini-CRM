import React, { useState } from "react";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";

const ClientPage = () => {
  // Example client data
  const navigate = useNavigate();

  const { id } = useParams();

  const clients = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890", company: "Acme Corp" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210", company: "Globex Inc" },
    { id: 3, name: "Sam Wilson", email: "sam@example.com", phone: "555-123-4567", company: "Wayne Enterprises" },
    { id: 4, name: "Tony Stark", email: "tony@example.com", phone: "777-456-7890", company: "Stark Industries" },
    { id: 5, name: "Bruce Wayne", email: "bruce@example.com", phone: "888-654-3210", company: "Wayne Enterprises" },
    { id: 6, name: "Peter Parker", email: "peter@example.com", phone: "999-123-4567", company: "Daily Bugle" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  // Filtered clients based on search query
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const handleChangePage = (event, newPage) => setPage(newPage);

  if (id) {
    return <Outlet />;
  }
//   else display the client page
  return (
    <Box sx={{ padding: 4 }}>
      <h1>Clients</h1>

      {/* Search Input */}
      <TextField
        label="Search clients"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Client Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Company</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((client) => (
                <TableRow key={client.id} onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.company}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredClients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5]} // Fixed rows per page
      />
    </Box>
  );
};

export default ClientPage;
