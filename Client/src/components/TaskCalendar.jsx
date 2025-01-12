// src/components/TaskCalendar.jsx
import React, { useState } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import NextContactTimeModal from "./Modals/NextContactTimeModal";
import { useSelector } from "react-redux";
import ServerDay from "./ServerDay"; // Ensure this path is correct
import useDonatorNotifications from "../queryhooks/useDonatorNotifications"; // Adjust the path as needed
import {useDonator} from "../queryhooks/useDonator"; // Adjust the path as needed
const initialValue = dayjs();

export default function TaskCalendar({ donatorId }) {
  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { invalidate } = useDonator(donatorId);
  // **Use the updated custom hook**
  const {
    notifications,
    isLoading,
    isError,
    error,
    createNotification,
    toggleArchived,
    invalidateNotifications,
  } = useDonatorNotifications(donatorId);

  // **Handle Month Change**
  const handleMonthChange = (date) => setSelectedDate(date);

  // **Handle Date Selection**
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const hasNotification = notifications.some((notif) =>
      dayjs(notif.notificationDate).isSame(date, "day")
    );
    if (!hasNotification) setIsModalOpen(true);
  };

  // **Handle Modal Close**
  const handleCloseModal = () => setIsModalOpen(false);

  // **Handle Toggle Archived Status**
  const handleToggleArchived = async (id, currentArchived) => {
    try {
      await toggleArchived({ id, archived: currentArchived });
      invalidate()
    } catch (err) {
      console.error("Error toggling archived status:", err);
      // Optionally, implement additional error handling here
    }
  };

  // **Filter Notifications for Selected Date**
  const selectedNotifications = notifications.filter((notif) =>
    dayjs(notif.notificationDate).isSame(selectedDate, "day")
  );

  // **Handle Time Selection from Modal**
  const handleTimeSelect = async (selectedTimeISO) => {
    const combinedDateTime = new Date(selectedTimeISO).toISOString();
    const newNotification = {
      title: "Main Callback",
      type: "callback",
      userId: user.id,
      notificationDate: combinedDateTime,
      donatorId,
    };
    try {
      await createNotification(newNotification);
      invalidate();
    } catch (err) {
      console.error("Error creating notification:", err);
      // Optionally, implement additional error handling here
    }
  };

  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          loading={isLoading}
          onMonthChange={handleMonthChange}
          onChange={handleDateSelect}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: ServerDay,
          }}
          slotProps={{
            day: { notifications },
          }}
          sx={{ flex: 1, minWidth: 300 }}
        />
      </LocalizationProvider>

      <Card style={{ flex: 1, minWidth: 300, marginLeft: 16 }}>
        <CardContent>
          {isLoading ? (
            <CircularProgress />
          ) : isError ? (
            <Typography color="error">
              {error?.response?.data?.message || error.message || "An error occurred."}
            </Typography>
          ) : selectedNotifications.length > 0 ? (
            <>
              <Typography variant="h6">Notifications</Typography>
              <Divider style={{ margin: "8px 0" }} />
              {selectedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <Typography variant="body1">
                    {dayjs(notif.notificationDate).format("YYYY-MM-DD HH:mm")} - {notif.type}
                  </Typography>
                  <IconButton
                    onClick={() => handleToggleArchived(notif.id, notif.archived)}
                    color={notif.archived ? "success" : "warning"}
                  >
                    {notif.archived ? (
                      <CheckCircleIcon fontSize="medium" />
                    ) : (
                      <PendingActionsIcon fontSize="medium" />
                    )}
                  </IconButton>
                </div>
              ))}
            </>
          ) : (
            <Typography variant="body2">No notifications for this date.</Typography>
          )}
        </CardContent>
      </Card>

      <NextContactTimeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        predefinedDate={selectedDate.toISOString()}
        onTimeSelect={handleTimeSelect}
      />
    </div>
  );
}
