import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { Card, CardContent, Typography } from "@mui/material";

const initialValue = dayjs(new Date());

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, notes, ...other } = props;

  const currentDate = dayjs();
  const isSelected = !outsideCurrentMonth && highlightedDays.includes(day.date());

  // Determine the icon based on the day status
  let badgeContent = "";
  const noteForDay = notes.find((note) => dayjs(note.dueDate).isSame(day, 'day'));

  if (noteForDay?.isCompleted) {
    badgeContent = "🟢"; // Green for completed
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
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

export default function TaskCalendar({ notes }) {
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialValue);

  // Create a calendar structure from notes
  const generateCalendar = (notes) => {
    const calendar = {};

    notes.forEach((note) => {
      const dueDate = dayjs(note.dueDate);
      const year = dueDate.year();
      const month = dueDate.month();
      const day = dueDate.date();

      if (!calendar[year]) calendar[year] = {};
      if (!calendar[year][month]) calendar[year][month] = [];
      calendar[year][month].push(day);
    });

    return calendar;
  };

  const calendarData = generateCalendar(notes);

  const fetchHighlightedDays = (date) => {
    const year = date.year();
    const month = date.month();

    setIsLoading(true);

    // Fetch data for the current month
    const daysToHighlight = calendarData[year]?.[month] || [];
    setHighlightedDays(daysToHighlight);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHighlightedDays(initialValue);
  }, []);

  const handleMonthChange = (date) => {
    setIsLoading(true);
    setHighlightedDays([]);
    fetchHighlightedDays(date);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const selectedTask = notes.find((note) => dayjs(note.dueDate).isSame(selectedDate, 'day'));

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          defaultValue={initialValue}
          loading={isLoading}
          onMonthChange={handleMonthChange}
          onChange={handleDateSelect}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: ServerDay,
          }}
          slotProps={{
            day: {
              highlightedDays,
              notes,
            },
          }}
        />
      </LocalizationProvider>

      <Card style={{ minWidth: "300px" }}>
        <CardContent>
          {selectedTask ? (
            <>
              <Typography variant="h6">Task Details</Typography>
              <Typography variant="body1">Note: {selectedTask.note}</Typography>
              <Typography variant="body2">
                Due Date: {dayjs(selectedTask.dueDate).format("YYYY-MM-DD HH:mm")}
              </Typography>
              <Typography variant="body2">Status: {selectedTask.isCompleted ? "Completed" : "Pending"}</Typography>
              <Typography variant="body2">Donator: {selectedTask.donator}</Typography>
              <Typography variant="body2">
                Assigned To: {selectedTask.userDetails.fName} {selectedTask.userDetails.lName}
              </Typography>
            </>
          ) : (
            <Typography variant="body2">No tasks for this date.</Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
