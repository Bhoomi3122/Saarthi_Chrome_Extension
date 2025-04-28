const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const users = []; // Store users temporarily (replace with DB later)
const SECRET_KEY = 'your_secret_key_here';

// Signup API
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword });
    res.json({ message: 'Signup successful!' });
});

// Login API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ token });
});

// Protected API Example
app.get('/protected', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: 'Protected data', user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.listen(5000, () => {
    console.log('Backend running on port 5000');
});
