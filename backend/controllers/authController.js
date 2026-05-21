const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  console.log("Incoming Register Request:", req.body);
  const { name, email, password, role, investmentGoal, riskAppetite } = req.body;
  if (role === 'admin') {
    return res.status(403).json({ msg: 'Cannot register as admin.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password, role, investmentGoal, riskAppetite });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

exports.login = async (req, res) => {
  console.log("Incoming Login Request:", { email: req.body.email });
  const { email, password } = req.body;
  try {
    // ── Admin Shortcut Logic ────────────────────────────────────────────────
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@intentedge.ai';
    const ADMIN_PASS  = process.env.ADMIN_PASSWORD || 'admin@123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const payload = { user: { id: 'admin_id_hardcoded' } };
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
        if (err) throw err;
        console.log('✅ Admin Login Success:', email);
        return res.json({ token, user: { id: 'admin_id_hardcoded', name: 'IntentEdge Admin', email, role: 'admin' } });
      });
    }

    // ── Regular Investor Login ──────────────────────────────────────────────
    let user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Login Failed — user not found:', email);
      return res.status(404).json({ msg: 'Account not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Login Failed — wrong password:', email);
      return res.status(401).json({ msg: 'Incorrect password' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      console.log('✅ Login Success:', email);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
