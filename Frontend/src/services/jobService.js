import { db } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

const jobCollection = collection(db, "jobPostings");

export const addJobPosting = async (jobData) => {
  return await addDoc(jobCollection, {
    ...jobData,
    timestamp: serverTimestamp()
  });
};

export const getAllJobPostings = async () => {
  const snapshot = await getDocs(jobCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
