import { useState } from 'react';
import { Button } from '@mui/material';

import AssignDonorsModal from '../Modals/AssignDonorsModal.jsx';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

export default function AssignDonorsButton({selectedUserId}) {
    // console.log(selectedUserId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button
                variant="contained"
                color="success"
                onClick={handleOpenModal}
                sx={{ ml: 2 }}
            >
                <AssignmentIndIcon />
            </Button>

            {/* AssignDonors Modal */}
            <AssignDonorsModal
                open={isModalOpen}
                onClose={handleCloseModal}
                selectedUserId={selectedUserId}
            />
        </>
    );
}