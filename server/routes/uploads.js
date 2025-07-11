const express = require('express');
const upload = require('../utils/upload');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Debug route - no auth, no file upload
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Upload route is working', 
    timestamp: new Date().toISOString() 
  });
});

// Upload a single image - bypass auth temporarily for testing
router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Double check that the file was actually saved
    const filePath = req.file.path;
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists) {
      console.error(`File was not saved to disk: ${filePath}`);
      return res.status(500).json({ message: 'File upload failed - file not saved to disk' });
    }
    
    // Generate URL for the uploaded file - use absolute path from server root
    const filename = path.basename(req.file.path);
    const fileUrl = `/uploads/${filename}`;
    
    console.log(`File uploaded successfully: ${req.file.path}`);
    console.log(`URL to access file: ${fileUrl}`);
    
    // Return success response with full URL details
    res.json({
      fileUrl,
      filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Test endpoint to verify file access
router.get('/check/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  console.log(`Checking file: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    res.json({
      exists: true,
      path: filePath,
      url: `/uploads/${filename}`,
      size: fs.statSync(filePath).size,
      message: 'File exists and is accessible'
    });
  } else {
    res.status(404).json({
      exists: false,
      path: filePath,
      message: 'File does not exist'
    });
  }
});

// Handle error for file uploads that exceed size limit
router.use((err, req, res, next) => {
  console.error('Upload error middleware caught:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: 'File is too large. Maximum size is 5MB.' 
    });
  }
  
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: err.message });
  }
  
  console.error('Upload error:', err);
  res.status(500).json({ message: 'Server error during file upload', error: err.message });
});

module.exports = router; 