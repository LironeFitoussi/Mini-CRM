import React from "react";
import dayjs from "dayjs";
import Badge from "@mui/material/Badge";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

/**
 * Custom Day component to display badges based on notification statuses.
 * Includes a red circle for overdue notifications.
 */
function ServerDay(props) {
  const { notifications, day, outsideCurrentMonth, ...other } = props;

  // Find notifications for the specific day
  const notificationsForDay = notifications.filter((notif) =>
    dayjs(notif.notificationDate).isSame(day, "day")
  );

  // If there are no notifications for this day, render the day without a badge
  if (notificationsForDay.length === 0) {
    return <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />;
  }

  // Determine if the date has passed
  const today = dayjs().startOf("day");
  const isPastDate = day.isBefore(today, "day");

  // Check if there are any notifications that are not archived
  const hasUnarchivedNotifications = notificationsForDay.some(
    (notif) => !notif.archived
  );

  // Badge Content Determination
  let badgeContent = "";
  let ariaLabel = "";

  if (isPastDate && hasUnarchivedNotifications) {
    // Overdue notifications: Red Circle
    badgeContent = "🔴";
    ariaLabel = "Overdue notifications";
  } else {
    // Existing Badge Logic
    const hasUnread = notificationsForDay.some(
      (notif) => !notif.isRead && !notif.archived
    );
    const hasRead = notificationsForDay.some(
      (notif) => notif.isRead && !notif.archived
    );
    const hasArchived = notificationsForDay.some((notif) => notif.archived);

    if (hasUnread) {
      badgeContent = "🔔"; // Unread & Not Archived
      ariaLabel = "Unread notifications";
    } else if (hasRead && !hasArchived) {
      badgeContent = "📌"; // Read & Not Archived
      ariaLabel = "Read notifications";
    } else if (hasArchived && !hasUnread && !hasRead) {
      badgeContent = "🟢"; // Archived
      ariaLabel = "Archived notifications";
    } else if (hasArchived && (hasRead || hasUnread)) {
      // Mixed statuses: Prioritize unread
      badgeContent = hasUnread ? "🔔" : "📌";
      ariaLabel = hasUnread ? "Unread notifications" : "Read notifications";
    }
  }

  return (
    <Badge
      overlap="circular"
      badgeContent={badgeContent}
      // Remove default color by customizing the badge's styling
      sx={{
        "& .MuiBadge-badge": {
          backgroundColor: "transparent",
          color: "inherit",
          boxShadow: "none",
          fontSize: "1rem",
          top: 4,
          right: 4,
        },
      }}
      // Ensure the badge is visible only when there's content
      invisible={!badgeContent}
      // Add aria-label for accessibility
      aria-label={ariaLabel}
    >
      <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
    </Badge>
  );
}

export default ServerDay;
