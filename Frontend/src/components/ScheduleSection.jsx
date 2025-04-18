import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ScheduleSection = ({ selectedMentor, menteeId, onBooked, onBack }) => {
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

        const q = query(
          collection(db, "mentorship_requests"),
          where("mentorId", "==", selectedMentor.id),
          where("date", "==", dateString),
          where("timeSlot", "==", timeSlot),
          where("status", "==", "confirm")
        );

        const querySnapshot = await getDocs(q);
        const available = querySnapshot.empty;
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

    toast.promise(
      async () => {
        const bookingData = {
          mentorId: selectedMentor.id,
          menteeId,
          date: date.toLocaleDateString("en-CA"),
          timeSlot,
          status: "pending",
          mentorName: selectedMentor.name,
          createdAt: new Date(),
        };

        await addDoc(collection(db, "mentorship_requests"), bookingData);
        onBooked();

        return bookingData;
      },
      {
        loading: `Requesting session with ${selectedMentor.name}...`,
        success: (data) => (
          <div className="space-y-1">
            <p className="font-medium">Session requested!</p>
            <p className="text-sm">
              {data.date} at {data.timeSlot}
            </p>
          </div>
        ),
        error: (error) => {
          console.error("Booking failed:", error);
          return `Failed to book session: ${error.message}`;
        },
      }
    ).finally(() => setIsBooking(false));
  };

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Schedule with {selectedMentor.name}
        </h2>
        <Button variant="ghost" onClick={onBack}>
          Back to mentors
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
            fromDate={new Date()}
          />
        </div>
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-2">Select a Time Slot</p>
            <div className="grid grid-cols-2 gap-3">
              {["10:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"].map((slot) => (
                <Button
                  key={slot}
                  variant={timeSlot === slot ? "default" : "outline"}
                  onClick={() => setTimeSlot(slot)}
                  className="flex items-center gap-2"
                  disabled={isCheckingAvailability}
                >
                  <Clock size={16} />
                  {slot}
                </Button>
              ))}
            </div>
          </div>

          {timeSlot && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Selected:</span>
                <span>
                  {date.toLocaleDateString()} at {timeSlot}
                </span>
              </div>
              {!isAvailable && (
                <p className="text-sm text-red-500">
                  This slot is unavailable - {selectedMentor.name} has a conflicting session
                </p>
              )}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleBookSession}
            disabled={!timeSlot || !isAvailable || isCheckingAvailability || isBooking}
          >
            {isBooking ? (
              <span className="flex items-center gap-2">
                <Clock className="animate-spin" size={16} />
                Booking...
              </span>
            ) : isCheckingAvailability ? (
              <span className="flex items-center gap-2">
                <Clock className="animate-spin" size={16} />
                Checking availability...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </Button>

        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;