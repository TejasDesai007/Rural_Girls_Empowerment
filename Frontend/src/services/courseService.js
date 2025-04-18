// src/services/courseService.js

const submitCourse = async (courseData) => {
    const endpoint = "/api/courses"; // Replace with your API endpoint for submitting courses
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit course");
      }
  
      const data = await response.json();
      return data; // Assuming API returns the course data after creation
    } catch (error) {
      console.error("Error submitting course:", error);
      throw new Error("There was an error submitting the course. Please try again.");
    }
  };
  
  export { submitCourse };
  