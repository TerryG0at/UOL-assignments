// Tokenizing
function Tokenize(input) {
    let tokens = [];
    let current_token = "";

    for (i = 0; i < input.length; i++) {
        // The input string is first change into character so we can go one by one
        let char = input[i];

        // Token separator (usually , like in csv)
        if (char == " ") {
            if (current_token != "") {
                // Add the token into tokens array
                tokens.push(current_token);
                // Reset
                current_token = "";
            }
        }
        else {
            // For multiple entry like 324, 45
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

    // Addition
    if (operator == "+") {
        result = num1 + num2;
    } 
    // Substraction
    else if (operator == "-") {
        result = num1 - num2;
    } 
    // Multiplication
    else if (operator == "*") {
        result = num1 * num2;
    } 
    // Division
    else if (operator == "/") {
        if (num2 == 0) {
            throw new Error("Division by zero");
        }
        result = num1 / num2;
    }
    // Result added back to the stack
    stack_a.push(result);
}

function Assign_variable_to_table(stack_a, symbol_table_a) {
    if (stack_a.length < 2) {
        throw new Error("stack size insufficient for assigning variable");
    }
    const value = stack_a.pop();
    const variable = stack_a.pop();
    // Add both variable and value as key-value pair in symbol table
    symbol_table_a[variable] = value;
}

// Helper functions
// Check if token is number
function Is_number(token) {
    return !isNaN(token);
}

// Check if it is single alphabet (no case sensitive)
function Is_variable(token) {
    return /^[a-zA-Z]+$/.test(token);
}

// Check for operator
function Is_operator(token) {
    return ["+", "-", "*", "/"].includes(token);
}

// Processing with the input
function Evaluate_input_line(input, stack_a, symbol_table_a) {
    const tokens = Tokenize(input);

    // Last token is =
    if (tokens[tokens.length - 1] == "=") {
        // First token is variable
        if (Is_variable(tokens[0])) {
            // Add variable to stack in uppercase
            stack_a.push(tokens[0].toUpperCase())
            for (let i = 1; i < tokens.length; i++) {
                const token = tokens[i];
                // If token is number it will be added to stack
                if (Is_number(token)) {
                    stack_a.push(Number(token));
                }
                else if (Is_variable(token)) {
                    // Error if variable not in table
                    if(!(token.toUpperCase() in symbol_table_a)) {
                        throw new Error(token + " is not in symbol table")
                    }
                    // Add the variable's value to the stack
                    else {
                        stack_a.push(symbol_table_a[token.toUpperCase()])
                    }
                }
                // If the token is operator, it will trigger calculation
                else if (Is_operator(token)) {
                    Calculation(token, stack_a);
                }
                // If the token is = it will do variable assigning
                else if (token == "=") {
                    Assign_variable_to_table(stack_a, symbol_table_a);
                }
                // Error for wrong input
                else {
                    throw new Error("Invalid token in input");
                }

            // Useful for debugging (at least for me)
            console.log(i , stack_a);
            }
            console.log("variable '" + tokens[0].toUpperCase() + "' is assigned with value = " + symbol_table_a[tokens[0].toUpperCase()] + " in symbol table")
        }

        // Error for letting user know the program identify the assignment operator but the input is wrong
        else {
            throw new Error("Wrong input for variable assignment")
        }
    }
    // Error for putting = in wrong place or assigning the variable and continuing with calculation
    else if (tokens.includes("=") && tokens[tokens.length - 1] != "=") {
        throw new Error("You should only assign value as last operation. If you want to perform calculation after assigning value, please do in next input instead of one input")
    }
    // For normal calculation
    else {
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (Is_number(token)) {
                stack_a.push(Number(token));
            }
            else if (Is_variable(token)) {
                if(!(token.toUpperCase() in symbol_table_a)) {
                    throw new Error(token + " is not in symbol table")
                }
                else {
                    stack_a.push(symbol_table_a[token.toUpperCase()])
                }
            }
            else if (Is_operator(token)) {
                Calculation(token, stack_a);
            }
            else if (token == "=") {
                Assign_variable_to_table(stack_a, symbol_table_a);
            }
            else {
                throw new Error("Invalid token in input");
            }
        }
        console.log("Result for the input: " + stack_a.pop())
    }
}

function Search_variable_in_table(key, symbol_table_a) {
    if (key in symbol_table_a) {
        console.log("variable '" + key + "' is assigned with value = " + symbol_table_a[key] + " in symbol table");
    } else {
        console.log("variable not found");
    }
}

function Delete_variable_in_table (key, symbol_table_a) {
    if (key in symbol_table_a) {
        // Delete both key and value from dictionary
        delete symbol_table_a[key]
        console.log("variable '" + key + "' is deleted from symbol table");
    } else {
        console.log("variable not found");
    }
}

// For program looping
function Program_continue() {
    console.log();
    readline.question("Do you want to use (1) Calculator or (2) Symbol Table Operation? (Enter 1 or 2): ", choice => {
        console.log();
        if (choice == "1") {
            // Calculator mode
            readline.question("Input (example: 3 4 +) : ", user_input => {
                    Evaluate_input_line(user_input, stack_a, symbol_table_a);

                // Ask to continue
                readline.question("Do you want to perform another operation? (yes/no) : ", user_choice => {
                    if (user_choice.toLowerCase() == "yes") {
                        Program_continue();
                    } else {
                        console.log("End!");
                        readline.close();
                    }
                });
            });

        } else if (choice == "2") {
            // Symbol table operation mode
            readline.question("Do you want to (1) Search or (2) Delete a variable? (Enter 1 or 2): ", opChoice => {
                if (opChoice == "1") {
                    readline.question("Enter the variable name to search: ", key => {
                        Search_variable_in_table(key.toUpperCase(), symbol_table_a);
                        Program_continue();
                    });
                } else if (opChoice == "2") {
                    readline.question("Enter the variable name to delete: ", key => {
                        Delete_variable_in_table(key.toUpperCase(), symbol_table_a);
                        Program_continue();
                    });
                } else {
                    console.log("Invalid symbol table operation choice.");
                    Program_continue();
                }
            });
        } else {
            console.log("Invalid choice. Please enter 1 or 2.");
            Program_continue();
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////////

// Main function

let stack_a = [];
// X and Y are dummy value
let symbol_table_a = { 'X': 10, 'Y': 3};
const readline = require('readline').createInterface({input: process.stdin, output: process.stdout});

console.log("Welcome to command-line based Postfix++ calculator program!")
Program_continue();

////////////////////////////////////////////////////////////////////////////////////////////

// // Test cases for first if statement (1 to 7)

// // Test case 1: Base case
// Evaluate_input_line("b x 2 * =", stack_a, symbol_table_a);
// // Expected output: 'b': 20 (because x = 10, so 10 * 2 = 20)
// console.log("Symbol table after b = x * 2:", symbol_table_a);

// // // Test case 2(error test): One of the variable not in symbol table
// // Evaluate_input_line("b a 2 * =", stack_a, symbol_table_a);
// // // Expected output: error (a is not in the symbol table)
// // console.log("Symbol table after b = a * 2:", symbol_table_a);

// // Test case 3: First token variable, last token assignment (with two variable)
// Evaluate_input_line("b x y * =", stack_a, symbol_table_a);
// // Expected output: 'b': 30 (because x = 10, y = 3 so 10 * 3 = 30)
// console.log("Symbol table after b  = x * y:", symbol_table_a);

// // Test case 4: Assign variable and use it in another input
// Evaluate_input_line("a 40 =", stack_a, symbol_table_a);
// Evaluate_input_line("b a 2 * =", stack_a, symbol_table_a);
// // Expected output: 'b': 80 (because a = 40, so 40 * 2 = 80)
// console.log("Symbol table after a = 40, b = a * 2:", symbol_table_a);

// // Test case 5: Multiple calculation test
// Evaluate_input_line("b y a x - * =", stack_a, symbol_table_a);
// // Expected output: 'b': 90
// console.log("Symbol table after b = (a - x) * y:", symbol_table_a);

// // // Test case 6 (error test): Input contains not allowed character
// // Evaluate_input_line("b # 2 + =", stack_a, symbol_table_a);
// // // Expected output: error
// // console.log("Symbol table after b = # + 2:", symbol_table_a);

// // // Test case 7 (error test): Wrong input for variable assignment
// // Evaluate_input_line("1 a 2 + =", stack_a, symbol_table_a);
// // // Expected output: error
// // console.log("Symbol table after 1 = a + 2:", symbol_table_a);

// // // Test case 8 (error test): Multiple assignment in input
// // Evaluate_input_line("c 4 c 2 = +", stack_a, symbol_table_a);
// // // Expected output: error
// // console.log("Symbol table after c = 2, c + 4:", symbol_table_a);

// // Normal Test cases (9 to 12)

// // Test case 9: Base case
// Evaluate_input_line("3 4 5 + *", stack_a, symbol_table_a);
// // Expected output: 27 (because 4 + 5 = 9 * 3 = 27)
// console.log("Symbol table after (4 + 5) * 3:", stack_a.pop());

// // Test case 10: Test with variables
// Evaluate_input_line("a b *", stack_a, symbol_table_a);
// // Expected output: 3600 (because a = 40, b = 90 after running all the success test cases)
// console.log("Symbol table after a * b:", stack_a.pop());

// // // Test case 11 (error test): Variable not in symbol table
// // Evaluate_input_line("c b *", stack_a, symbol_table_a);
// // // Expected output: error
// // console.log("Symbol table after c * b:", stack_a.pop());

// // // Test case 12 (error test): Input contains not allowed character
// // Evaluate_input_line("# b *", stack_a, symbol_table_a);
// // // Expected output: error
// // console.log("Symbol table after # * b:", stack_a.pop());