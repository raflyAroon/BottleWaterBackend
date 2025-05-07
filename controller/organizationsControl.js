const orgProfileModel = require('../models/organizationsModel');
const jwt = require('jsonwebtoken');

const orgProfileController = {

    getProfile: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.email;
            
            const profile = await orgProfileModel.getOrgProfileByEmailUser(userEmail);
            
            if (!profile) {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Profile not found',
                    data: null
                });
            }
            
            return res.status(200).json({
                status: 'success',
                message: 'Profile retrieved successfully',
                data: profile
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                data: null
            });
        }
    },

    getCurrentUserProfile: async (req, res) => {
        try {
            console.log('Get Profile Request received');
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token tidak ditemukan',
                    data: null
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.email;
            console.log('User email:', email);
            
            // Get user_id from email
            const user_id = await orgProfileModel.getUserIdByEmail(email);
            console.log('User ID:', user_id);
            
            const profile = await orgProfileModel.getOrgProfileByUserId(user_id);
            console.log('Profile found:', profile);
            
            if (!profile) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Profile organisasi tidak ditemukan',
                    data: null
                });
            }
            
            return res.status(200).json({
                status: 'success',
                message: 'Profile berhasil diambil',
                data: profile
            });
        } catch (error) {
            console.error('Error in getCurrentUserProfile:', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token tidak valid',
                    data: null
                });
            }
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Terjadi kesalahan saat mengambil profile',
                data: null
            });
        }
    },
    
    upsertProfile: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token tidak ditemukan',
                    data: null
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.email;

            // Get user_id from email
            const user_id = await orgProfileModel.getUserIdByEmail(email);
            
            const { org_name, contact_person, contact_phone_org, org_type } = req.body;
            
            if (!org_name || !contact_person || !contact_phone_org || !org_type) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Nama organisasi, contact person, nomor telepon, dan tipe organisasi harus diisi',
                    data: null
                });
            }

            // Validate org_type
            const validOrgTypes = ['retail', 'corporate', 'education', 'government', 'non_profit'];
            if (!validOrgTypes.includes(org_type)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Tipe organisasi tidak valid. Pilihan yang tersedia: retail, corporate, education, government, non_profit',
                    data: null
                });
            }

            const orgProfileData = {
                user_id,
                org_name,
                contact_person,
                contact_phone_org: contact_phone_org.replace(/[^\d+]/g, ''),
                org_type
            };
            
            const result = await orgProfileModel.upsertOrgProfile(orgProfileData);
            
            return res.status(200).json({
                status: 'success',
                message: 'Profile organisasi berhasil diperbarui',
                data: result
            });
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token tidak valid',
                    data: null
                });
            }
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Terjadi kesalahan saat memperbarui profile',
                data: null
            });
        }
    },
    
    // Admin function to get all organization profiles
    getAllProfiles: async (req, res) => {
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
            
            const profiles = await orgProfileModel.getAllOrgProfiles();
            
            return res.status(200).json({
                status: 'success',
                message: 'Semua profile organisasi berhasil diambil',
                data: profiles
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Terjadi kesalahan saat mengambil data profile',
                data: null
            });
        }
    }
};

module.exports = orgProfileController;