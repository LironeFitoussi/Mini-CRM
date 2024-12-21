import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const fetchUsers = async () => {
  const { data } = await axios.get(
    import.meta.env.VITE_API_URL + "/api/v1/users"
  );
//   console.log(data);
  return data;
};

const deleteUsers = async (ids) => {
  await axios.delete(import.meta.env.VITE_API_URL + "/api/v1/users/", { ids });
//   console.log("Users deleted successfully");
};

const Users = () => {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    fName: "",
    lName: "",
    email: "",
    role: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormValues({ fName: "", lName: "", email: "", role: "" }); // Reset form
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(import.meta.env.VITE_API_URL + "/api/v1/users", formValues);
    //   console.log("User added successfully");
      queryClient.invalidateQueries(["users"]); // Revalidate the "users" query
      handleCloseModal();
    } catch (err) {
      console.error("Error adding user", err);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      alert("No users selected for deletion.");
      return;
    }

    try {
      await deleteUsers(selectedRows);
      queryClient.invalidateQueries(["users"]); // Revalidate the "users" query
    } catch (err) {
      console.error("Error deleting users", err);
    }
  };

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center mt-10">Error fetching users</div>;

  // Filter out invalid rows to ensure data integrity
  const validData = data?.filter((row) => row && row._id) || [];

  const columns = [
    { field: "_id", headerName: "ID", width: 90 },
    {
      field: "fName",
      headerName: "First Name",
      width: 150,
    },
    {
      field: "lName",
      headerName: "Last Name",
      width: 150,
    },
    { field: "email", headerName: "Email", width: 200 },
    { field: "role", headerName: "Role", width: 130 },
  ];

  return (
    <div className="h-screen p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          style={{ marginRight: "10px" }}
        >
          Add User
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDelete}
        >
          Delete Selected Users
        </Button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <DataGrid
          rows={validData}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          onSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection);
          }}
          getRowId={(row) => row._id} // Use _id as the unique row identifier
        />
      </div>

      {/* Add User Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="First Name"
            name="fName"
            value={formValues.fName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Last Name"
            name="lName"
            value={formValues.lName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Role"
            name="role"
            value={formValues.role}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Users;
