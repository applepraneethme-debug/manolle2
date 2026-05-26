"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppointments, useCallLogs } from "@/hooks/useSupabaseData";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type CalEvent = {
  id: string;
  kind: "appointment" | "call";
  date: Date;
  time: string;
  title: string;
  type: string;
  color: string;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPage() {
  const { data: appointments, loading: apptLoading } = useAppointments();
  const { data: callLogs, loading: callLoading } = useCallLogs();

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const events: CalEvent[] = useMemo(() => {
    const apptEvents: CalEvent[] = appointments.map((a) => {
      // appointment_date is "YYYY-MM-DD", appointment_time is "HH:mm:ss"
      const [y, m, d] = (a.appointment_date || "").split("-").map(Number);
      const timeStr = (a.appointment_time || "").slice(0, 5);
      const [hour, minute] = timeStr.split(":").map(Number);
      return {
        id: `appt-${a.id}`,
        kind: "appointment",
        date: new Date(y || 1970, (m || 1) - 1, d || 1, hour || 0, minute || 0),
        time: timeStr || "—",
        title: a.title || "Appointment",
        type: a.type || "other",
        color: "#00F0FF",
      };
    });

    const callEvents: CalEvent[] = callLogs.map((c) => {
      const date = new Date(c.created_at);
      const time = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return {
        id: `call-${c.id}`,
        kind: "call",
        date,
        time,
        title: `Call (${c.status.replace("_", " ")})`,
        type: "call",
        color: "#0066FF",
      };
    });

    return [...apptEvents, ...callEvents];
  }, [appointments, callLogs]);

  const eventsForDay = (day: number) =>
    events.filter(
      (e) =>
        e.date.getFullYear() === year &&
        e.date.getMonth() === month &&
        e.date.getDate() === day
    );

  const selectedEvents = selectedDate
    ? events.filter((e) => sameDay(e.date, selectedDate))
    : [];

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => e.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [events]);

  const monthEvents = events.filter(
    (e) => e.date.getFullYear() === year && e.date.getMonth() === month
  );

  const loading = apptLoading || callLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="calendar-page">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="font-outfit text-xl font-semibold text-white"
              data-testid="calendar-month-label"
            >
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="prev-month-btn">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                data-testid="today-btn"
                title="Today"
              >
                <span className="text-xs">Today</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="next-month-btn">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-[#71717A] py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsForDay(day);
              const isToday = sameDay(today, new Date(year, month, day));
              const isSelected =
                selectedDate && sameDay(selectedDate, new Date(year, month, day));

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`relative p-2 rounded-lg text-center transition-all duration-200 min-h-[52px] flex flex-col items-center ${
                    isSelected ? "bg-[#00F0FF]/10 border border-[#00F0FF]/40" : "hover:bg-white/5"
                  } ${isToday && !isSelected ? "border border-white/20" : ""}`}
                  data-testid={`calendar-day-${day}`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday ? "text-[#00F0FF]" : "text-[#A1A1AA]"
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: e.color }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-[#71717A]">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-white/5"
              data-testid="selected-day-events"
            >
              <h4 className="text-sm font-semibold text-white mb-3">
                Events on{" "}
                {selectedDate?.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h4>
              <div className="space-y-2">
                {selectedEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
                    style={{ borderLeftColor: e.color, borderLeftWidth: 3 }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{e.title}</div>
                      <div className="text-xs text-[#71717A]">{e.time}</div>
                    </div>
                    <Badge variant="default" className="text-xs capitalize">
                      {e.kind === "call" ? "Call" : e.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && events.length === 0 && (
            <div className="mt-6 py-8 text-center text-sm text-[#71717A] border-t border-white/5">
              No appointments or calls yet. Create one from the Leads or Campaigns page.
            </div>
          )}
        </motion.div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <h3 className="font-outfit font-semibold text-white mb-4">Upcoming</h3>
          <div className="space-y-3" data-testid="upcoming-list">
            {upcoming.length === 0 && (
              <p className="text-xs text-[#71717A]">No upcoming events</p>
            )}
            {upcoming.map((e, i) => (
              <div
                key={e.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                data-testid={`upcoming-${i}`}
              >
                <div
                  className="w-1.5 self-stretch rounded-full shrink-0"
                  style={{ background: e.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {e.title}
                  </div>
                  <div className="text-xs text-[#71717A] capitalize">
                    {e.kind === "call" ? "Call activity" : e.type}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-[#00F0FF]">
                      {sameDay(e.date, today)
                        ? "Today"
                        : e.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-xs text-[#71717A] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {e.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h3 className="font-outfit font-semibold text-white mb-3 text-sm">This Month</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Total events</span>
              <span className="text-white font-semibold" data-testid="stat-total">
                {monthEvents.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Appointments</span>
              <span className="text-white font-semibold" data-testid="stat-appointments">
                {monthEvents.filter((e) => e.kind === "appointment").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A] flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Calls logged
              </span>
              <span className="text-white font-semibold" data-testid="stat-calls">
                {monthEvents.filter((e) => e.kind === "call").length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
