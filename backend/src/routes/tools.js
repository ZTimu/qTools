const express = require('express');
const router = express.Router();
const ViewController = require('../controllers/ViewController');
const ToolController = require('../controllers/ToolController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads (unchanged)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const toolType = req.baseUrl.split('/')[1];
        
        switch (toolType) {
            case 'pdf-to-word':
                if (file.mimetype === 'application/pdf') {
                    cb(null, true);
                } else {
                    cb(new Error('Only PDF files are allowed!'), false);
                }
                break;

            case 'image-to-text':
                if (file.mimetype.startsWith('image/')) {
                    cb(null, true);
                } else {
                    cb(new Error('Only image files are allowed!'), false);
                }
                break;

            default:
                cb(null, true);
        }
    }
});

// View routes - Updated to ensure proper controller usage
router.get('/currency-converter', ViewController.renderCurrencyConverter);
router.get('/calculator', ViewController.renderCalculator);
router.get('/calculators', ViewController.renderCalculator); // Handle both routes

// Calculator API routes
router.post('/calculator/calculate', ToolController.calculateOperation);

// Tool functionality routes (unchanged)
router.post('/pdf-to-word', upload.single('pdfFile'), ToolController.convertPdfToWord);

// Image to Text route with improved error handling
router.post('/image-to-text', function(req, res, next) {
    // Log the request
    console.log('Image to text request received');
    
    // Configure multer specifically for image uploads
    multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: function(req, file, cb) {
            console.log('Received file:', file.originalname, file.mimetype);
            
            // Check if it's an image file
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed!'), false);
            }
        }
    }).single('imageFile')(req, res, function(err) {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: err.message });
        }
        
        // Check if file was uploaded
        if (!req.file) {
            console.error('No file was uploaded');
            return res.status(400).json({ error: 'No image file was uploaded' });
        }
        
        console.log('File uploaded successfully:', req.file.path);
        
        // Process with OCR
        ToolController.convertImageToText(req, res).catch(error => {
            console.error('OCR processing error:', error);
            return res.status(500).json({ error: 'Error processing image' });
        });
    });
});

// Conversion APIs (unchanged)
router.post('/convert-temperature', (req, res) => {
    try {
        const { value, fromUnit, toUnit } = req.body;

        if (!value || !fromUnit || !toUnit) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const numValue = parseFloat(value);
        let result;
        let celsius;

        switch (fromUnit) {
            case 'celsius':
                celsius = numValue;
                break;
            case 'fahrenheit':
                celsius = (numValue - 32) * 5 / 9;
                break;
            case 'kelvin':
                celsius = numValue - 273.15;
                break;
            default:
                return res.status(400).json({ error: 'Invalid temperature unit' });
        }

        switch (toUnit) {
            case 'celsius':
                result = celsius;
                break;
            case 'fahrenheit':
                result = (celsius * 9 / 5) + 32;
                break;
            case 'kelvin':
                result = celsius + 273.15;
                break;
            default:
                return res.status(400).json({ error: 'Invalid temperature unit' });
        }

        return res.json({
            success: true,
            result: parseFloat(result.toFixed(4)),
            from: { value: numValue, unit: fromUnit },
            to: { value: result, unit: toUnit }
        });
    } catch (error) {
        console.error('Error converting temperature:', error);
        return res.status(500).json({ error: 'Error processing conversion' });
    }
});

router.post('/convert-mass', (req, res) => {
    try {
        const { value, fromUnit, toUnit } = req.body;

        if (!value || !fromUnit || !toUnit) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const numValue = parseFloat(value);
        let result;
        let grams;

        switch (fromUnit) {
            case 'kg':
                grams = numValue * 1000;
                break;
            case 'g':
                grams = numValue;
                break;
            case 'mg':
                grams = numValue / 1000;
                break;
            case 'lb':
                grams = numValue * 453.592;
                break;
            case 'oz':
                grams = numValue * 28.3495;
                break;
            default:
                return res.status(400).json({ error: 'Invalid mass unit' });
        }

        switch (toUnit) {
            case 'kg':
                result = grams / 1000;
                break;
            case 'g':
                result = grams;
                break;
            case 'mg':
                result = grams * 1000;
                break;
            case 'lb':
                result = grams / 453.592;
                break;
            case 'oz':
                result = grams / 28.3495;
                break;
            default:
                return res.status(400).json({ error: 'Invalid mass unit' });
        }

        return res.json({
            success: true,
            result: parseFloat(result.toFixed(6)),
            from: { value: numValue, unit: fromUnit },
            to: { value: result, unit: toUnit }
        });
    } catch (error) {
        console.error('Error converting mass:', error);
        return res.status(500).json({ error: 'Error processing conversion' });
    }
});

router.post('/generate-qr', (req, res) => {
    try {
        const { content, size, color, bgColor } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'QR code content is required' });
        }

        const qrSize = size || 256;
        const qrColor = color || '#000000';
        const qrBgColor = bgColor || '#FFFFFF';

        const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(content)}&color=${qrColor.replace('#', '')}&bgcolor=${qrBgColor.replace('#', '')}`;

        return res.json({
            success: true,
            qrCode: qrDataUrl,
            content: content,
            size: qrSize,
            color: qrColor,
            bgColor: qrBgColor
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        return res.status(500).json({ error: 'Error generating QR code' });
    }
});

router.get('/download/:fileType/:fileName', ToolController.downloadFile);

module.exports = router;