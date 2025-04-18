// pages/MentorMatch.jsx
import React, { useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import AvailableMentorsList from "@/components/AvailableMentorsList";
import ScheduleSection from "@/components/ScheduleSection";

const MentorMatch = () => {
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleBookingComplete = () => {
    setSelectedMentor(null);
    alert("Booking request sent!");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeroBanner />
      <section className="max-w-6xl mx-auto px-4 py-12">
        {!selectedMentor ? (
          <AvailableMentorsList onMentorSelect={setSelectedMentor} />
        ) : (
          <ScheduleSection
            selectedMentor={selectedMentor}
            onBooked={handleBookingComplete}
          />
        )}
      </section>
    </div>
  );
};

export default MentorMatch; 