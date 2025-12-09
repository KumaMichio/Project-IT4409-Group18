require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, addUser, getUsers } = require('./lib/users');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_this';
const PORT = process.env.PORT || 4000;

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

app.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body || {};
        if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

        const normalizedRole = (role || 'student').toLowerCase();
        if (!['student', 'teacher', 'admin'].includes(normalizedRole)) return res.status(400).json({ error: 'Invalid role' });

        const existing = await findUserByEmail(email);
        if (existing) return res.status(409).json({ error: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 10);
        const id = (global.crypto && global.crypto.randomUUID) ? global.crypto.randomUUID() : String(Date.now());

        const user = { id, name, email, passwordHash, role: normalizedRole };
        await addUser(user);

        const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await findUserByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/auth/me', async (req, res) => {
    try {
        const auth = req.headers['authorization'] || '';
        const parts = String(auth).split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Missing token' });

        const payload = (() => {
            try { return jwt.verify(parts[1], JWT_SECRET); } catch (e) { return null; }
        })();
        if (!payload) return res.status(401).json({ error: 'Invalid token' });

        const users = await getUsers();
        const user = users.find(u => u.id === payload.id);
        if (!user) return res.status(404).json({ error: 'Not found' });

        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
});
