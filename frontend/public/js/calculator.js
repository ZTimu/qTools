document.addEventListener('DOMContentLoaded', function() {
    const inputDisplay = document.getElementById('input-display');
    const resultDisplay = document.getElementById('result-display');
    let currentExpression = '';
    let lastResult = '';

    // Initialize displays
    inputDisplay.value = '';
    resultDisplay.value = '';

    window.appendNumber = function(num) {
        if (inputDisplay.value === 'Error') {
            inputDisplay.value = num;
        } else {
            inputDisplay.value += num;
        }
        currentExpression = inputDisplay.value;
    };

    window.appendOperator = function(operator) {
        if (inputDisplay.value !== 'Error') {
            // Handle consecutive operators
            const lastChar = inputDisplay.value.slice(-1);
            if (['+', '-', '*', '/', '×'].includes(lastChar)) {
                inputDisplay.value = inputDisplay.value.slice(0, -1) + operator;
            } else {
                inputDisplay.value += operator;
            }
            currentExpression = inputDisplay.value;
        }
    };

    window.clearDisplay = function() {
        inputDisplay.value = '';
        resultDisplay.value = '';
        currentExpression = '';
        lastResult = '';
    };

    window.clearEntry = function() {
        inputDisplay.value = '';
        currentExpression = '';
    };

    window.backspace = function() {
        if (inputDisplay.value !== 'Error') {
            inputDisplay.value = inputDisplay.value.slice(0, -1);
            currentExpression = inputDisplay.value;
        }
    };

    window.toggleSign = function() {
        if (inputDisplay.value !== 'Error' && inputDisplay.value !== '') {
            if (inputDisplay.value.startsWith('-')) {
                inputDisplay.value = inputDisplay.value.slice(1);
            } else {
                inputDisplay.value = '-' + inputDisplay.value;
            }
            currentExpression = inputDisplay.value;
        }
    };

    window.calculate = function(operation) {
        try {
            if (inputDisplay.value === 'Error') return;

            let result;
            const currentValue = parseFloat(inputDisplay.value);

            switch(operation) {
                case 'sin':
                    result = Math.sin(currentValue * Math.PI / 180);
                    break;
                case 'cos':
                    result = Math.cos(currentValue * Math.PI / 180);
                    break;
                case 'tan':
                    result = Math.tan(currentValue * Math.PI / 180);
                    break;
                case 'sqrt':
                    if (currentValue < 0) throw new Error('Invalid input');
                    result = Math.sqrt(currentValue);
                    break;
                case 'pow':
                    result = Math.pow(currentValue, 2);
                    break;
                case 'log':
                    if (currentValue <= 0) throw new Error('Invalid input');
                    result = Math.log10(currentValue);
                    break;
                case 'equals':
                    // Replace × with * and handle special operators
                    let expression = inputDisplay.value
                        .replace(/×/g, '*')
                        .replace(/%/g, '/100*')
                        .replace(/\^/g, '**');
                    // Validate expression contains only valid characters
                    if (!/^[0-9+\-*/.() %^]+$/.test(expression)) {
                        throw new Error('Invalid characters in expression');
                    }
                    // Safely evaluate the expression
                    result = Function('return ' + expression)();
                    break;
                default:
                    return;
            }

            // Format the result
            if (isNaN(result) || !isFinite(result)) {
                throw new Error('Invalid calculation');
            }

            result = Number(result.toFixed(8));
            if (operation === 'equals') {
                resultDisplay.value = result;
            } else {
                inputDisplay.value = result;
                resultDisplay.value = result;
            }
            lastResult = result;
            currentExpression = inputDisplay.value;
        } catch (error) {
            resultDisplay.value = 'Error';
            console.error('Calculation error:', error);
        }
    };
});