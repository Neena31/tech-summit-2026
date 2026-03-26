const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const REGISTRY_FILE = path.join(__dirname, 'registrations.json');

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Init registration file if not exists
if (!fs.existsSync(REGISTRY_FILE)) {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify([]));
}

// API Endpoint to register
app.post('/api/register', (req, res) => {
    try {
        const { name, email, phone, college } = req.body;
        
        // Validation
        if (!name || !email || !phone || !college) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const newRegistration = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            college,
            registeredAt: new Date().toISOString()
        };

        const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
        const registrations = JSON.parse(data);
        
        // Check if email already registered
        const alreadyRegistered = registrations.find(r => r.email === email);
        if (alreadyRegistered) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        registrations.push(newRegistration);
        
        fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registrations, null, 2));

        res.status(201).json({ message: 'Registration successful!', registration: newRegistration });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
