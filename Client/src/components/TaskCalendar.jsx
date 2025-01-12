import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { Card, CardContent, Typography, CircularProgress, IconButton, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import NextContactTimeModal from "./Modals/NextContactTimeModal";
import { useSelector } from "react-redux";
import axios from "axios";
import ServerDay from "./ServerDay"; // Ensure this path is correct

const initialValue = dayjs();

export default function TaskCalendar({ donatorId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotifications = async (id) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/notifications/donor/${id}`
      );
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(donatorId);
  }, [donatorId]);

  const handleMonthChange = (date) => setSelectedDate(date);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const hasNotification = notifications.some((notif) =>
      dayjs(notif.notificationDate).isSame(date, "day")
    );
    if (!hasNotification) setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleToggleArchived = async (id, currentArchived) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/notifications/toggle-archived/${id}`, {
        archived: !currentArchived,
      });
      fetchNotifications(donatorId);
    } catch (err) {
      console.error("Error toggling archived status:", err);
      setError("Failed to update notification.");
    }
  };

  const selectedNotifications = notifications.filter((notif) =>
    dayjs(notif.notificationDate).isSame(selectedDate, "day")
  );

  const handleTimeSelect = (selectedTimeISO) => {
    const combinedDateTime = new Date(selectedTimeISO).toISOString();
    const newNotification = {
      title: "Main Callback",
      type: "callback",
      userId: user.id,
      notificationDate: combinedDateTime,
      donatorId,
    };
    handleCreateNotification(newNotification);
  };

  const handleCreateNotification = async (newNotificationData) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/notifications`, newNotificationData);
      fetchNotifications(donatorId);
    } catch (err) {
      console.error("Error creating notification:", err);
      setError("Failed to create notification.");
    } finally {
      setIsModalOpen(false);
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
          ) : error ? (
            <Typography color="error">{error}</Typography>
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
