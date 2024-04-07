// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint for handling USSD requests
app.post('/ussd', async (req, res) => {
    // Extract the Mpesa number from the request body
    const { mpesaNumber } = req.body;

    try {
        // Make a request to M-Pesa's API to send USSD pin prompt
        const response = await axios.post('https://mpesa-provider-api.com/ussd/send', {
            phone_number: mpesaNumber,
            ussd_code: '*123#', // Example USSD code for pin prompt
            message: 'Please enter your PIN:', // Example message content
            // Add any additional parameters required by M-Pesa's API
        });

        // Check if the USSD pin prompt was successfully sent
        if (response.data.success) {
            // Respond with success message
            res.json({ success: true, message: 'USSD pin prompt sent successfully' });
        } else {
            // Respond with error message if sending failed
            res.json({ success: false, message: 'Failed to send USSD pin prompt' });
        }
    } catch (error) {
        // Handle errors (e.g., network issues, API errors, etc.)
        console.error('Error sending USSD pin prompt:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
