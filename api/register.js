const { neon } = require('@neondatabase/serverless');

// Load .env for local development (Vercel injects env vars in production)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Validate DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set');
        return res.status(500).json({ error: 'Database not configured. Set DATABASE_URL in environment.' });
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Create table if it doesn't exist (idempotent)
        await sql`
            CREATE TABLE IF NOT EXISTS registrations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL,
                college TEXT NOT NULL,
                registered_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        const { name, email, phone, college } = req.body;

        // Validation
        if (!name || !email || !phone || !college) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Check for duplicate email
        const existing = await sql`
            SELECT email FROM registrations WHERE email = ${email}
        `;
        if (existing.length > 0) {
            return res.status(400).json({ error: 'This email is already registered.' });
        }

        // Insert new registration
        const result = await sql`
            INSERT INTO registrations (name, email, phone, college)
            VALUES (${name}, ${email}, ${phone}, ${college})
            RETURNING id, name, email, phone, college, registered_at
        `;

        return res.status(201).json({
            message: 'Registration successful! See you at TechX Summit 2026 🚀',
            registration: result[0]
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle unique constraint violation gracefully
        if (error.code === '23505') {
            return res.status(400).json({ error: 'This email is already registered.' });
        }

        return res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
};
