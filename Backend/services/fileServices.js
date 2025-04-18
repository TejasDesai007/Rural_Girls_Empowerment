const fs = require('fs');
const path = require('path');

// Ensure the uploads directory exists
const createUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const toolkitsDir = path.join(uploadsDir, 'toolkit');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  
  if (!fs.existsSync(toolkitsDir)) {
    fs.mkdirSync(toolkitsDir);
  }
};

// Create directories on service initialization
createUploadsDirectory();

exports.createToolkitDirectory = (toolkitId) => {
  const toolkitDir = path.join(__dirname, `../uploads/toolkit/${toolkitId}`);
  
  if (!fs.existsSync(toolkitDir)) {
    fs.mkdirSync(toolkitDir, { recursive: true });
  }
  
  return toolkitDir;
};

exports.deleteToolkitDirectory = (toolkitId) => {
  const toolkitDir = path.join(__dirname, `../uploads/toolkit/${toolkitId}`);
  
  if (fs.existsSync(toolkitDir)) {
    fs.rmSync(toolkitDir, { recursive: true, force: true });
    return true;
  }
  
  return false;
};