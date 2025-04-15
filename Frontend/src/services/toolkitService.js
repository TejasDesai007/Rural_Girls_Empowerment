import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Assumes db is exported from firebase.jsx

// Fetch all toolkits from Firestore
export const getAllToolkits = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "toolkits"));
    const toolkitList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return toolkitList;
  } catch (error) {
    console.error("Error fetching toolkits:", error);
    return [];
  }
};
