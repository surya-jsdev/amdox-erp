import User from '../models/User.js';
import SystemSettings from '../models/SystemSettings.js';

// Get user preferences
export const getUserSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return user settings preference fields
        res.status(200).json({
            theme: user.theme || 'light',
            language: user.language || 'en',
            emailNotifications: user.emailNotifications !== false, // default true
            pushNotifications: !!user.pushNotifications,          // default false
            orderAlerts: user.orderAlerts !== false                // default true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user preferences
export const updateUserSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { theme, language, emailNotifications, pushNotifications, orderAlerts } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    theme,
                    language,
                    emailNotifications,
                    pushNotifications,
                    orderAlerts
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User settings updated successfully',
            settings: {
                theme: user.theme,
                language: user.language,
                emailNotifications: user.emailNotifications,
                pushNotifications: user.pushNotifications,
                orderAlerts: user.orderAlerts
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password matching (plain text comparison matching original login logic)
        if (user.password !== oldPassword) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Global System Settings
export const getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        // Create default system settings if none exist
        if (!settings) {
            settings = await SystemSettings.create({
                companyName: 'AmDOX ERP',
                companyEmail: 'info@amdox.com',
                currency: 'USD',
                taxRate: 18,
                fiscalYearStart: 'April',
                allowAiFeatures: true,
                allowInventoryAlerts: true
            });
        }

        res.status(200).json({ settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Global System Settings (Restricted to Admin in frontend / controller check)
export const updateSystemSettings = async (req, res) => {
    try {
        const {
            companyName,
            companyEmail,
            currency,
            taxRate,
            fiscalYearStart,
            allowAiFeatures,
            allowInventoryAlerts
        } = req.body;

        let settings = await SystemSettings.findOne();

        if (!settings) {
            settings = new SystemSettings();
        }

        settings.companyName = companyName !== undefined ? companyName : settings.companyName;
        settings.companyEmail = companyEmail !== undefined ? companyEmail : settings.companyEmail;
        settings.currency = currency !== undefined ? currency : settings.currency;
        settings.taxRate = taxRate !== undefined ? Number(taxRate) : settings.taxRate;
        settings.fiscalYearStart = fiscalYearStart !== undefined ? fiscalYearStart : settings.fiscalYearStart;
        settings.allowAiFeatures = allowAiFeatures !== undefined ? allowAiFeatures : settings.allowAiFeatures;
        settings.allowInventoryAlerts = allowInventoryAlerts !== undefined ? allowInventoryAlerts : settings.allowInventoryAlerts;

        await settings.save();

        res.status(200).json({
            message: 'System settings updated successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
