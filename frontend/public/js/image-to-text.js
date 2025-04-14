document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.conversion-form');
    const conversionStatus = document.querySelector('.conversion-status');
    const conversionResult = document.querySelector('.conversion-result');
    const extractedTextArea = document.getElementById('extractedText');
    const copyButton = document.getElementById('copyText');
    const downloadButton = document.getElementById('downloadText');
    const progressBar = document.querySelector('.progress-bar');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        // Show progress
        conversionStatus.style.display = 'block';
        conversionResult.style.display = 'none';
        progressBar.style.width = '50%';

        try {
            const response = await fetch('/api/tools/image-to-text', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                // Display the extracted text
                extractedTextArea.value = data.text;
                
                // Show results
                conversionStatus.style.display = 'none';
                conversionResult.style.display = 'block';
                progressBar.style.width = '100%';
            } else {
                throw new Error(data.message || 'Conversion failed');
            }
        } catch (error) {
            alert('Error: ' + error.message);
            conversionStatus.style.display = 'none';
            progressBar.style.width = '0%';
        }
    });

    // Copy text functionality
    copyButton.addEventListener('click', () => {
        extractedTextArea.select();
        document.execCommand('copy');
        alert('Text copied to clipboard!');
    });

    // Download text functionality
    downloadButton.addEventListener('click', () => {
        const text = extractedTextArea.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_text.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    });
});