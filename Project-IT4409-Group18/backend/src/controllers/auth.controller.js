const {
  signup,
  signin,
  getMeFromToken,
  AuthError,
} = require('../services/auth.service');

async function signupController(req, res) {
  try {
    const { name, email, password, role } = req.body || {};
    
    // Log the registration attempt for debugging
    console.log('[AUTH] Registration attempt:', { 
      email, 
      role, 
      hasName: !!name, 
      hasPassword: !!password 
    });
    
    const result = await signup({ name, email, password, role });
    return res.status(201).json(result); // { token, user }
  } catch (err) {
    if (err instanceof AuthError) {
      console.log('[AUTH] Registration error:', err.status, err.message);
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[AUTH] Unexpected registration error:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

async function signinController(req, res) {
  try {
    const { email, password } = req.body || {};
    const result = await signin({ email, password });
    return res.status(200).json(result); // { token, user }
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function meController(req, res) {
  try {
    const auth = req.headers['authorization'] || '';
    const parts = String(auth).split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Missing token' });
    }

    const token = parts[1];
    const user = await getMeFromToken(token);

    return res.json({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  signupController,
  signinController,
  meController,
};
