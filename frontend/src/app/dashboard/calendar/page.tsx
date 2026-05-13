"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const appointments = [
  { id: 1, date: new Date(2025, 1, 10), time: "10:00 AM", name: "Rahul Sharma", type: "Site Visit", phone: "+91 98765 43210", color: "#00F0FF" },
  { id: 2, date: new Date(2025, 1, 10), time: "3:00 PM", name: "Dr. Priya Nair", type: "Clinic", phone: "+91 87654 32109", color: "#0066FF" },
  { id: 3, date: new Date(2025, 1, 12), time: "11:00 AM", name: "Amit Kumar", type: "Property Tour", phone: "+91 76543 21098", color: "#00F0FF" },
  { id: 4, date: new Date(2025, 1, 14), time: "2:00 PM", name: "Sunita Gupta", type: "Salon", phone: "+91 65432 10987", color: "#F59E0B" },
  { id: 5, date: new Date(2025, 1, 15), time: "10:00 AM", name: "Vikram Singh", type: "Site Visit", phone: "+91 54321 09876", color: "#00F0FF" },
  { id: 6, date: new Date(2025, 1, 15), time: "4:30 PM", name: "Anjali Reddy", type: "Clinic", phone: "+91 43210 98765", color: "#0066FF" },
  { id: 7, date: new Date(2025, 1, 18), time: "9:00 AM", name: "Rajesh Verma", type: "Consultation", phone: "+91 32109 87654", color: "#10B981" },
  { id: 8, date: new Date(2025, 1, 20), time: "1:00 PM", name: "Deepa Patel", type: "Site Visit", phone: "+91 21098 76543", color: "#00F0FF" },
];

const upcomingAppts = [
  { date: "Today", time: "3:00 PM", name: "Dr. Priya Nair", type: "Clinic Consult" },
  { date: "Feb 12", time: "11:00 AM", name: "Amit Kumar", type: "Property Tour" },
  { date: "Feb 14", time: "2:00 PM", name: "Sunita Gupta", type: "Salon Booking" },
  { date: "Feb 15", time: "10:00 AM", name: "Vikram Singh", type: "Site Visit" },
  { date: "Feb 18", time: "9:00 AM", name: "Rajesh Verma", type: "Consultation" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getApptForDay = (day: number) =>
    appointments.filter(
      (a) => a.date.getFullYear() === year && a.date.getMonth() === month && a.date.getDate() === day
    );

  const selectedAppts = selectedDate
    ? appointments.filter(
        (a) =>
          a.date.getFullYear() === selectedDate.getFullYear() &&
          a.date.getMonth() === selectedDate.getMonth() &&
          a.date.getDate() === selectedDate.getDate()
      )
    : [];

  const today = new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="calendar-page">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-outfit text-xl font-semibold text-white">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="prev-month-btn">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="next-month-btn">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-[#71717A] py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAppts = getApptForDay(day);
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`
                    relative p-2 rounded-lg text-center transition-all duration-200 min-h-[52px] flex flex-col items-center
                    ${isSelected ? "bg-[#00F0FF]/10 border border-[#00F0FF]/40" : "hover:bg-white/5"}
                    ${isToday && !isSelected ? "border border-white/20" : ""}
                  `}
                  data-testid={`calendar-day-${day}`}
                >
                  <span className={`text-sm font-medium ${isToday ? "text-[#00F0FF]" : "text-[#A1A1AA]"}`}>
                    {day}
                  </span>
                  {dayAppts.length > 0 && (
                    <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                      {dayAppts.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: a.color }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day detail */}
          {selectedAppts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-white/5"
            >
              <h4 className="text-sm font-semibold text-white mb-3">
                Appointments on {selectedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </h4>
              <div className="space-y-2">
                {selectedAppts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
                    style={{ borderLeftColor: a.color, borderLeftWidth: 3 }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{a.name}</div>
                      <div className="text-xs text-[#71717A]">{a.time}</div>
                    </div>
                    <Badge variant="default" className="text-xs">{a.type}</Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Sidebar */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <h3 className="font-outfit font-semibold text-white mb-4">Upcoming Meetings</h3>
          <div className="space-y-3">
            {upcomingAppts.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                data-testid={`upcoming-appt-${i}`}
              >
                <div
                  className="w-1.5 self-stretch rounded-full shrink-0"
                  style={{ background: i === 0 ? "#00F0FF" : "rgba(255,255,255,0.2)" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{a.name}</div>
                  <div className="text-xs text-[#71717A]">{a.type}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${i === 0 ? "text-[#00F0FF]" : "text-[#71717A]"}`}>
                      {a.date}
                    </span>
                    <span className="text-xs text-[#71717A] flex items-center gap-1">
                      <Clock className="w-3 h-3" />{a.time}
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
              <span className="text-[#71717A]">Total appointments</span>
              <span className="text-white font-semibold">{appointments.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Site visits</span>
              <span className="text-white font-semibold">{appointments.filter(a => a.type === "Site Visit").length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Clinic consults</span>
              <span className="text-white font-semibold">{appointments.filter(a => a.type === "Clinic").length}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
