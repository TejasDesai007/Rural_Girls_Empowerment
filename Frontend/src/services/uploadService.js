// src/services/uploadService.js

import { storage } from "../firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

// Function to upload an image file to Firebase Storage
const uploadFile = async (file) => {
  // Create a unique file name using the current timestamp and the original file name
  const fileName = `${Date.now()}-${file.name}`
  
  // Create a reference to the Firebase Storage location
  const storageRef = ref(storage, `images/${fileName}`)
  
  // Upload the file to Firebase Storage
  const uploadTask = uploadBytesResumable(storageRef, file)
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: You can track upload progress here
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log(`Upload is ${progress}% done`)
      },
      (error) => {
        console.error("Upload failed:", error)
        reject("Error uploading image")
      },
      async () => {
        // Get the download URL once the upload is complete
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        } catch (error) {
          reject("Failed to get download URL")
        }
      }
    )
  })
}

export default uploadFile
