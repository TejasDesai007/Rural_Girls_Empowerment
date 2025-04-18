const express = require('express');
const router = express.Router();
const toolkitController = require('../controllers/toolkitController');
const upload = require('../middlewares/upload');

// Route for creating a new toolkit with file uploads
router.post('/', upload.array('files'), toolkitController.createToolkit);

// Get a toolkit by ID
router.get('/:id', toolkitController.getToolkitById);

// Get all toolkits
router.get('/', toolkitController.getAllToolkits);

// Update a toolkit
router.put('/:id', toolkitController.updateToolkit);

// Delete a toolkit
router.delete('/:id', toolkitController.deleteToolkit);

router.get('/:id/download', toolkitController.downloadToolkit);


module.exports = router;