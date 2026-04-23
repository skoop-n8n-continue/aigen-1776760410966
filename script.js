const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const modeIndicator = document.getElementById('mode-indicator');

let currentInput = '0';
let history = '';
let shouldResetDisplay = false;
let isDegreeMode = true;

function updateDisplay() {
    display.textContent = currentInput;
    historyDisplay.textContent = history;
}

function toggleMode() {
    isDegreeMode = !isDegreeMode;
    modeIndicator.textContent = isDegreeMode ? 'DEG' : 'RAD';
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

        // Replace constants with Math values, avoiding scientific notation conflict
        // Replace 'e' only when not preceded or followed by a digit (scientific notation)
        expression = expression.replace(/(?<![0-9])e(?![0-9])/g, 'Math.E');
        expression = expression.replace(/π/g, 'Math.PI');

        // Sanitize operators
        expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        expression = expression.replace(/\^/g, '**');

        // Handle trig functions with degree/radian conversion
        if (isDegreeMode) {
            expression = expression.replace(/sin\(/g, 'Math.sin(Math.PI/180*');
            expression = expression.replace(/cos\(/g, 'Math.cos(Math.PI/180*');
            expression = expression.replace(/tan\(/g, 'Math.tan(Math.PI/180*');
        } else {
            expression = expression.replace(/sin\(/g, 'Math.sin(');
            expression = expression.replace(/cos\(/g, 'Math.cos(');
            expression = expression.replace(/tan\(/g, 'Math.tan(');
        }

        expression = expression.replace(/log\(/g, 'Math.log10(');
        expression = expression.replace(/ln\(/g, 'Math.log(');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');

        const fact = (n) => {
            if (n < 0) return NaN;
            if (n === 0) return 1;
            let res = 1;
            for (let i = 2; i <= Math.floor(n); i++) res *= i;
            return res;
        };

        const result = new Function('fact', 'return ' + expression)(fact);

        if (isNaN(result) || !isFinite(result)) {
            currentInput = 'Error';
        } else {
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

let idleTimer;
function startIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(runDemo, 10000);
}

function runDemo() {
    if (currentInput !== '0' && !shouldResetDisplay) return;

    const demos = [
        () => { currentInput = 'sin(30)'; calculate(); },
        () => { currentInput = 'sqrt(256)'; calculate(); },
        () => { currentInput = '2^8'; calculate(); },
        () => { currentInput = 'log(1000)'; calculate(); }
    ];

    const randomDemo = demos[Math.floor(Math.random() * demos.length)];
    randomDemo();
    startIdleTimer();
}

document.addEventListener('click', startIdleTimer);
document.addEventListener('keydown', startIdleTimer);
startIdleTimer();
