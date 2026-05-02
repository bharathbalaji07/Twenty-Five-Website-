const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function authRoutes() {
  const router = require('express').Router();

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@twentyfive.local';
    const legacyEmail = 'admin@biteflow.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    const emailMatches = email === adminEmail || (!process.env.ADMIN_EMAIL && email === legacyEmail);
    const passwordMatches = adminPasswordHash
      ? await bcrypt.compare(password || '', adminPasswordHash)
      : password === adminPassword;

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET || 'dev-secret-change-me',
      { expiresIn: '8h' }
    );

    return res.json({ token, admin: { email: adminEmail } });
  });

  return router;
}

module.exports = { authRoutes };
