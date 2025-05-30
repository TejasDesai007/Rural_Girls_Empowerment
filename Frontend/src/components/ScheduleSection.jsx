import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { motion } from "framer-motion";

const ScheduleSection = ({ selectedMentor, menteeId, onBooked, onBack, isBooking: parentIsBooking }) => {
  const [date, setDate] = useState(() => {
    // Set initial date to tomorrow to avoid past dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [timeSlot, setTimeSlot] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);

  // Redirect to login if not logged in
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedMentor || !date || !timeSlot) return;

      setIsCheckingAvailability(true);
      try {
        const dateString = date.toLocaleDateString("en-CA"); // Ensure this is defined before the query

        // Check both bookings and mentorship_requests collections for conflicts
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("mentorId", "==", selectedMentor.id),
          where("date", "==", dateString),
          where("timeSlot", "==", timeSlot),
          where("status", "in", ["pending", "confirmed"])
        );

        const requestsQuery = query(
          collection(db, "mentorship_requests"),
          where("mentorId", "==", selectedMentor.id),
          where("date", "==", dateString),
          where("timeSlot", "==", timeSlot),
          where("status", "in", ["pending", "confirm"])
        );

        const [bookingsSnapshot, requestsSnapshot] = await Promise.all([
          getDocs(bookingsQuery),
          getDocs(requestsQuery)
        ]);

        const available = bookingsSnapshot.empty && requestsSnapshot.empty;
        setIsAvailable(available);

        if (!available) {
          toast.warning(`${selectedMentor.name} is not available at ${timeSlot}`, {
            description: "Please choose a different time slot",
          });
        }
      } catch (error) {
        console.error("Availability check failed:", error);
        toast.error("Failed to check availability");
        setIsAvailable(false);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedMentor, date, timeSlot]);

  const handleBookSession = async () => {
    if (!timeSlot || !menteeId || !isAvailable) return;

    setIsBooking(true);

    try {
      const bookingData = {
        mentorId: selectedMentor.id,
        menteeId,
        date: date.toLocaleDateString("en-CA"),
        timeSlot,
        status: "pending",
        mentorName: selectedMentor.name,
        createdAt: new Date(),
      };

      // Pass the booking data to the parent component for notification creation
      // Instead of directly adding to mentorship_requests
      onBooked(bookingData);

      toast.success(`Booking request sent to ${selectedMentor.name}!`, {
        description: "You'll be notified when they respond."
      });
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to book session");
    } finally {
      setIsBooking(false);
    }
  };

  // Use parent's isBooking state if provided
  const displayIsBooking = parentIsBooking !== undefined ? parentIsBooking : isBooking;

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-purple-800">
          Schedule with {selectedMentor.name}
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm">
        <div className="bg-white rounded-xl shadow-md p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border-purple-200"
            disabled={(date) => date < new Date()}
            fromDate={new Date()}
          />
        </div>
        <div className="space-y-6 p-4">
          <div>
            <p className="font-semibold mb-3 text-purple-700">Select a Time Slot</p>
            <div className="grid grid-cols-2 gap-3">
              {["10:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"].map((slot) => (
                <Button
                  key={slot}
                  variant={timeSlot === slot ? "default" : "outline"}
                  onClick={() => setTimeSlot(slot)}
                  className={`flex items-center justify-center gap-2 rounded-lg transition-all ${timeSlot === slot
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-purple-300 hover:bg-purple-100 text-purple-700"
                    }`}
                  disabled={isCheckingAvailability || displayIsBooking}
                >
                  <Clock size={16} />
                  {slot}
                </Button>
              ))}
            </div>
          </div>

          {timeSlot && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-purple-800">Selected:</span>
                <span className="text-purple-700">
                  {date.toLocaleDateString()} at {timeSlot}
                </span>
              </div>
              {!isAvailable && (
                <p className="text-sm text-pink-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-pink-600 rounded-full"></span>
                  This slot is unavailable - {selectedMentor.name} has a conflicting session
                </p>
              )}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-xl shadow-lg transition-all px-6 py-3"
            onClick={handleBookSession}
            disabled={!timeSlot || !isAvailable || isCheckingAvailability || displayIsBooking}
          >
            {/* Glow effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.15, scale: 1.2 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-white rounded-xl blur-xl"
            />

            {/* Text + Icon */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {displayIsBooking ? (
                <>
                  <Clock className="animate-spin" size={16} />
                  Booking...
                </>
              ) : isCheckingAvailability ? (
                <>
                  <Clock className="animate-spin" size={16} />
                  Checking availability...
                </>
              ) : (
                "Confirm Booking"
              )}
            </span>
          </motion.button>

        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;