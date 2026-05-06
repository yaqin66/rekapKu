import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_123';

// Helper function to generate our own JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      email: user.email, 
      name: user.name, 
      picture: user.picture 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' } // Token berlaku 7 hari
  );
};

// 1. REGISTER (Email & Password)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  try {
    // Cek apakah email sudah terdaftar
    const { rows: existingUsers } = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database
    await pool.query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3)',
      [email, name, hashedPassword]
    );

    const token = generateToken({ email, name, picture: null });
    res.status(201).json({ token, user: { email, name, picture: null } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Gagal mendaftarkan akun' });
  }
});

// 2. LOGIN (Email & Password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Email tidak ditemukan' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Akun ini terdaftar melalui Google. Silakan gunakan tombol Sign in with Google.' });
    }

    // Cek kecocokan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password salah' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE email = $1', [email]);

    const token = generateToken(user);
    res.json({ token, user: { email: user.email, name: user.name, picture: user.picture } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Gagal melakukan login' });
  }
});

// 3. GOOGLE LOGIN
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Token Google tidak ditemukan' });
  }

  try {
    // Verifikasi token dari Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Simpan atau update data user di database
    await pool.query(`
      INSERT INTO users (email, name, picture) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (email) 
      DO UPDATE SET name = EXCLUDED.name, picture = EXCLUDED.picture, last_login = NOW()
    `, [email, name, picture]);

    // Berikan Custom JWT milik kita sendiri
    const token = generateToken({ email, name, picture });
    res.json({ token, user: { email, name, picture } });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Gagal memverifikasi akun Google' });
  }
});

// 4. UPDATE PROFILE
import { verifyGoogleToken } from '../middleware/auth.js';

router.put('/profile', verifyGoogleToken, async (req, res) => {
  const { name, email, password, picture } = req.body;
  const oldEmail = req.user_email;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nama dan email wajib diisi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cek jika email diganti, apakah email baru sudah terpakai
    if (email !== oldEmail) {
      const { rows } = await client.query('SELECT email FROM users WHERE email = $1', [email]);
      if (rows.length > 0) {
        throw new Error('Email sudah digunakan oleh akun lain');
      }
    }

    let queryParams = [name, picture, oldEmail];
    let queryStr = 'UPDATE users SET name = $1, picture = $2 WHERE email = $3';

    // Jika password juga diganti
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      queryParams = [name, picture, hashedPassword, oldEmail];
      queryStr = 'UPDATE users SET name = $1, picture = $2, password = $3 WHERE email = $4';
    } else if (password && password.length > 0 && password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    await client.query(queryStr, queryParams);

    // Jika email diganti, update PRIMARY KEY email di users (CASCADE akan mengupdate seluruh tabel lain)
    if (email !== oldEmail) {
      await client.query('UPDATE users SET email = $1 WHERE email = $2', [email, oldEmail]);
    }

    await client.query('COMMIT');

    // Buat token baru dengan data yang diupdate
    const token = generateToken({ email, name, picture });
    res.json({ token, user: { email, name, picture } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message || 'Gagal memperbarui profil' });
  } finally {
    client.release();
  }
});

export default router;
