import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_123';

export const verifyGoogleToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses Ditolak: Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verifikasi token menggunakan rahasia JWT_SECRET kita sendiri (bukan google lagi)
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Simpan data user ke request
    req.user_email = decoded.email;
    req.user_name = decoded.name;
    req.user_picture = decoded.picture;

    next();
  } catch (error) {
    console.error('JWT Auth Error:', error.message);
    res.status(401).json({ error: 'Akses Ditolak: Token tidak valid atau kedaluwarsa' });
  }
};
