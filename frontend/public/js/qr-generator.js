document.addEventListener('DOMContentLoaded', function() {
    // Get form and result elements
    const qrForm = document.getElementById('qrForm');
    const qrResult = document.querySelector('.qr-result');
    const qrImage = document.getElementById('qrImage');
    const downloadQR = document.getElementById('downloadQR');
    const printQR = document.getElementById('printQR');
    
    // Get logo option elements
    const qrLogo = document.getElementById('qrLogo');
    const logoOptions = document.getElementById('logoOptions');
    
    // Toggle logo options when checkbox is clicked
    qrLogo.addEventListener('change', function() {
        logoOptions.style.display = this.checked ? 'block' : 'none';
    });
    
    // Handle form submission
    qrForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const content = document.getElementById('qrContent').value;
        const type = document.getElementById('qrType').value;
        const size = document.getElementById('qrSize').value;
        const color = document.getElementById('qrColor').value.replace('#', '');
        const bgColor = document.getElementById('qrBgColor').value.replace('#', '');
        const includeLogo = qrLogo.checked;
        
        // Prepare data for API request
        const formData = {
            content: content,
            size: size,
            color: document.getElementById('qrColor').value,
            bgColor: document.getElementById('qrBgColor').value,
            options: {
                type: type
            }
        };
        
        // If logo is included, handle logo options
        if (includeLogo) {
            const logoFile = document.getElementById('logoFile').files[0];
            const logoSize = document.getElementById('logoSize').value;
            
            if (logoFile) {
                // In a real implementation, we would upload the logo file
                // For this example, we'll just note that a logo was selected
                formData.options.logoSize = logoSize;
            }
        }
        
        // Send API request to generate QR code
        fetch('/api/tools/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display the generated QR code
                qrImage.src = data.qrCode;
                qrResult.style.display = 'block';
                
                // Setup download button
                downloadQR.addEventListener('click', function() {
                    const link = document.createElement('a');
                    link.href = data.qrCode;
                    link.download = 'qrcode.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
                
                // Setup print button
                printQR.addEventListener('click', function() {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>Print QR Code</title>
                                <style>
                                    body {
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        height: 100vh;
                                        margin: 0;
                                    }
                                    img {
                                        max-width: 80%;
                                        max-height: 80%;
                                    }
                                </style>
                            </head>
                            <body>
                                <img src="${data.qrCode}" alt="QR Code">
                                <script>
                                    window.onload = function() {
                                        window.print();
                                        window.setTimeout(function() {
                                            window.close();
                                        }, 500);
                                    }
                                </script>
                            </body>
                        </html>
                    `);
                });
            } else {
                alert('Error generating QR code: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error generating QR code. Please try again.');
        });
    });
});