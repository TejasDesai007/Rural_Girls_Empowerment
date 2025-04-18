import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation import
import HeroBanner from "@/components/HeroBanner";
import AvailableMentorsList from "@/components/AvailableMentorsList";
import ScheduleSection from "@/components/ScheduleSection";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
const MentorMatch = () => {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [menteeId, setMenteeId] = useState(null);
  const [mentors, setMentors] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMenteeId(user.uid);
      }
    });

    const fetchMentors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const mentorList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === "mentor");
        setMentors(mentorList);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchMentors();

    return () => unsubscribe();
  }, []);

  // Handle redirect from login with mentorId
  useEffect(() => {
    if (location.state?.mentorId) {
      const mentor = mentors.find(m => m.id === location.state.mentorId);
      if (mentor) {
        setSelectedMentor(mentor);
      }
    }
  }, [location.state, mentors]);

  const handleBookingComplete = async () => {
    try {
      // First, create a notification for the mentor
      await addDoc(collection(db, "notifications"), {
        title: "🔔 New Mentor Request",
        description: `You have a new mentoring request from a mentee.`,
        type: "mentee",
        read: false,
        createdAt: new Date(),
        mentorId: selectedMentor.id, // Add this so you can filter notifications by mentor
        menteeId: menteeId, // Optional: Include who sent the request
      });

      // Then reset the UI
      setSelectedMentor(null);
      alert("Booking request sent successfully!");
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Failed to send booking request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeroBanner />
      <section className="max-w-6xl mx-auto px-4 py-12">
        {!selectedMentor ? (
          <AvailableMentorsList
            mentors={mentors}
            onMentorSelect={setSelectedMentor}
          />
        ) : (
          <ScheduleSection
            selectedMentor={selectedMentor}
            menteeId={menteeId}
            onBooked={handleBookingComplete}
            onBack={() => setSelectedMentor(null)}
          />
        )}
      </section>
    </div>
  );
};

export default MentorMatch;