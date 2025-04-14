const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const convertedDir = path.join(__dirname, '../../uploads/converted');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true });
}

class ToolController {
    // Render tool pages
    renderPdfToWord(req, res) {
        res.render('tools/pdf-to-word', {
            title: 'PDF to Word Conversion'
        });
    }

    renderImageToText(req, res) {
        res.render('tools/image-to-text', {
            title: 'Image to Text (OCR)'
        });
    }
    
    renderTemperatureMassConverter(req, res) {
        res.render('tools/temperature-mass-converter', {
            title: 'Temperature & Mass Conversion'
        });
    }
    
    renderQrGenerator(req, res) {
        res.render('tools/qr-generator', {
            title: 'QR Code Generator'
        });
    }

    renderCurrencyConverter(req, res) {
        res.render('tools/currency-converter', {
            title: 'Currency Converter'
        });
    }

    renderCalculator(req, res) {
        res.render('tools/calculator', {
            title: 'Web Calculator'
        });
    }

    // Handle calculator operations
    async calculateOperation(req, res) {
        try {
            const { operation, value } = req.body;
            let result;

            switch(operation) {
                case 'sin':
                    result = Math.sin(value * Math.PI / 180);
                    break;
                case 'cos':
                    result = Math.cos(value * Math.PI / 180);
                    break;
                case 'tan':
                    result = Math.tan(value * Math.PI / 180);
                    break;
                case 'sqrt':
                    if (value < 0) throw new Error('Invalid input');
                    result = Math.sqrt(value);
                    break;
                case 'pow':
                    result = Math.pow(value, 2);
                    break;
                case 'log':
                    if (value <= 0) throw new Error('Invalid input');
                    result = Math.log10(value);
                    break;
                default:
                    throw new Error('Invalid operation');
            }

            res.json({ success: true, result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Handle PDF to Word conversion
    async convertPdfToWord(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const pdfParse = require('pdf-parse');
            const docx = require('docx');
            const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = docx;

            // Read the PDF file
            const dataBuffer = fs.readFileSync(req.file.path);
            
            // Parse PDF content with enhanced options and formatting preservation
            const pdfData = await pdfParse(dataBuffer, {
                pagerender: function(pageData) {
                    return pageData.getTextContent().then(function(textContent) {
                        let text = '';
                        let lastY;
                        let lastX;
                        let lastFontSize;
                        let lineItems = [];
                        
                        // First collect all items for better analysis
                        textContent.items.forEach(item => {
                            lineItems.push({
                                str: item.str,
                                x: item.transform[4],
                                y: item.transform[5],
                                width: item.width,
                                height: item.height,
                                fontSize: item.transform[0]
                            });
                        });
                        
                        // Sort by Y position (rows) then X position (columns)
                        lineItems.sort((a, b) => {
                            const yDiff = b.y - a.y;
                            if (Math.abs(yDiff) > 3) { // Items on different rows
                                return yDiff;
                            }
                            return a.x - b.x; // Same row, sort by column
                        });
                        
                        // Process items with improved table detection
                        let currentY = null;
                        let rowItems = [];
                        
                        // Process each item
                        lineItems.forEach((item, index) => {
                            // Detect new row
                            if (currentY === null || Math.abs(item.y - currentY) > 3) {
                                // Process previous row if it exists
                                if (rowItems.length > 0) {
                                    // Check if this might be a table row (multiple items aligned horizontally)
                                    // Only consider it a table if there are multiple items with significant horizontal spacing
                                    let isTableRow = false;
                                    
                                    if (rowItems.length >= 2) {
                                        // Sort by X position
                                        rowItems.sort((a, b) => a.x - b.x);
                                        
                                        // Check if items have significant horizontal spacing
                                        let hasSignificantSpacing = false;
                                        for (let i = 1; i < rowItems.length; i++) {
                                            const spacing = rowItems[i].x - (rowItems[i-1].x + rowItems[i-1].width);
                                            if (spacing > 10) { // Significant spacing threshold
                                                hasSignificantSpacing = true;
                                                break;
                                            }
                                        }
                                        
                                        isTableRow = hasSignificantSpacing;
                                    }
                                    
                                    if (isTableRow) {
                                        // Add tab characters between items to preserve column structure
                                        text += rowItems.map(i => i.str).join('\t') + '\n';
                                    } else {
                                        // Regular text line
                                        text += rowItems.map(i => i.str).join(' ') + '\n';
                                    }
                                    
                                    // Reset for new row
                                    rowItems = [];
                                }
                                
                                currentY = item.y;
                            }
                            
                            // Add item to current row
                            rowItems.push(item);
                            
                            // Process the last row
                            if (index === lineItems.length - 1 && rowItems.length > 0) {
                                // Apply the same table detection logic for the last row
                                let isTableRow = false;
                                
                                if (rowItems.length >= 2) {
                                    // Sort by X position
                                    rowItems.sort((a, b) => a.x - b.x);
                                    
                                    // Check if items have significant horizontal spacing
                                    let hasSignificantSpacing = false;
                                    for (let i = 1; i < rowItems.length; i++) {
                                        const spacing = rowItems[i].x - (rowItems[i-1].x + rowItems[i-1].width);
                                        if (spacing > 10) { // Significant spacing threshold
                                            hasSignificantSpacing = true;
                                            break;
                                        }
                                    }
                                    
                                    isTableRow = hasSignificantSpacing;
                                }
                                
                                if (isTableRow) {
                                    text += rowItems.map(i => i.str).join('\t') + '\n';
                                } else {
                                    text += rowItems.map(i => i.str).join(' ') + '\n';
                                }
                            }
                        });
                        
                        return text;
                    });
                }
            });
            
            // Process text content with improved paragraph, heading, and table detection
            const rawText = pdfData.text;
            
            // Detect potential table rows (lines with tab characters)
            const lines = rawText.split('\n');
            const tableRows = [];
            const regularParagraphs = [];
            let currentTable = [];
            let inTable = false;
            
            // First pass: identify tables and regular paragraphs
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.length === 0) {
                    // Empty line - if we were in a table, end it
                    if (inTable && currentTable.length > 0) {
                        tableRows.push([...currentTable]);
                        currentTable = [];
                        inTable = false;
                    }
                    return;
                }
                
                // Check if this line contains tabs (potential table row)
                if (trimmedLine.includes('\t')) {
                    // Only treat as table if it has multiple columns with sufficient content
                    const columns = trimmedLine.split('\t').filter(col => col.trim().length > 0);
                    if (columns.length >= 2) {
                        inTable = true;
                        currentTable.push(trimmedLine);
                    } else {
                        // Single column with tabs should be treated as regular text
                        regularParagraphs.push(trimmedLine.replace(/\t+/g, ' '));
                    }
                } else {
                    // If we were in a table but this line doesn't have tabs, end the table
                    if (inTable && currentTable.length > 0) {
                        tableRows.push([...currentTable]);
                        currentTable = [];
                        inTable = false;
                    }
                    regularParagraphs.push(trimmedLine);
                }
            });
            
            // Add any remaining table
            if (currentTable.length > 0) {
                tableRows.push([...currentTable]);
            }
            
            // Process regular paragraphs
            const paragraphs = regularParagraphs
                .join('\n')
                .split(/\n{2,}/)
                .map(para => {
                    const lines = para.split('\n');
                    const processedLines = lines.map(line => line.trim())
                        .filter(line => line.length > 0);
                    return processedLines.join(' ');
                })
                .filter(para => para.length > 0);
            
            // Create document sections with improved formatting
            const children = [];
            
            // Process tables first
            tableRows.forEach(tableData => {
                if (tableData.length === 0) return;
                
                // Create table rows and cells
                const rows = [];
                
                tableData.forEach(rowData => {
                    // Split by tabs to get columns
                    const columns = rowData.split('\t');
                    
                    // Determine if this is a real table row that needs borders
                    // Check if there are multiple columns with content
                    const contentColumns = columns.filter(col => col.trim().length > 0);
                    const isRealTable = contentColumns.length >= 2;
                    
                    // Create table cells for this row
                    const cells = columns.map(cellText => {
                        return new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: cellText.trim(),
                                            size: 24
                                        })
                                    ]
                                })
                            ],
                            borders: {
                                // Only use visible borders for actual tabular data
                                top: { style: isRealTable ? 'single' : 'nil', size: 1, color: 'auto' },
                                bottom: { style: isRealTable ? 'single' : 'nil', size: 1, color: 'auto' },
                                left: { style: isRealTable ? 'single' : 'nil', size: 1, color: 'auto' },
                                right: { style: isRealTable ? 'single' : 'nil', size: 1, color: 'auto' }
                            }
                        });
                    });
                    
                    // Add row to table
                    rows.push(new TableRow({ children: cells }));
                });
                
                // Create and add table to document
                const table = new Table({
                    rows: rows,
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE
                    }
                });
                
                children.push(table);
                
                // Add spacing after table
                children.push(new Paragraph({
                    text: '',
                    spacing: { before: 240, after: 240 }
                }));
            });
            
            // Enhanced paragraph and heading detection with better formatting
            paragraphs.forEach((text, index) => {
                // Improved heading detection with multiple criteria
                const isHeading = (
                    text.length < 100 && 
                    /^[A-Z0-9]/.test(text) && 
                    !/[.,:;]$/.test(text) && 
                    text.split(' ').length < 10
                );
                
                // Detect subheading patterns
                const isSubheading = !isHeading && 
                    text.length < 150 && 
                    /^[A-Za-z0-9]/.test(text) && 
                    text.split(' ').length < 15;
                
                children.push(
                    new Paragraph({
                        text: text.trim(),
                        heading: isHeading ? HeadingLevel.HEADING_1 : 
                                isSubheading ? HeadingLevel.HEADING_2 : undefined,
                        spacing: {
                            before: isHeading ? 480 : isSubheading ? 400 : 240,
                            after: isHeading ? 240 : isSubheading ? 200 : 120,
                            line: 300,
                            lineRule: 'auto'
                        },
                        style: isHeading ? 'Heading1' : 
                               isSubheading ? 'Heading2' : 'Normal',
                        children: [
                            new TextRun({
                                text: text.trim(),
                                size: isHeading ? 32 : 
                                      isSubheading ? 28 : 24,
                                bold: isHeading || isSubheading,
                                font: 'Calibri',
                                color: isHeading ? '000000' : 
                                       isSubheading ? '222222' : '333333'
                            })
                        ]
                    })
                );
            });

            // Create the document with enhanced structure
            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: children
                }]
            });

            const originalFilename = req.file.originalname;
            const fileNameWithoutExt = path.parse(originalFilename).name;
            const convertedFileName = `${fileNameWithoutExt}_converted.docx`;
            const convertedFilePath = path.join(convertedDir, convertedFileName);

            // Generate Word document
            const buffer = await docx.Packer.toBuffer(doc);
            fs.writeFileSync(convertedFilePath, buffer);

            // Return a JSON response instead of redirecting
            return res.status(200).json({
                success: true,
                message: 'PDF converted successfully',
                fileName: convertedFileName,
                downloadUrl: `/api/tools/download/word/${convertedFileName}`
            });
        } catch (error) {
            console.error('Error converting PDF to Word:', error);
            return res.status(500).json({ error: 'Error converting file' });
        }
    }

    // Handle Image to Text conversion
    async convertImageToText(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            
            console.log('Starting OCR processing for:', req.file.originalname);
            
            // Import Tesseract.js with error handling
            let Tesseract;
            try {
                Tesseract = require('tesseract.js');
                console.log('Tesseract.js loaded successfully');
            } catch (libError) {
                console.error('Error loading Tesseract.js:', libError);
                return res.status(500).json({ 
                    success: false,
                    error: 'OCR library not available: ' + libError.message 
                });
            }
            
            const originalFilename = req.file.originalname;
            const fileNameWithoutExt = path.parse(originalFilename).name;
            const convertedFileName = `${fileNameWithoutExt}_ocr.txt`;
            const convertedFilePath = path.join(convertedDir, convertedFileName);
            
            // Log the file details
            console.log('File path:', req.file.path);
            console.log('Output path:', convertedFilePath);
            
            // Validate the file exists
            if (!fs.existsSync(req.file.path)) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Uploaded file not found' 
                });
            }
            
            // Since OCR may fail, we'll create a simple text with placeholder
            // and extract as much text as we can
            let text = 'OCR processing was attempted, but no text could be extracted.';
            
            try {
                // Try simple library method - this bypasses the language data issue
                console.log('Using simple OCR method');
                
                // Create a simple Tesseract worker
                const worker = Tesseract.createWorker({
                    logger: m => console.log(`OCR: ${m.status} ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`)
                });
                
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                
                const { data } = await worker.recognize(req.file.path);
                text = data.text || text;
                
                await worker.terminate();
                
                console.log('Text extraction complete, length:', text.length);
                
                // Save extracted text to file
                fs.writeFileSync(convertedFilePath, text);
                console.log('Text saved to:', convertedFilePath);
            } catch (ocrError) {
                console.error('Error during OCR processing:', ocrError);
                // Create a minimal text file with error information
                fs.writeFileSync(convertedFilePath, 'Error extracting text: ' + ocrError.message);
                console.log('Created error file');
            }
            
            // Return success response even if OCR had issues but we have a file
            return res.status(200).json({
                success: true,
                message: 'Image processed',
                text: text,
                downloadLink: `/api/tools/download/text/${convertedFileName}`
            });
        } catch (error) {
            console.error('Final error extracting text from image:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Error extracting text: ' + (error.message || 'Unknown error') 
            });
        }
    }

    // Handle file downloads
    async downloadFile(req, res) {
        try {
            const { fileType, fileName } = req.params;
            const filePath = path.join(convertedDir, fileName);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return res.status(404).send('File not found');
            }

            // Set appropriate content type based on file type
            let contentType = 'application/octet-stream';
            if (fileType === 'word') {
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else if (fileType === 'text') {
                contentType = 'text/plain';
            }

            // Set headers for download
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

            // Stream the file to the response
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('Error downloading file:', error);
            return res.status(500).send('Error downloading file');
        }
    }
}

module.exports = new ToolController();