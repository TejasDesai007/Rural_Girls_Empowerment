// src/services/mentorService.js

const BASE_URL = "http://localhost:5000/api/mentors"; // Adjust to your backend

// ✅ Submit new course (Add this function)
export const submitCourse = async (courseData) => {
  try {
    const res = await fetch(`${BASE_URL}/add-course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!res.ok) {
      throw new Error("Failed to submit course");
    }

    return await res.json();
  } catch (error) {
    console.error("Error submitting course:", error);
    throw error;
  }
};

// Existing functions
export const getMentorProfile = async (uid) => {
  const res = await fetch(`${BASE_URL}/${uid}`);
  if (!res.ok) throw new Error("Failed to fetch mentor profile");
  return await res.json();
};

export const updateMentorProfile = async (uid, updates) => {
  const res = await fetch(`${BASE_URL}/${uid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update mentor profile");
  return await res.json();
};

export const deleteMentorAccount = async (uid) => {
  const res = await fetch(`${BASE_URL}/${uid}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete mentor account");
  return await res.json();
};
