// components/ScheduleSection.jsx
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const ScheduleSection = ({ selectedMentor, menteeId, onBooked }) => {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState(null);

  const handleBookSession = async () => {
    if (!timeSlot || !menteeId) return;

    await addDoc(collection(db, "mentorship_requests"), {
      mentorId: selectedMentor.id,
      menteeId,
      date: date.toISOString().split("T")[0],
      timeSlot,
      status: "pending",
      createdAt: new Date(),
    });

    onBooked(); // Notify parent
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6">
        Schedule with {selectedMentor.name}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </div>
        <div>
          <p className="font-medium mb-2">Select a Time Slot</p>
          <div className="grid grid-cols-2 gap-3">
            {["10:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"].map((slot, idx) => (
              <Button
                key={idx}
                variant={timeSlot === slot ? "default" : "outline"}
                onClick={() => setTimeSlot(slot)}
                className="flex items-center gap-2"
              >
                <Clock size={16} />
                {slot}
              </Button>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={handleBookSession} disabled={!timeSlot}>
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;
