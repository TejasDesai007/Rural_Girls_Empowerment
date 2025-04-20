import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeroBanner from "@/components/HeroBanner";
import AvailableMentorsList from "@/components/AvailableMentorsList";
import ScheduleSection from "@/components/ScheduleSection";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { CheckCircle, Calendar, ArrowLeft, UserCircle } from "lucide-react"; 

import { CardContainer, CardBody, CardItem } from "../components/ui/3d-card";

const MentorMatch = () => {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [menteeId, setMenteeId] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const mentorList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === "mentor");
        setMentors(mentorList);
      } catch (error) {
        console.error("Error fetching mentors:", error);
        toast.error("Could not load mentors. Please try again.");
      } finally {
        setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 text-gray-900">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <CardContainer className="w-full max-w-md">
            <CardBody className="bg-white rounded-xl p-8 shadow-xl">
              <CardItem translateZ={50} className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-4 mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Request Sent Successfully!</h3>
                <p className="text-gray-700 mb-4 text-lg">{successMessage}</p>
                <p className="text-gray-500 mb-6">You'll be notified when they respond.</p>
                <button
                  className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-md"
                  onClick={() => setShowSuccess(false)}
                >
                  Continue Browsing
                </button>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      )}

      <HeroBanner />
      
      {/* Main content area with improved layout */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Section header with context-aware title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedMentor ? 'Schedule Your Session' : 'Find Your Perfect Mentor'}
            </h2>
            <p className="text-gray-600 max-w-2xl">
              {selectedMentor 
                ? `Choose a time that works for both you and ${selectedMentor.name}.` 
                : 'Browse our expertly vetted mentors and find the right match for your career goals.'}
            </p>
          </div>
          
          {/* Back button when mentor is selected */}
          {selectedMentor && (
            <button 
              onClick={() => setSelectedMentor(null)}
              className="flex items-center text-pink-500 hover:text-pink-800 transition-colors font-medium"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Mentors
            </button>
          )}
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        )}
        
        {/* Conditional rendering based on selection state */}
        {!isLoading && (
          <div className="transition-all duration-300">
            {!selectedMentor ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                {mentors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map(mentor => (
                      <div
                        key={mentor.id}
                        className="overflow-hidden relative rounded-lg shadow-md bg-gradient-to-b from-pink-50 to-white h-96 flex flex-col justify-between p-6 border border-gray-200 group hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-row items-center space-x-4 z-10">
                          <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                            <UserCircle className="h-8 w-8 text-pink-500" />
                          </div>
                          <div className="flex flex-col">
                            <p className="font-medium text-lg text-gray-800">{mentor.name}</p>
                            <p className="text-sm text-green-600">Available</p>
                          </div>
                        </div>
                        
                        <div className="text-content mt-4">
                          <h3 className="font-bold text-xl text-gray-800 mb-2">
                            {mentor.title || "Professional Mentor"}
                          </h3>
                          <p className="text-gray-600 line-clamp-3">
                            {mentor.bio || "Experienced mentor ready to help you achieve your career goals and overcome challenges."}
                          </p>
                          
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Expertise:</h4>
                            <div className="flex flex-wrap gap-2">
                              {mentor.skills?.slice(0, 3).map((skill, index) => (
                                <span key={index} className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              )) || (
                                <>
                                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">Career Advice</span>
                                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">Leadership</span>
                                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">Communication</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button 
                            onClick={() => setSelectedMentor(mentor)}
                            className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center justify-center"
                          >
                            <Calendar className="h-5 w-5 mr-2" />
                            Book Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Mentors Available</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      There are currently no mentors available. Please check back later.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <ScheduleSection
                  selectedMentor={selectedMentor}
                  menteeId={menteeId}
                  onBooked={handleBookingComplete}
                  onBack={() => setSelectedMentor(null)}
                  isBooking={isBooking}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorMatch;