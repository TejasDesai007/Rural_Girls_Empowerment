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

  const handleBookingComplete = async (bookingData) => {
    try {
      // Get mentee details
      const auth = getAuth();
      const mentee = auth.currentUser;
      const menteeName = mentee?.displayName || "A mentee";
      
      // Format the date for better readability
      const bookingDate = bookingData?.date || new Date().toLocaleDateString("en-CA");
      const timeSlot = bookingData?.timeSlot || "unspecified time";
      
      // Create notification with detailed information
      await addDoc(collection(db, "notifications"), {
        title: "🔔 New Mentor Request",
        description: `${menteeName} has requested a mentoring session on ${bookingDate} at ${timeSlot}.`,
        type: "mentee",
        read: false,
        createdAt: new Date(),
        mentorId: selectedMentor.id,
        menteeId: menteeId,
        sessionDetails: {
          date: bookingDate,
          timeSlot: timeSlot,
          status: "pending",
          mentorName: selectedMentor.name
        }
      });
  
      // UI is already reset by the original function
      // no need for additional alert since toast is already shown
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to send notification to mentor");
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