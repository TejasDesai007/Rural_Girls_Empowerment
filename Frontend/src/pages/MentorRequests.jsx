import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Clock, Calendar, User, X, Video, MessageSquare, Link as LinkIcon } from "lucide-react";

const MentorRequests = () => {
    const [mentorId, setMentorId] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [pastRequests, setPastRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // New states for the accept dialog
    const [showAcceptDialog, setShowAcceptDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [meetingDetails, setMeetingDetails] = useState({
        message: "",
        meetingLink: "",
        meetingPlatform: "google-meet"
    });

    //   State for validation
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setMentorId(user.uid);
            } else {
                // Redirect to login if not logged in
                // navigate("/login");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!mentorId) return;

        // Set up a real-time listener
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("mentorId", "==", mentorId)
        );

        setIsLoading(true);

        const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Split into pending and past requests
            const pending = bookings.filter(booking => booking.status === "pending");
            const past = bookings.filter(booking => booking.status !== "pending");

            // Sort by created date (newest first)
            pending.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
            past.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

            setPendingRequests(pending);
            setPastRequests(past);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching mentor requests:", error);
            toast.error("Failed to load your mentoring requests");
            setIsLoading(false);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, [mentorId]);

    const fetchRequests = async () => {
        if (!mentorId) return;

        setIsLoading(true);
        try {
            // Fetch all bookings for this mentor
            const bookingsQuery = query(
                collection(db, "bookings"),
                where("mentorId", "==", mentorId)
            );

            const bookingsSnapshot = await getDocs(bookingsQuery);
            const bookings = bookingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Split into pending and past requests
            const pending = bookings.filter(booking => booking.status === "pending");
            const past = bookings.filter(booking => booking.status !== "pending");

            // Sort by created date (newest first)
            pending.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
            past.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

            setPendingRequests(pending);
            setPastRequests(past);
        } catch (error) {
            console.error("Error fetching mentor requests:", error);
            toast.error("Failed to load your mentoring requests");
        } finally {
            setIsLoading(false);
        }
    };

    const openAcceptDialog = (request) => {
        setSelectedRequest(request);
        setShowAcceptDialog(true);
    };

    const closeAcceptDialog = () => {
        setShowAcceptDialog(false);
        setSelectedRequest(null);
        setMeetingDetails({
            message: "",
            meetingLink: "",
            meetingPlatform: "google-meet"
        });
    };

    const handleMeetingDetailsChange = (e) => {
        const { name, value } = e.target;
        setMeetingDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRequestAction = async (requestId, action) => {
        if (action === "accept" && !selectedRequest) {
            // This is the first click on Accept - show dialog instead of processing
            const request = pendingRequests.find(req => req.id === requestId);
            openAcceptDialog(request);
            return;
        }

        setProcessingId(requestId);

        try {
            // Get the booking document
            const bookingRef = doc(db, "bookings", requestId);
            const bookingDoc = (await getDocs(query(collection(db, "bookings"), where("__name__", "==", requestId)))).docs[0];

            if (!bookingDoc) {
                toast.error("Request not found");
                return;
            }

            const bookingData = bookingDoc.data();

            // Update the booking status
            const updateData = {
                status: action === "accept" ? "accepted" : "declined",
                updatedAt: serverTimestamp()
            };

            // Add meeting details if accepting
            if (action === "accept") {
                updateData.meetingDetails = {
                    message: meetingDetails.message,
                    meetingLink: meetingDetails.meetingLink,
                    meetingPlatform: meetingDetails.meetingPlatform,
                };
            }

            await updateDoc(bookingRef, updateData);

            // Create notification for the mentee
            const notificationTitle = action === "accept"
                ? "✅ Mentoring Request Accepted"
                : "❌ Mentoring Request Declined";

            const notificationDescription = action === "accept"
                ? `${bookingData.mentorName} has accepted your mentoring request for ${bookingData.date} at ${bookingData.timeSlot}.${meetingDetails.message ? ` Message: ${meetingDetails.message}` : ""}`
                : `${bookingData.mentorName} has declined your mentoring request for ${bookingData.date} at ${bookingData.timeSlot}.`;

            await addDoc(collection(db, "notifications"), {
                title: notificationTitle,
                description: notificationDescription,
                type: "mentee",
                read: false,
                createdAt: serverTimestamp(),
                menteeId: bookingData.menteeId,
                mentorId: mentorId,
                sessionDetails: {
                    date: bookingData.date,
                    timeSlot: bookingData.timeSlot,
                    status: action === "accept" ? "accepted" : "declined",
                    bookingId: requestId,
                    ...(action === "accept" && {
                        meetingDetails: {
                            message: meetingDetails.message,
                            meetingLink: meetingDetails.meetingLink,
                            meetingPlatform: meetingDetails.meetingPlatform,
                        }
                    })
                }
            });

            // Update local state
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
            setPastRequests(prev => [
                {
                    ...bookingData,
                    id: requestId,
                    status: action === "accept" ? "accepted" : "declined",
                    updatedAt: new Date(),
                    ...(action === "accept" && {
                        meetingDetails: {
                            message: meetingDetails.message,
                            meetingLink: meetingDetails.meetingLink,
                            meetingPlatform: meetingDetails.meetingPlatform,
                        }
                    })
                },
                ...prev
            ]);

            toast.success(
                action === "accept"
                    ? "You've accepted the mentoring request"
                    : "You've declined the mentoring request"
            );

            // Close dialog if open
            closeAcceptDialog();

        } catch (error) {
            console.error("Error processing request:", error);
            toast.error("Failed to update the request");
        } finally {
            setProcessingId(null);
        }
    };

    const submitAcceptWithDetails = () => {
        if (!selectedRequest) return;

        // Reset validation errors
        setValidationErrors({});

        // Validate meeting link if provided
        if (meetingDetails.meetingLink) {
            if (!isValidUrl(meetingDetails.meetingLink)) {
                setValidationErrors(prev => ({
                    ...prev,
                    meetingLink: "Please enter a valid URL (e.g., https://zoom.us/j/123456)"
                }));
                return;
            }
        }

        handleRequestAction(selectedRequest.id, "accept");
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const formatDate = (date) => {
        if (!date) return "Unknown date";

        if (typeof date === "string") {
            return date;
        }

        try {
            // If it's a Firebase timestamp
            if (date.toDate) {
                date = date.toDate();
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            console.error("Date formatting error:", e);
            return "Invalid date";
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
            case "accepted":
                return <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</span>;
            case "declined":
                return <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full flex items-center"><XCircle className="w-3 h-3 mr-1" /> Declined</span>;
            case "completed":
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-full">{status}</span>;
        }
    };

    const getMeetingPlatformLabel = (platform) => {
        switch (platform) {
            case "google-meet":
                return "Google Meet";
            case "zoom":
                return "Zoom";
            case "ms-teams":
                return "Microsoft Teams";
            case "discord":
                return "Discord";
            case "other":
                return "Other Platform";
            default:
                return platform;
        }
    };

    const renderRequestCard = (request, isPending = false) => (
        <div key={request.id} className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div className="flex-1">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{request.menteeName || "Anonymous Mentee"}</h3>
                            <div className="flex items-center text-sm text-gray-600">
                                {getStatusBadge(request.status)}
                                <span className="mx-2">•</span>
                                <span className="text-xs text-gray-500">Request ID: {request.id.substring(0, 6)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 mb-6">
                        <div className="flex items-center mb-2">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-700">{request.date || "No date specified"}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-700">{request.timeSlot || "No time specified"}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Requested on {formatDate(request.createdAt)}
                        </div>
                    </div>

                    {/* Show meeting details if accepted */}
                    {request.status === "accepted" && request.meetingDetails && (
                        <div className="mt-2 pt-3 border-t border-gray-100">
                            <h4 className="font-medium text-gray-800 mb-2">Meeting Details</h4>

                            {request.meetingDetails.meetingPlatform && (
                                <div className="flex items-center mb-2">
                                    <Video className="w-4 h-4 text-gray-600 mr-2" />
                                    <span className="text-gray-700">{getMeetingPlatformLabel(request.meetingDetails.meetingPlatform)}</span>
                                </div>
                            )}

                            {request.meetingDetails.meetingLink && (
                                <div className="flex items-center mb-2">
                                    <LinkIcon className="w-4 h-4 text-gray-600 mr-2" />
                                    <a href={request.meetingDetails.meetingLink} target="_blank" rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline truncate max-w-md">
                                        {request.meetingDetails.meetingLink}
                                    </a>
                                </div>
                            )}

                            {request.meetingDetails.message && (
                                <div className="flex items-start mb-2">
                                    <MessageSquare className="w-4 h-4 text-gray-600 mr-2 mt-1" />
                                    <p className="text-gray-700 whitespace-pre-line">{request.meetingDetails.message}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isPending && (
                    <div className="flex space-x-2 mt-4 md:mt-0">
                        <button
                            disabled={processingId === request.id}
                            onClick={() => openAcceptDialog(request)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                        </button>
                        <button
                            disabled={processingId === request.id}
                            onClick={() => handleRequestAction(request.id, "decline")}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Render the accept dialog
    const renderAcceptDialog = () => {
        if (!showAcceptDialog || !selectedRequest) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Accept Mentoring Request</h3>
                        <button onClick={closeAcceptDialog} className="text-gray-400 hover:text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{selectedRequest.menteeName || "Anonymous Mentee"}</h4>
                                    <div className="text-sm text-gray-500">
                                        {selectedRequest.date} at {selectedRequest.timeSlot}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="meetingPlatform" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting Platform
                                </label>
                                <select
                                    id="meetingPlatform"
                                    name="meetingPlatform"
                                    value={meetingDetails.meetingPlatform}
                                    onChange={handleMeetingDetailsChange}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                                >
                                    <option value="google-meet">Google Meet</option>
                                    <option value="zoom">Zoom</option>
                                    <option value="ms-teams">Microsoft Teams</option>
                                    <option value="discord">Discord</option>
                                    <option value="other">Other Platform</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting Link
                                </label>
                                <input
                                    type="url"
                                    id="meetingLink"
                                    name="meetingLink"
                                    value={meetingDetails.meetingLink}
                                    onChange={handleMeetingDetailsChange}
                                    placeholder="https://..."
                                    className={`w-full border ${validationErrors.meetingLink ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500`}
                                />
                                {validationErrors.meetingLink && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {validationErrors.meetingLink}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Provide a link to your virtual meeting room
                                </p>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                    Message to Mentee (Optional)
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    value={meetingDetails.message}
                                    onChange={handleMeetingDetailsChange}
                                    placeholder="Add any additional information or instructions for the mentee..."
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                        <button
                            onClick={closeAcceptDialog}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitAcceptWithDetails}
                            disabled={processingId !== null}
                            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept Request
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 text-black">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold mb-2">Mentor Dashboard</h1>
                    <p className="text-black-100">Manage your mentoring requests and sessions</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">Pending Requests</h2>
                        <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm">
                            {pendingRequests.length} pending
                        </span>
                    </div>

                    {pendingRequests.length > 0 ? (
                        <div className="space-y-4">
                            {pendingRequests.map(request => renderRequestCard(request, true))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No Pending Requests</h3>
                            <p className="text-gray-500">You don't have any pending mentoring requests at the moment.</p>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-6">Past Requests</h2>

                    {pastRequests.length > 0 ? (
                        <div className="space-y-4">
                            {pastRequests.map(request => renderRequestCard(request))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No Past Requests</h3>
                            <p className="text-gray-500">Your past mentoring requests will appear here.</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Render the accept dialog */}
            {renderAcceptDialog()}
        </div>
    );
};

export default MentorRequests;