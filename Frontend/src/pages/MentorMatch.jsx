import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeroBanner from "@/components/HeroBanner";
import AvailableMentorsList from "@/components/AvailableMentorsList";
import ScheduleSection from "@/components/ScheduleSection";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react"; // Import CheckCircle icon

const MentorMatch = () => {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [menteeId, setMenteeId] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMenteeId(user.uid);
        // Check if user has a role stored in sessionStorage
        const storedRole = sessionStorage.getItem("role");
        if (!storedRole || storedRole === "guest") {
          // If no role or guest role, redirect to login
          toast.error("Please login to access mentor matching");
          navigate("/login", { state: { returnUrl: location.pathname } });
        }
      } else {
        // User is not logged in, redirect to login page
        toast.error("Please login to access mentor matching");
        navigate("/login", { state: { returnUrl: location.pathname } });
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
  }, [navigate, location.pathname]);

  // Handle redirect from login with mentorId
  useEffect(() => {
    if (location.state?.mentorId) {
      const mentor = mentors.find(m => m.id === location.state.mentorId);
      if (mentor) {
        setSelectedMentor(mentor);
      }
    }
  }, [location.state, mentors]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleBookingComplete = async (bookingData) => {
    if (!selectedMentor || !menteeId) {
      toast.error("Missing mentor or mentee information");
      return;
    }

    setIsBooking(true);

    try {
      // Get mentee details
      const auth = getAuth();
      const mentee = auth.currentUser;
      const menteeName = mentee?.displayName || "A mentee";

      // Format the date for better readability
      const bookingDate = bookingData?.date || new Date().toLocaleDateString("en-CA");
      const timeSlot = bookingData?.timeSlot || "unspecified time";

      // Create notification with detailed information
      const notificationRef = await addDoc(collection(db, "notifications"), {
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

      // Also add a booking record
      await addDoc(collection(db, "bookings"), {
        mentorId: selectedMentor.id,
        menteeId: menteeId,
        menteeName: menteeName,
        mentorName: selectedMentor.name,
        date: bookingDate,
        timeSlot: timeSlot,
        status: "pending",
        createdAt: new Date(),
        notificationId: notificationRef.id
      });

      // Set success message with mentor's name
      setSuccessMessage(`Request sent to ${selectedMentor.name}!`);
      setShowSuccess(true);

      // Show toast as well
      toast.success(`Booking request sent to ${selectedMentor.name}!`);

      // Reset selection after successful booking
      setSelectedMentor(null);
    } catch (error) {
      console.error("Error creating notification and booking:", error);
      toast.error("Failed to send notification to mentor");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-4 animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-green-100 p-4 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">Request Sent Successfully!</h3>
              <p className="text-gray-600 mb-4">{successMessage}</p>
              <p className="text-gray-500 text-sm">You'll be notified when they respond.</p>
              <button
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setShowSuccess(false)}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

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
            isBooking={isBooking}
          />
        )}
      </section>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default MentorMatch;