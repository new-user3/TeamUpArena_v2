// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path'); // Import the path module

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname)));

// Endpoint for handling personal M-Pesa STK Push payment requests
app.post('/personalMpesaStkPush', async (req, res) => {
    // Extract required parameters from the request body
    const { phone, amount } = req.body;

    console.log('Phone:', phone); // Log the value of phone
    console.log('Amount:', amount); // Log the value of amount

    try {
        // M-Pesa credentials and parameters
        const consumerKey = 'lEwnLS8uzQaDFDTU3aUDXv8jAdaLcagPyuIOEVQDwTWSUgqN';
        const consumerSecret = '6limIjyaUnifJlmP35bnCd8c8J7oArRJNXqGzb8YAzohLANZxNFnGet0bRGt3A7J';
        const callBackUrl = 'https://teamuparena-v2.onrender.com/'; // Your callback URL
        
        // Get the timestamp
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -3);
        
        // Generate the password (no need for businessShortCode)
        const password = Buffer.from(consumerKey + consumerSecret + timestamp).toString('base64');

        // M-Pesa access token request
        const accessTokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            auth: {
                username: consumerKey,
                password: consumerSecret
            }
        });

        const accessToken = accessTokenResponse.data.access_token;

        // M-Pesa STK Push request
        const stkPushResponse = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            BusinessShortCode: '', // No need for BusinessShortCode
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phone,
            PartyB: '', // No need for PartyB
            PhoneNumber: phone,
            CallBackURL: callBackUrl,
            AccountReference: '2255',
            TransactionDesc: 'Test Payment'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Send the STK Push response to the client
        res.json(stkPushResponse.data);
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
