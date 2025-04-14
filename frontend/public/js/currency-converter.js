document.addEventListener('DOMContentLoaded', function() {
    const currencyForm = document.getElementById('currencyForm');
    const resultDiv = document.querySelector('.conversion-result');
    const resultText = document.querySelector('.result-text');

    // API endpoint for exchange rates (using exchangerate-api.com)
    const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
    const API_BASE = 'https://v6.exchangerate-api.com/v6/';

    currencyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('amount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            // Show loading state
            resultDiv.style.display = 'block';
            resultText.textContent = 'Converting...';

            // Fetch exchange rate
            const response = await fetch(`${API_BASE}${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`);
            const data = await response.json();

            if (data.result === 'success') {
                const convertedAmount = data.conversion_result;
                const rate = data.conversion_rate;

                // Format the result with appropriate decimal places
                const formattedResult = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: toCurrency
                }).format(convertedAmount);

                // Display the result
                resultText.innerHTML = `
                    ${amount.toFixed(2)} ${fromCurrency} = <strong>${formattedResult}</strong><br>
                    <small>Exchange Rate: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}</small>
                `;
            } else {
                throw new Error('Failed to get exchange rate');
            }
        } catch (error) {
            resultText.textContent = 'Error: Could not perform conversion. Please try again later.';
            resultText.style.color = 'red';
        }
    });

    // Add event listeners for currency swap
    document.getElementById('fromCurrency').addEventListener('change', updateResult);
    document.getElementById('toCurrency').addEventListener('change', updateResult);
    document.getElementById('amount').addEventListener('input', updateResult);

    function updateResult() {
        // Hide the result when inputs change
        resultDiv.style.display = 'none';
        resultText.style.color = ''; // Reset text color
    }
});