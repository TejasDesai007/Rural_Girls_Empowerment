const firebaseService = require('./firebaseService');
const fileService = require('./fileServices');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

exports.createToolkit = async (toolkitData) => {
  try {
    // First, create the toolkit entry in Firebase to get the ID
    const toolkitId = await firebaseService.createToolkit({
      title: toolkitData.title,
      description: toolkitData.description,
      category: toolkitData.category,
      createdAt: new Date(),
    });

    // Create directory for this toolkit's files
    const toolkitDir = path.join(__dirname, `../uploads/toolkit/${toolkitId}`);
    if (!fs.existsSync(toolkitDir)) {
      fs.mkdirSync(toolkitDir, { recursive: true });
    }

    // Process and move files from temp directory to the toolkit directory
    const fileDetails = await Promise.all(
      toolkitData.files.map(async (file) => {
        const destination = path.join(toolkitDir, file.filename);
        
        // Move file from temp to final location
        fs.renameSync(file.path, destination);
        
        // Return file details with public URL
        return {
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: `/uploads/toolkit/${toolkitId}/${file.filename}`
        };
      })
    );

    // Update toolkit in Firebase with file information
    await firebaseService.updateToolkit(toolkitId, {
      files: fileDetails
    });

    // Get the complete toolkit data
    const toolkit = await firebaseService.getToolkitById(toolkitId);
    
    return toolkit;
  } catch (error) {
    console.error('Error creating toolkit:', error);
    throw error;
  }
};

exports.getToolkitById = async (id) => {
  return await firebaseService.getToolkitById(id);
};

exports.getAllToolkits = async () => {
  return await firebaseService.getAllToolkits();
};

exports.updateToolkit = async (id, updateData) => {
  return await firebaseService.updateToolkit(id, updateData);
};

exports.deleteToolkit = async (id) => {
  try {
    // Get toolkit first to check if it exists and get file paths
    const toolkit = await firebaseService.getToolkitById(id);
    
    if (!toolkit) {
      return false;
    }
    
    // Delete all files associated with this toolkit
    const toolkitDir = path.join(__dirname, `../uploads/toolkit/${id}`);
    if (fs.existsSync(toolkitDir)) {
      fs.rmSync(toolkitDir, { recursive: true, force: true });
    }
    
    // Delete toolkit from Firestore
    await firebaseService.deleteToolkit(id);
    
    return true;
  } catch (error) {
    console.error('Error deleting toolkit:', error);
    throw error;
  }
};

exports.downloadToolkitFiles = async (req, res, toolkitId) => {
  try {
    // Get toolkit data from Firebase
    const toolkit = await firebaseService.getToolkitById(toolkitId);
    console.log(toolkit);
    if (!toolkit || !toolkit.files || toolkit.files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Toolkit not found or no files available'
      });
    }
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${toolkit.title.replace(/\s+/g, '-')}-toolkit.zip`);
    
    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Pipe the archive to the response
    archive.pipe(res);
    
    // Get the directory of the toolkit files
    const toolkitDir = path.join(__dirname, `../uploads/toolkit/${toolkitId}`);
    
    // Check if directory exists
    if (!fs.existsSync(toolkitDir)) {
      return res.status(404).json({
        success: false,
        message: 'Toolkit files not found on the server'
      });
    }
    
    // Add each file to the archive
    for (const fileInfo of toolkit.files) {
      const filePath = path.join(toolkitDir, fileInfo.fileName);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Add file to archive with its original name
        archive.file(filePath, { name: fileInfo.originalName || fileInfo.fileName });
      }
    }
    
    // Finalize the archive and send the response
    await archive.finalize();
    
  } catch (error) {
    console.error('Error creating zip file:', error);
    
    // If we've already started sending a response, we can't send an error status
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to create zip file'
      });
    } else {
      // Otherwise, end the response
      res.end();
    }
  }
};