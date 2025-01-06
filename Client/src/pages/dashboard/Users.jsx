// Users.js
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button, Snackbar, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

import UsersTable from "../../components/Molecules/UsersTable";
import AddUserModal from "../../components/Modals/AddUserModal";
import EditUserModal from "../../components/Modals/EditUserModal";
import DeleteUserModal from "../../components/Modals/DeleteUserModal";

const fetchUsers = async () => {
  const { data } = await axios.get(
    import.meta.env.VITE_API_URL + "/api/v1/users"
  );
  return data.users;
};

const deleteUsers = async (ids) => {
  await axios.delete(import.meta.env.VITE_API_URL + "/api/v1/users/", {
    data: { ids },
  });
};

const Users = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formValues, setFormValues] = useState({
    fName: "",
    lName: "",
    email: "",
    role: "user",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setFormValues({ fName: "", lName: "", email: "", role: "" });
  };

  const handleOpenEditModal = () => {
    if (selectedRows.length !== 1) {
      setAlert({
        open: true,
        message: t("userManagement.selectOneEdit"),
        severity: "warning",
      });
      return;
    }
    const userToEdit = data?.find((user) => user._id === selectedRows[0]);
    if (userToEdit) {
      setFormValues({
        fName: userToEdit.fName,
        lName: userToEdit.lName,
        email: userToEdit.email,
        role: userToEdit.role,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setFormValues({ fName: "", lName: "", email: "", role: "" });
  };

  const handleAddUser = async (newUser) => {
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + "/api/v1/users",
        newUser
      );
      queryClient.invalidateQueries(["users"]);
      handleCloseAddModal();
      setAlert({
        open: true,
        message: t("userManagement.userAdded"),
        severity: "success",
      });
    } catch (err) {
      console.error("Error adding user", err.response?.data || err);
      setAlert({
        open: true,
        message: t("userManagement.addError"),
        severity: "error",
      });
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/users/${selectedRows[0]}`,
        updatedUser
      );
      queryClient.invalidateQueries(["users"]);
      handleCloseEditModal();
      setAlert({
        open: true,
        message: t("userManagement.userUpdated"),
        severity: "success",
      });
    } catch (err) {
      console.error("Error editing user", err.response?.data || err);
      setAlert({
        open: true,
        message: t("userManagement.editError"),
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      setAlert({
        open: true,
        message: t("userManagement.selectDelete"),
        severity: "warning",
      });
      return;
    }

    try {
      await deleteUsers(selectedRows);
      queryClient.invalidateQueries(["users"]);
      setIsDeleteModalOpen(false);
      setSelectedRows([]);
      setAlert({
        open: true,
        message: t("userManagement.usersDeleted"),
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting users", err);
      setAlert({
        open: true,
        message: t("userManagement.deleteError"),
        severity: "error",
      });
    }
  };

  const handleOpenDeleteModal = () => {
    if (selectedRows.length === 0) {
      setAlert({
        open: true,
        message: t("userManagement.selectDelete"),
        severity: "warning",
      });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center mt-10">Error fetching users</div>;

  const validData = data?.filter((row) => row && row._id) || [];

  return (
    <div className="h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">{t("navigation.userManagement")}</h1>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <UsersTable
          rows={validData}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </div>

      <div className="mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddModal}
          style={{ marginRight: "10px" }}
        >
          {t("userManagement.add")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleOpenDeleteModal}
          style={{ marginRight: "10px" }}
        >
          {t("userManagement.delete")}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenEditModal}
          style={{ marginRight: "10px" }}
        >
          {t("userManagement.edit")}
        </Button>
      </div>

      <AddUserModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        formValues={formValues}
        handleChange={handleChange}
        handleSubmit={handleAddUser}
      />

      <DeleteUserModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />

      <EditUserModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        formValues={formValues}
        handleChange={handleChange}
        handleSubmit={handleEditUser}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Users;
