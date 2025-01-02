import { useState } from "react";
import { Button } from "@mui/material";
import EditDonatorModal from "../Modals/EditDonatorModal.jsx";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { useDonator } from "../../queryhooks/useDonator.jsx";

const EditDonatorButton = ({ donatorData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { invalidate } = useDonator(donatorData._id);
  const handleEditDonator = async (updatedDonator) => {
    console.log("Donator Data:", donatorData);

    try {
      console.log("Updated Donator:", updatedDonator);
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/api/v1/donators/${donatorData._id}`,
        updatedDonator
      );
      console.log("Response:", res.data);
      invalidate(updatedDonator._id);
    } catch (error) {
      console.error("Error updating donator:", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Edit Donator Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenModal}
        sx={{ ml: 2 }}
      >
        <EditIcon />
      </Button>

      {/* EditDonator Modal */}
      <EditDonatorModal
        key={donatorData._id}
        open={isModalOpen}
        onClose={handleCloseModal}
        handleEditDonator={handleEditDonator}
        donatorData={donatorData}
      />
    </>
  );
};

export default EditDonatorButton;
