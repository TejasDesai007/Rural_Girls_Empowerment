const toolkitService = require('../services/toolkitService');

exports.downloadToolkit = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if toolkit exists
    const toolkit = await toolkitService.getToolkitById(id);
    
    if (!toolkit) {
      return res.status(404).json({
        success: false,
        message: 'Toolkit not found'
      });
    }
    
    // Call the toolkit service to create and send the zip file
    await toolkitService.downloadToolkitFiles(req, res, id);
    
    // The response is handled within the service
  } catch (error) {
    next(error);
  }
};

exports.createToolkit = async (req, res, next) => {
  try {
    // Extract data from request
    const { title, description, category } = req.body;
    const files = req.files;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one file is required'
      });
    }

    // Parse categories (sent as JSON string from form data)
    let categories = [];
    try {
      categories = category ? JSON.parse(category) : [];
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category format'
      });
    }

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one category is required'
      });
    }

    // Create toolkit
    const result = await toolkitService.createToolkit({
      title,
      description,
      category: categories,
      files
    });

    res.status(201).json({
      success: true,
      message: 'Toolkit created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getToolkitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const toolkit = await toolkitService.getToolkitById(id);
    
    if (!toolkit) {
      return res.status(404).json({
        success: false,
        message: 'Toolkit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: toolkit
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllToolkits = async (req, res, next) => {
  try {
    const toolkits = await toolkitService.getAllToolkits();
    
    res.status(200).json({
      success: true,
      data: toolkits
    });
  } catch (error) {
    next(error);
  }
};

exports.updateToolkit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const toolkit = await toolkitService.updateToolkit(id, updateData);
    
    if (!toolkit) {
      return res.status(404).json({
        success: false,
        message: 'Toolkit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toolkit updated successfully',
      data: toolkit
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteToolkit = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await toolkitService.deleteToolkit(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Toolkit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toolkit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
