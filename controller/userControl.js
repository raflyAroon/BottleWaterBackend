const userModel = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    // Mendapatkan semua users (untuk admin)
    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.getUsers();
            res.status(200).json({
                status: 'success',
                data: users
            });
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil data pengguna',
                error: error.message
            });
        }
    },

    // Register user baru
    register: async (req, res) => {
        try {
            const { email, password, role } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email dan password diperlukan'
                });
            }
            
            const existingUser = await userModel.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email sudah terdaftar'
                });
            }
            
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            let validRole = 'customer';
            if (role && ['admin', 'organization', 'customer'].includes(role)) {
                validRole = role;
            }
            
            const newUser = await userModel.createUser(email, passwordHash, validRole);
            
            // Create JWT token with header, payload, and signature parts
            const header = {
                alg: 'HS256',
                typ: 'JWT'
            };
            
            const payload = {
                    user_id: newUser.user_id,
                    email: newUser.email,
                    role: newUser.role,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            };
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, { 
                algorithm: 'HS256',
                header: header 
            });

            // Log token parts
            const [headerPart, payloadPart, signaturePart] = token.split('.');
            console.log('\n=== Generated JWT Token Parts ===');
            console.log('Header:', Buffer.from(headerPart, 'base64').toString());
            console.log('Payload:', Buffer.from(payloadPart, 'base64').toString());
            console.log('Signature:', signaturePart);
            
            res.status(201).json({
                status: 'success',
                message: 'Pendaftaran berhasil',
                token: token,
                user: {
                    user_id: newUser.user_id,
                    email: newUser.email,
                    role: newUser.role,
                    is_active: newUser.is_active
                }
            });
            
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mendaftarkan pengguna',
                error: error.message
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email dan password diperlukan'
                });
            }
            
            const user = await userModel.getUserByEmail(email);
            
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Email atau password salah'
                });
            }
            
            if (!user.is_active) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Akun Anda telah dinonaktifkan'
                });
            }
            
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Email atau password salah'
                });
            }
            
            // Create JWT token with header, payload, and signature parts
            const header = {
                alg: 'HS256',
                typ: 'JWT'
            };
            
            const payload = {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            };
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, { 
                algorithm: 'HS256',
                header: header 
            });

            // Log token parts
            const [headerPart, payloadPart, signaturePart] = token.split('.');
            console.log('\n=== Generated JWT Token Parts ===');
            console.log('Header:', Buffer.from(headerPart, 'base64').toString());
            console.log('Payload:', Buffer.from(payloadPart, 'base64').toString());
            console.log('Signature:', signaturePart);
            
            res.status(200).json({
                status: 'success',
                message: 'Login berhasil',
                token: token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active
                }
            });
            
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat login',
                error: error.message
            });
        }
    },

    // Logout user
    logout: async (req, res) => {
        // Since we're not using cookies anymore, we just send a success response
        // The client should handle removing the token from their storage
        res.status(200).json({
            status: 'success',
            message: 'Logout berhasil'
        });
    },

    // Get current user from token
    getUserProfile: async (req, res) => {
        try {
            // Get email from authenticated user
            const email = req.user.email;
            
            // Find user by email
            const user = await userModel.getUserByEmail(email);
            
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User tidak ditemukan'
                });
            }
            
            res.status(200).json({
                status: 'success',
                data: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active
                }
            });
            
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil data user',
                error: error.message
            });
        }
    },

    // Toggle user active status (admin only)
    toggleUserStatus: async (req, res) => {
        try {
            // Check if user is admin from token payload
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (decoded.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access',
                    data: null
                });
            }

            const { userId } = req.params;
            const result = await userModel.toggleUserStatus(userId);
            
            return res.status(200).json({
                status: 'success',
                message: `User status has been ${result.is_active ? 'activated' : 'deactivated'}`,
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                data: null
            });
        }
    },
};

module.exports = userController;