const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to serve static files (HTML, CSS, client-side JS)
// This will serve files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// No need for express.json() or express.urlencoded() if the server isn't processing POST data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Route to serve the main login page for the off-chain version
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Optional: If you want direct routes to other pages (though navigation will be via login)
app.get('/institution', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'institution.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

app.get('/employer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employer.html'));
});


// The '/api/transcripts/issue' endpoint is no longer directly used by the
// purely off-chain frontend version, as that logic is simulated in 'scripts.js'.
// You can comment it out or remove it if this server is ONLY for the off-chain version.
// If you intend to have a hybrid system or switch back to on-chain later, you might keep it.

/*
app.post('/api/transcripts/issue', (req, res) => {
    // This backend logic would be for an on-chain version where the
    // frontend sends data to the server, and the server (holding a private key)
    // interacts with the smart contract.
    // For the off-chain browser-only version, this is not used.
    const transcriptData = req.body;
    console.log('Received transcript data on backend (for on-chain version):', transcriptData);

    // TODO for ON-CHAIN version:
    // 1. Validate the data.
    // 2. Interact with smart contract.
    // 3. Handle the response.

    res.status(200).json({
        message: 'Backend API: Transcript issuance request received. (This endpoint is for an on-chain setup)',
        data: transcriptData
    });
});
*/

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('UniCertify off-chain demo is accessible. Start with /login.html or /');
});