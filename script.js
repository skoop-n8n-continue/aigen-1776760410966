const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');

let currentInput = '0';
let history = '';
let shouldResetDisplay = false;

function updateDisplay() {
    display.textContent = currentInput;
    historyDisplay.textContent = history;
}

function appendValue(value) {
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = value;
        shouldResetDisplay = false;
    } else {
        currentInput += value;
    }
    updateDisplay();
}

function appendFunction(func) {
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = func;
        shouldResetDisplay = false;
    } else {
        // If the last character is a number or closing paren, add multiplication
        const lastChar = currentInput.slice(-1);
        if (/[0-9)]/.test(lastChar)) {
            currentInput += '*' + func;
        } else {
            currentInput += func;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (shouldResetDisplay) shouldResetDisplay = false;

    // Replace last operator if present
    const lastChar = currentInput.slice(-1);
    if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        currentInput = currentInput.slice(0, -1) + op;
    } else {
        currentInput += op;
    }
    updateDisplay();
}

function appendConstant(constant) {
    const value = constant === 'π' ? 'π' : 'e';
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = value;
        shouldResetDisplay = false;
    } else {
        const lastChar = currentInput.slice(-1);
        if (/[0-9πe)]/.test(lastChar)) {
            currentInput += '*' + value;
        } else {
            currentInput += value;
        }
    }
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    history = '';
    updateDisplay();
}

function deleteLast() {
    if (shouldResetDisplay) {
        clearDisplay();
        return;
    }
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function calculate() {
    try {
        let expression = currentInput;
        history = expression + ' =';

        // Sanitize and replace for evaluation
        expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        expression = expression.replace(/π/g, 'Math.PI');
        expression = expression.replace(/e/g, 'Math.E');

        // Handle powers: x^y -> Math.pow(x, y)
        // This is complex for nested powers, so we'll use a simpler regex or replace with **
        expression = expression.replace(/\^/g, '**');

        // Handle functions
        expression = expression.replace(/sin\(/g, 'Math.sin(');
        expression = expression.replace(/cos\(/g, 'Math.cos(');
        expression = expression.replace(/tan\(/g, 'Math.tan(');
        expression = expression.replace(/log\(/g, 'Math.log10(');
        expression = expression.replace(/ln\(/g, 'Math.log(');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');

        // Factorial function
        const fact = (n) => {
            if (n < 0) return NaN;
            if (n === 0) return 1;
            let res = 1;
            for (let i = 2; i <= n; i++) res *= i;
            return res;
        };

        // Handle factorial (simpler approach: replace fact(x) with the function call)
        // We'll expose 'fact' to the evaluation context
        const context = { fact };

        // Use Function constructor for safer evaluation than eval
        const result = new Function('fact', 'return ' + expression)(fact);

        if (isNaN(result) || !isFinite(result)) {
            currentInput = 'Error';
        } else {
            // Round to avoid floating point issues
            currentInput = Number(parseFloat(result.toPrecision(12)).toString());
        }

        shouldResetDisplay = true;
        updateDisplay();
    } catch (e) {
        currentInput = 'Error';
        updateDisplay();
        shouldResetDisplay = true;
    }
}

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendValue(e.key);
    if (e.key === '.') appendValue('.');
    if (e.key === '+') appendOperator('+');
    if (e.key === '-') appendOperator('-');
    if (e.key === '*') appendOperator('*');
    if (e.key === '/') appendOperator('/');
    if (e.key === '^') appendOperator('^');
    if (e.key === '(') appendValue('(');
    if (e.key === ')') appendValue(')');
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Backspace') deleteLast();
    if (e.key === 'Escape') clearDisplay();
});

// Auto-run/Demo mode for digital signage
let idleTimer;
function startIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(runDemo, 10000); // 10 seconds idle
}

function runDemo() {
    if (currentInput !== '0' && !shouldResetDisplay) return;

    const demos = [
        () => { currentInput = 'sin(π/4)'; calculate(); },
        () => { currentInput = 'sqrt(144)'; calculate(); },
        () => { currentInput = '2^10'; calculate(); },
        () => { currentInput = 'log(100)'; calculate(); }
    ];

    const randomDemo = demos[Math.floor(Math.random() * demos.length)];
    randomDemo();
    startIdleTimer();
}

// Reset idle timer on any interaction
document.addEventListener('click', startIdleTimer);
document.addEventListener('keydown', startIdleTimer);

// Initial start
startIdleTimer();
