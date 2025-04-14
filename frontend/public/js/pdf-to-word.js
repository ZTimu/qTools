document.addEventListener('DOMContentLoaded', function() {
    // Get form and status elements
    const conversionForm = document.querySelector('.conversion-form');
    const conversionStatus = document.querySelector('.conversion-status');
    const progressBar = document.querySelector('.progress-bar');
    const statusText = document.querySelector('.status-text');
    const conversionResult = document.querySelector('.conversion-result');
    const downloadBtn = document.querySelector('.download-btn');
    
    // Check for URL parameters indicating successful conversion
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const fileName = urlParams.get('fileName');
    
    // If redirected after successful conversion, show the result
    if (success === 'true' && fileName) {
        conversionResult.style.display = 'block';
        downloadBtn.href = `/api/tools/download/word/${fileName}`;
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(`/api/tools/download/word/${fileName}`, '_blank');
        });
    }
    
    // Handle form submission
    conversionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(conversionForm);
        
        // Show conversion status
        conversionStatus.style.display = 'block';
        conversionResult.style.display = 'none';
        
        // Simulate progress (in a real app, this would be based on actual progress)
        let progress = 0;
        const progressInterval = setInterval(function() {
            progress += 5;
            progressBar.style.width = progress + '%';
            
            if (progress >= 90) {
                clearInterval(progressInterval);
            }
        }, 300);
        
        // The form will now submit normally and redirect to the page with success parameters
        // This is just for showing progress until the redirect happens
        setTimeout(function() {
            // Submit the form normally (will redirect after processing)
            conversionForm.submit();
        }, 1000);
        // No need for catch block since we're submitting the form normally
        });
    });
