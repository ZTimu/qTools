document.addEventListener('DOMContentLoaded', function() {
    // Get tab elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Get form elements
    const tempForm = document.getElementById('temperatureForm');
    const massForm = document.getElementById('massForm');
    
    // Get result elements
    const tempResult = document.getElementById('tempResult');
    const massResult = document.getElementById('massResult');
    const tempConversionText = document.getElementById('tempConversionText');
    const tempFormula = document.getElementById('tempFormula');
    const massConversionText = document.getElementById('massConversionText');
    const massFormula = document.getElementById('massFormula');
    
    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).style.display = 'block';
        });
    });
    
    // Temperature conversion functionality
    tempForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const value = parseFloat(document.getElementById('tempValue').value);
        const fromUnit = document.getElementById('fromTempUnit').value;
        const toUnit = document.getElementById('toTempUnit').value;
        
        // Perform conversion
        const result = convertTemperature(value, fromUnit, toUnit);
        
        // Display result
        tempConversionText.textContent = `${value} ${getUnitSymbol(fromUnit)} = ${result.toFixed(2)} ${getUnitSymbol(toUnit)}`;
        tempFormula.textContent = `Formula: ${getTemperatureFormula(fromUnit, toUnit)}`;
        tempResult.style.display = 'block';
    });
    
    // Mass conversion functionality
    massForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const value = parseFloat(document.getElementById('massValue').value);
        const fromUnit = document.getElementById('fromMassUnit').value;
        const toUnit = document.getElementById('toMassUnit').value;
        
        // Perform conversion
        const result = convertMass(value, fromUnit, toUnit);
        
        // Display result
        massConversionText.textContent = `${value} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`;
        massFormula.textContent = `Formula: ${getMassFormula(fromUnit, toUnit)}`;
        massResult.style.display = 'block';
    });
    
    // Temperature conversion function
    function convertTemperature(value, fromUnit, toUnit) {
        // Convert to Celsius first (as base unit)
        let celsius;
        
        switch(fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }
        
        // Convert from Celsius to target unit
        switch(toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return (celsius * 9/5) + 32;
            case 'kelvin':
                return celsius + 273.15;
        }
    }
    
    // Mass conversion function
    function convertMass(value, fromUnit, toUnit) {
        // Convert to grams first (as base unit)
        let grams;
        
        switch(fromUnit) {
            case 'kg':
                grams = value * 1000;
                break;
            case 'g':
                grams = value;
                break;
            case 'mg':
                grams = value / 1000;
                break;
            case 'lb':
                grams = value * 453.592;
                break;
            case 'oz':
                grams = value * 28.3495;
                break;
        }
        
        // Convert from grams to target unit
        switch(toUnit) {
            case 'kg':
                return grams / 1000;
            case 'g':
                return grams;
            case 'mg':
                return grams * 1000;
            case 'lb':
                return grams / 453.592;
            case 'oz':
                return grams / 28.3495;
        }
    }
    
    // Helper function to get temperature unit symbols
    function getUnitSymbol(unit) {
        switch(unit) {
            case 'celsius':
                return '°C';
            case 'fahrenheit':
                return '°F';
            case 'kelvin':
                return 'K';
            default:
                return unit;
        }
    }
    
    // Helper function to get temperature conversion formulas
    function getTemperatureFormula(fromUnit, toUnit) {
        if (fromUnit === toUnit) {
            return 'No conversion needed';
        }
        
        const formulas = {
            'celsius-fahrenheit': '°F = (°C × 9/5) + 32',
            'celsius-kelvin': 'K = °C + 273.15',
            'fahrenheit-celsius': '°C = (°F - 32) × 5/9',
            'fahrenheit-kelvin': 'K = (°F - 32) × 5/9 + 273.15',
            'kelvin-celsius': '°C = K - 273.15',
            'kelvin-fahrenheit': '°F = (K - 273.15) × 9/5 + 32'
        };
        
        return formulas[`${fromUnit}-${toUnit}`];
    }
    
    // Helper function to get mass conversion formulas
    function getMassFormula(fromUnit, toUnit) {
        if (fromUnit === toUnit) {
            return 'No conversion needed';
        }
        
        const conversionFactors = {
            'kg-g': '× 1000',
            'kg-mg': '× 1,000,000',
            'kg-lb': '× 2.20462',
            'kg-oz': '× 35.274',
            'g-kg': '÷ 1000',
            'g-mg': '× 1000',
            'g-lb': '÷ 453.592',
            'g-oz': '÷ 28.3495',
            'mg-kg': '÷ 1,000,000',
            'mg-g': '÷ 1000',
            'mg-lb': '÷ 453,592',
            'mg-oz': '÷ 28,349.5',
            'lb-kg': '× 0.453592',
            'lb-g': '× 453.592',
            'lb-mg': '× 453,592',
            'lb-oz': '× 16',
            'oz-kg': '× 0.0283495',
            'oz-g': '× 28.3495',
            'oz-mg': '× 28,349.5',
            'oz-lb': '÷ 16'
        };
        
        return `${fromUnit} to ${toUnit} ${conversionFactors[`${fromUnit}-${toUnit}`]}`;
    }
});