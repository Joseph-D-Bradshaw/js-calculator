class Calculator {
    /*
        This calculator supports addition, substraction, multiplication and division.
        As an extra feature, it respects the order of opreations for brackets.
    */
    constructor() { }

    /*
        A wrapper for calculations for error catching and extendability,
        allows easy modularity for a precompute step in-case of more
        advanced features like other calculator functions
    */
    compute(expression) {
        try {
            return this.evaluateExpression(expression)
        } catch(error) {
            console.error(`Error whilst calculating result: ${error}`)
            return `${error}`
        }
    }

    /*
        Calls solve(), providing a callback to handle multiplication and division problems
        and the correct operators to look for in the expression
    */
    computeMD(expr) {
        const supportedOperators = ['*', '/']
        return this.solve(expr, supportedOperators, (a, b, operator) => {
            if (operator === '*') return a * b
            if (b === 0) throw new Error('Cannot divide by zero')
            return a / b
        })
    }

    /*
        Calls solve(), providing a callback to handle addition and subtraction problems
        and the correct operators to look for in the expression
    */
    computeAS(expr) {
        const supportedOperators = ['+', '-']
        return this.solve(expr, supportedOperators, (a, b, operator) => {
            return operator === '+' ? a + b : a - b
        })
    }

    /*
        Solves an arithmetic problem provded.
        expr: a string representing the expression to calculator
        supportedOperators: a list of operator characters, used to detect the end of a number.
                   unsupported operators are not handled and would cause an issue
        operateCallback: the function to call with the operator to provided to determine
                   the type of calculation to perform, and execute it.
                   Signature:
                      (a: number, b: number, operator: string) => number
    */
    solve(expr, supportedOperators, operateCallback) {
        let detectedNums = []
        let operations = []
        let numString = ''

        expr = `${expr}`

        for (const char of expr) {
            // If this is just a number, add it to the number string
            if (!supportedOperators.includes(char)) {
                numString += char
            } else {
            // Otherwise parse the number and add the found operator
                detectedNums.push(parseFloat(numString))
                operations.push(char)
                numString = ''
            }
        }

        // If we had any non supported operators left in the expression
        // return the string as is, checks for digits and a point (for decimals)
        if (/[^0-9.]/.test(numString)) {
            return expr
        }

        // To catch the last number left over from the loop
        detectedNums.push(parseFloat(numString))

        let result = detectedNums[0]
        for (let i = 1; i < detectedNums.length; i++) {
            result = operateCallback(result, detectedNums[i], operations[i - 1])
        }

        return result
    }


    /*
        Here I try to respect the order of operations, checking in order:
        brackets -> multiplication -> division -> addition -> subtraction
    */
    evaluateExpression(expr) {
        // Brackets
        let brackets = this.__findInnermostBrackets(expr)
        while (brackets) {
            const { openBracket, closedBracket } = brackets
            // get the inner expression and outer expressions
            const innerExpr = expr.slice(openBracket + 1, closedBracket)
            const leftOuter = expr.slice(0, openBracket)
            const rightOuter = expr.slice(closedBracket + 1)

            // use recursion to evaluate the innerExpression
            // this is so that inner expressions will be evaluated for further brackets
            // and the problem is split up so that at this "base case" we can just focus on
            // doing the maths; effectively chopping this complex problem into much more managable
            // smaller issues
            expr = leftOuter + this.evaluateExpression(innerExpr) + rightOuter
            brackets = this.__findInnermostBrackets(expr)
        }

        // Multiplication/Division
        expr = this.computeMD(expr)

        // Addition/Subtraction: 
        // Note, last step will return, extend this to support more checks
        return this.computeAS(expr)
    }

    /*
        Finds the innermost brackets in an expression and returns their indices as
            { 'openBracket': a, 'closedBracket': b }
        Returns null in the event no brackets are present in the expression.
    */
    __findInnermostBrackets(expr) {
        let openBracket = -1
        let closedBracket = -1
        // go backwards through expression
        for (let i = expr.length - 1; i >=0; i--) {
            // get open bracket, and closest matching closed bracket
            if (expr[i] === '(') {
                openBracket = i
                closedBracket = expr.indexOf(')', openBracket)

                if (closedBracket !== -1) {
                    return { openBracket, closedBracket }
                }
            }
        }
        return null

    }
}

function testEvaluateExpression() {
    const testExpressions = [
        { expr: '2+2', expected: 4 },
        { expr: '2-1', expected: 1 },
        { expr: '3*4', expected: 12 },
        { expr: '10/2', expected: 5 },
        { expr: '2+(2*5)', expected: 12 },
        { expr: '2*(2+5)', expected: 14 },
        { expr: '(2+1)*(4-3)', expected: 3 },
        { expr: '12*(12-(6+6))', expected: 0 },
        { expr: '12*(12-(6))', expected: 72 },
    ]

    const cal = new Calculator()
    testExpressions.forEach((test, i) => {
        const { expr, expected } = test
        const result = cal.evaluateExpression(expr)
        if (result === expected) {
            console.log(`Test ${i} passed`)
        } else {
            console.error(`Test ${i} failed. Expected: ${expected} got ${result}`)
        }
    })

    //TODO: add divide by zero check
}

// UI layer, set up handlers so the Calculator can stay decoupled from the UI
function setupEventHandlers() {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (event) => {
            const character = event.currentTarget.getAttribute('data-value')

            switch (character) {
                case '=':
                    calculatorScreen.textContent = calculateExpression()
                    return
                case 'Cancel':
                    calculatorScreen.textContent = ''
                    problem = ''
                    return
            
                default:
                    break;
            }

            problem += character
            calculatorScreen.textContent = problem
        })
    })
}

function calculateExpression() {
    return calculator.compute(problem)
}


const calculatorScreen = document.getElementById('calculator-screen')
let calculator = new Calculator()
let problem = ''

function main() {
    setupEventHandlers()
    testEvaluateExpression()
}

main()
