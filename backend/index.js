const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { spawnSync } = require('child_process');

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to receive code and language from frontend
app.post('/evaluate', (req, res) => {
    const { code, language } = req.body;
    console.log(req.body);

    // Write code to a file
    fs.writeFileSync('user_code.' + (language === 'cpp' ? 'cpp' : 'py'), code);

    // Read test cases from file
    const testCases = JSON.parse(fs.readFileSync('testcase.json'));
    // console.log(testCases);

    // Store results of each test case
    const results = [];

    // Run code against each test case and count matches
    testCases.forEach((testCase, index) => {
        const input = Object.values(testCase.input).join(' ');
        const expectedOutput = testCase.output;

        let output;
        let success;
        if (language === 'cpp') {
            // Compile and execute C++ code
            const compileResult = spawnSync('g++', ['user_code.cpp', '-o', 'user_code']);
            if (compileResult.status === 0) {
                output = spawnSync('./user_code', { input, encoding: 'utf-8' }).stdout.trim();
                success = output === expectedOutput;
            } else {
                output = 'Compilation Error';
                success = false;
            }
        } else if (language === 'python') {
            // Execute Python code
            output = spawnSync('python', ['user_code.py'], { input, encoding: 'utf-8' }).stdout.trim();
            success = output === expectedOutput;
        }

        // Store result of current test case
        results.push({
            input: testCase.input,
            expectedOutput,
            actualOutput: output,
            success
        });
    });

    // Write results to a JSON file
    fs.writeFileSync('results.json', JSON.stringify(results, null, 2));

    // Send response to frontend
    res.json(results);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
