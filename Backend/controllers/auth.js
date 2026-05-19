const User = require('../models/users');
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Validate role
  if (role && !['admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be either admin or superadmin' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Hashing error' });

    User.createUser({ username, password: hashedPassword, role: role || 'admin' }, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Username already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully', id: result.insertId });
    });
  });
};

exports.login = (req, res) => {
  const { username, password, role } = req.body;
  console.log('Login attempt:', { username, role });

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  User.findByUsername(username, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log('Database results:', results);

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];
    console.log('Found user:', { id: user.id, username: user.username, role: user.role });

    // Check if user is active
    if (user.status === 'Inactive') {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Verify role if provided
    if (role && user.role !== role) {
      console.log('Role mismatch:', { expected: role, actual: user.role });
      return res.status(401).json({ message: 'Invalid role for this user' });
    }

    console.log('Comparing passwords:', { stored: user.password });
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error('Password comparison error:', err);
        return res.status(500).json({ message: 'Authentication error' });
      }

      console.log('Password match:', match);

      if (!match) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Send user data without password
      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status
      };

      res.json({
        message: 'Login successful',
        user: userData
      });
    });
  });
};
