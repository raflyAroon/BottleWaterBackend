const jwt = require('jsonwebtoken');
const userModel = require('../models/userModels.js');

const authMiddleware = {
    authenticate: async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required',
                    data: null
                });
            }

            const token = authHeader.split(' ')[1];
            
            // Split and log token parts
            const [header, payload, signature] = token.split('.');
            console.log('\n=== JWT Token Parts ===');
            console.log('Header:', Buffer.from(header, 'base64').toString());
            console.log('Payload:', Buffer.from(payload, 'base64').toString());
            console.log('Signature:', signature);
            
            // Verify and decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if user exists and is active
            const user = await userModel.getUserByEmail(decoded.email);
            
            if (!user || !user.is_active) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid or inactive user',
                    data: null
                });
            }
            
            // Attach user to request object
            req.user = {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            };
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    status: 'error',
                    message: 'Invalid token structure or signature' 
                });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    status: 'error',
                    message: 'Token has expired' 
                });
            }
            res.status(500).json({ 
                status: 'error',
                message: 'Server error', 
                error: error.message 
            });
        }
    },
    
    // Simple role-based middleware
    isAdmin: (req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({
                status: 'error',
                message: 'Akses ditolak. Anda tidak memiliki izin admin'
            });
        }
    },
    
    isOrganization: (req, res, next) => {
        if (req.user && req.user.role === 'organization') {
            next();
        } else {
            res.status(403).json({
                status: 'error',
                message: 'Akses ditolak. Anda tidak memiliki izin organization'
            });
        }
    },
    
    isCustomer: (req, res, next) => {
        if (req.user && req.user.role === 'customer') {
            next();
        } else {
            res.status(403).json({
                status: 'error',
                message: 'Akses ditolak. Anda tidak memiliki izin customer'
            });
        }
    }
};

module.exports = authMiddleware;