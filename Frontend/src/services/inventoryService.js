import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
  } from "firebase/firestore";
  import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
  import { getAuth } from "firebase/auth";
  
  // Initialize Firebase instances
  const db = getFirestore();
  const storage = getStorage();
  const auth = getAuth();
  
  /**
   * Uploads product image to Firebase Storage and returns the public URL.
   * @param {File} file
   * @returns {Promise<string>} imageUrl
   */
  export const uploadImageAndGetURL = async (file) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
  
    const storageRef = ref(storage, `products/${user.uid}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };
  
  /**
   * Adds a new product document to Firestore under "products" collection.
   * @param {Object} productData
   */
  export const addProduct = async (productData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
  
    const productWithMeta = {
      ...productData,
      userId: user.uid,
      createdAt: new Date(),
    };
  
    await addDoc(collection(db, "products"), productWithMeta);
  };
  
  /**
   * Fetch all products created by a specific user.
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  export const getProductsByUser = async (userId) => {
    const q = query(collection(db, "products"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };
  
  /**
   * Calculate total estimated revenue from user’s products.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  export const getRevenueStats = async (userId) => {
    const products = await getProductsByUser(userId);
    return products.reduce((acc, prod) => {
      const price = parseFloat(prod.price) || 0;
      const quantity = parseInt(prod.quantity) || 0;
      return acc + price * quantity;
    }, 0);
  };
  