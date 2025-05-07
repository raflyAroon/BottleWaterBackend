const customerProfileModel = require('../models/customerProfileModel');
const jwt = require('jsonwebtoken');

const customerProfileController = {

    getProfile: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.email;
            
            const profile = await customerProfileModel.getCustomerProfileByEmailUser(userEmail);
            
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
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user_id directly from token payload instead of looking up by email
            const user_id = decoded.user_id;
            
            // Get the profile for the authenticated user
            const profile = await customerProfileModel.getCustomerProfileByUserId(user_id);
            
            if (!profile) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Profile tidak ditemukan',
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
    
    upsertProfile: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user_id directly from token payload
            const user_id = decoded.user_id;
            
            // Extract profile data from request body
            const { full_name, phone, address, delivery_instructions } = req.body;
            
            // Validate required fields
            if (!full_name || !phone || !address) {
                return res.status(400).json({
                    status: 'error',
                    message: 'full_name, phone, dan address harus diisi',
                    data: null
                });
            }
            
            // Prepare data for upsert
            const profileData = {
                user_id,
                full_name,
                phone,
                address,
                delivery_instructions: delivery_instructions || ''
            };
            
            // Upsert the profile
            const result = await customerProfileModel.upsertCustomerProfile(profileData);
            
            return res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
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
    
    // Admin function to get all customer profiles
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
            
            const profiles = await customerProfileModel.getAllCustomerProfiles();
            
            return res.status(200).json({
                status: 'success',
                message: 'All profiles retrieved successfully',
                data: profiles
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                data: null
            });
        }
    }
};

module.exports = customerProfileController;