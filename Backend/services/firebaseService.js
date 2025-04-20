const { db } = require('../config/firebase');

// Toolkits collection reference
const toolkitsCollection = db.collection('toolkits');

exports.createToolkit = async (toolkitData) => {
  try {
    // Add document to Firestore and get the auto-generated ID
    const docRef = await toolkitsCollection.add(toolkitData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating toolkit in Firebase:', error);
    throw error;
  }
};

exports.getToolkitById = async (id) => {
  try {
    const doc = await toolkitsCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting toolkit from Firebase:', error);
    throw error;
  }
};

exports.getAllToolkits = async () => {
  try {
    const snapshot = await toolkitsCollection.orderBy('createdAt', 'desc').get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all toolkits from Firebase:', error);
    throw error;
  }
};

exports.updateToolkit = async (id, updateData) => {
  try {
    // Make sure the toolkit exists
    const doc = await toolkitsCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    // Update the document
    await toolkitsCollection.doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });
    
    // Return the updated toolkit
    return await exports.getToolkitById(id);
  } catch (error) {
    console.error('Error updating toolkit in Firebase:', error);
    throw error;
  }
};

exports.deleteToolkit = async (id) => {
  try {
    // Make sure the toolkit exists before deletion
    const doc = await toolkitsCollection.doc(id).get();
    
    if (!doc.exists) {
      return false;
    }
    
    // Delete the document
    await toolkitsCollection.doc(id).delete();
    
    return true;
  } catch (error) {
    console.error('Error deleting toolkit from Firebase:', error);
    throw error;
  }
};