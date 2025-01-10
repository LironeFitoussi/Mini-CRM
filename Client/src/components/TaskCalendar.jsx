import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import NextContactDateModal from "./Modals/NextContactDateModal";
import { useSelector } from "react-redux";
import axios from "axios";

// Initial date value
const initialValue = dayjs(new Date());

/**
 * Custom Day component to display badges based on notification status.
 */
function ServerDay(props) {
  const {
    highlightedDays = [],
    notifications,
    day,
    outsideCurrentMonth,
    ...other
  } = props;

  const currentDate = dayjs();
  const isSelected =
    !outsideCurrentMonth && highlightedDays.includes(day.date());

  // Determine the icon based on the day status
  let badgeContent = "";
  const notificationForDay = notifications.find((notif) =>
    dayjs(notif.notificationDate).isSame(day, "day")
  );

  if (notificationForDay?.isRead) {
    badgeContent = "🟢"; // Green for read
  } else if (day.isBefore(currentDate, "day")) {
    badgeContent = "🔴"; // Red for past dates
  } else if (day.isAfter(currentDate, "day")) {
    badgeContent = "🔵"; // Blue for future dates
  } else if (day.isSame(currentDate, "day")) {
    badgeContent = "🟡"; // Yellow for today
  }

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isSelected ? badgeContent : undefined}
      color="primary"
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
}

/**
 * TaskCalendar Component
 * @param {string} donatorId - The ID of the donator whose notifications are to be fetched.
 */

export default function TaskCalendar({ donatorId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.user);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch notifications based on donatorId
  const fetchNotifications = async (id) => {
    console.log(id);

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/notifications/donor/${id}`
      );
      console.log(response.data);

      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a list of days that have notifications
  const generateHighlightedDays = (notificationsList) => {
    const days = notificationsList.map((notif) =>
      dayjs(notif.notificationDate).date()
    );
    return [...new Set(days)]; // Remove duplicates
  };

  // Generate the calendar structure based on notifications
  const generateCalendar = (notificationsList) => {
    const calendar = {};

    notificationsList.forEach((notif) => {
      const notifDate = dayjs(notif.notificationDate);
      const year = notifDate.year();
      const month = notifDate.month(); // Note: month is 0-indexed in dayjs
      const day = notifDate.date();

      if (!calendar[year]) calendar[year] = {};
      if (!calendar[year][month]) calendar[year][month] = [];
      calendar[year][month].push(day);
    });

    return calendar;
  };

  const calendarData = generateCalendar(notifications);

  const fetchHighlightedDays = (date) => {
    const year = date.year();
    const month = date.month();

    // Fetch days to highlight from calendarData
    const daysToHighlight = calendarData[year]?.[month] || [];
    setHighlightedDays(daysToHighlight);
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (donatorId) {
      fetchNotifications(donatorId);
    }
  }, [donatorId]);

  // Update highlighted days whenever notifications or selected month change
  useEffect(() => {
    fetchHighlightedDays(selectedDate);
  }, [notifications, selectedDate]);

  const handleMonthChange = (date) => {
    setSelectedDate(date);
    fetchHighlightedDays(date);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);

    // Check if there's a notification for the selected date
    const hasNotification = notifications.some((notif) =>
      dayjs(notif.notificationDate).isSame(date, "day")
    );

    if (!hasNotification) {
      setIsModalOpen(true);
    }
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Function to handle creating a new notification
  const handleCreateNotification = async (newNotificationData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/notifications`,
        newNotificationData
      );

      // Optionally, you can show a success message here
      console.log(response);
      
      // Refresh notifications after creating a new one
      fetchNotifications(donatorId);

      // Close the modal
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating notification:", err);
      // Optionally, set an error state or show an error message
    }
  };

  // Find the notification for the selected date
  const selectedNotification = notifications.find((notif) =>
    dayjs(notif.notificationDate).isSame(selectedDate, "day")
  );

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          loading={isLoading}
          onMonthChange={handleMonthChange}
          onChange={handleDateSelect}
          renderLoading={() => <DayCalendarSkeleton />}
          renderDay={(day, _value, DayComponentProps) => (
            <ServerDay
              {...DayComponentProps}
              highlightedDays={highlightedDays}
              notifications={notifications}
              day={day}
            />
          )}
          sx={{ flex: 1 }}
        />
      </LocalizationProvider>

      <Card style={{ flex: 1, marginLeft: 16 }}>
        <CardContent>
          {isLoading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : selectedNotification ? (
            <>
              <Typography variant="h6">Notification Details</Typography>
              <Typography variant="body1">
                Title: {selectedNotification.title}
              </Typography>
              <Typography variant="body2">
                Message: {selectedNotification.message}
              </Typography>
              <Typography variant="body2">
                Type: {selectedNotification.type}
              </Typography>
              <Typography variant="body2">
                Date:{" "}
                {dayjs(selectedNotification.notificationDate).format(
                  "YYYY-MM-DD HH:mm"
                )}
              </Typography>
              <Typography variant="body2">
                Status: {selectedNotification.isRead ? "Read" : "Unread"}
              </Typography>
              <Typography variant="body2">
                Donator: {selectedNotification.donator?.name || "N/A"}
              </Typography>
              <Typography variant="body2">
                User: {selectedNotification.user?.fName}{" "}
                {selectedNotification.user?.lName}
              </Typography>
            </>
          ) : (
            <Typography variant="body2">
              No notifications for this date.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* NextContactDateModal */}
      <NextContactDateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDateSelect={(dateData) => {
          const newNotification = {
            title: "Main Callback",
            type: "callback", // Set the type as required by your backend
            userId: user.id, // Include userId if required by your backend
            notificationDate: selectedDate.$d, // Should be in a format accepted by your backend
            donatorId,
          };

          console.log("New notification data:", newNotification);

          // Call the function to create a new notification
          handleCreateNotification(newNotification);
        }}
      />
    </div>
  );
}
