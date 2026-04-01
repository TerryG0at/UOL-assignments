function Tokenize(input) {
    let tokens = [];
    let current_token = "";

    for (i = 0; i < input.length; i++) {
        let char = input[i];

        if (char == " ") {
            if (current_token != "") {
                tokens.push(current_token);
                current_token = "";
            }
        }
        else {
            current_token += char;
        }
    }
    if (current_token != "") {
        tokens.push(current_token);
    }
    return tokens;
}

function Calculation(operator, stack_a) {
    if (stack_a.length < 2) {
        throw new Error("Cannot proceed with calculation");
    }

    const num2 = stack_a.pop();
    const num1 = stack_a.pop();
    let result;

    if (operator == "+") {
        result = num1 + num2;
    } 
    else if (operator == "-") {
        result = num1 - num2;
    } 
    else if (operator == "*") {
        result = num1 * num2;
    } 
    else if (operator == "/") {
        if (num2 == 0) {
            throw new Error("Division by zero");
        }
        result = num1 / num2;
    }
    stack_a.push(result);
}

function Assign_variable_to_table(stack_a, symbol_table_a) {
    if (stack_a.length < 2) {
        throw new Error("stack size insufficient for assigning variable");
    }
    const value = stack_a.pop();
    const variable = stack_a.pop();
    symbol_table_a[variable] = value;
}

// Helper functions
function Is_number(token) {
    return !isNaN(token);
}

function Is_variable(token) {
    return /^[a-zA-Z]+$/.test(token);
}

function Is_operator(token) {
    return ["+", "-", "*", "/"].includes(token);
}

function Evaluate_input_line(input, stack_a, symbol_table_a) {
    const tokens = Tokenize(input);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (Is_number(token)) {
            stack_a.push(Number(token));
        }
        else if (Is_variable(token)) {
            // Check if this variable is immediately followed by a value and then '='
            // This indicates it's the variable being assigned TO
            const is_assignment_target = (
                i + 2 < tokens.length && 
                tokens[i + 2] === "=" &&
                (Is_number(tokens[i + 1]) || Is_variable(tokens[i + 1]))
            );
            
            // Alternative check: if there's an '=' later and this is the first variable
            const has_assignment = tokens.includes("=");
            const is_first_variable_in_assignment = has_assignment && 
                tokens.findIndex(t => Is_variable(t)) === i;
            
            if (is_assignment_target || is_first_variable_in_assignment) {
                // This is a variable being assigned to - push as name
                stack_a.push(token);
            } else if (token in symbol_table_a) {
                // This is a variable being used - push its value
                stack_a.push(symbol_table_a[token]);
            } else {
                throw new Error(`Variable "${token}" not found`);
            }
        }
        else if (Is_operator(token)) {
            Calculation(token, stack_a);
        }
        else if (token === "=") {
            Assign_variable_to_table(stack_a, symbol_table_a);
        }
        else {
            throw new Error("Invalid token");
        }
    }

    if (stack_a.length > 0) {
        console.log(stack_a[stack_a.length - 1]);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////

// Test cases

let result = Tokenize("12 3 + 4 *");
console.log(result);

// Test cases for Calculation function
try {
    let stack = [5, 3];
    Calculation("+", stack);
    console.log(stack); // Expected: [8]

    stack = [10, 4];
    Calculation("-", stack);
    console.log(stack); // Expected: [6]

    stack = [7, 6];
    Calculation("*", stack);
    console.log(stack); // Expected: [42]

    stack = [20, 4];
    Calculation("/", stack);
    console.log(stack); // Expected: [5]

    // Division by zero test
    stack = [5, 0];
    Calculation("/", stack);
} catch (error) {
    console.error(error.message);
}

// Test Evaluate_input_line with consistent naming
let stack_a = [];
let symbol_table_a = { x: 2, y: 3};

try {
    Evaluate_input_line("3 4 5 + *", stack_a, symbol_table_a);
    // Expected output: 27

    Evaluate_input_line("x 10 =", stack_a, symbol_table_a);
    // Expected: symbol_table_a = { x: 10 }
    console.log("Symbol table after x=10:", symbol_table_a);

    Evaluate_input_line("b x 2 * =", stack_a, symbol_table_a);
    // Expected output: 20 (because x = 10, so 10 * 2)
    console.log("Symbol table after b=x*2:", symbol_table_a);

    Evaluate_input_line("b", stack_a, symbol_table_a); // Expected: 20

    Evaluate_input_line("x", stack_a, symbol_table_a); // Expected: 10

    Evaluate_input_line("a 2 =", stack_a, symbol_table_a);
    Evaluate_input_line("b 3 =", stack_a, symbol_table_a);
    Evaluate_input_line("a b *", stack_a, symbol_table_a);

} catch (error) {
    console.error(error.message);
}