import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        defaultValue={initialValue}
        loading={isLoading}
        onMonthChange={handleMonthChange}
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
  );
}
