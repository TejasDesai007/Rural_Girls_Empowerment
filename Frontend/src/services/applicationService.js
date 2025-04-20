import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const submitApplication = async (jobId, userData) => {
  const applicationRef = collection(db, "jobApplications");
  await addDoc(applicationRef, {
    jobId,
    ...userData,
    timestamp: serverTimestamp()
  });
};
