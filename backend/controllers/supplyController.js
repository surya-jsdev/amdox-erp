import Vendor from '../models/Vendor.js';

export const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load vendors' });
    }
};

export const createVendor = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address, gstNumber, status } = req.body;

        if (!name || !contactPerson || !email || !phone) {
            return res.status(400).json({ message: 'Name, contact person, email and phone are required.' });
        }

        const vendor = await Vendor.create({
            name,
            contactPerson,
            email,
            phone,
            address: address || '',
            gstNumber: gstNumber || '',
            status: status || 'Active',
        });

        res.status(201).json({ message: 'Vendor created successfully', vendor });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create vendor' });
    }
};

export const updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const { name, contactPerson, email, phone, address, gstNumber, status } = req.body;

        vendor.name = name ?? vendor.name;
        vendor.contactPerson = contactPerson ?? vendor.contactPerson;
        vendor.email = email ?? vendor.email;
        vendor.phone = phone ?? vendor.phone;
        vendor.address = address ?? vendor.address;
        vendor.gstNumber = gstNumber ?? vendor.gstNumber;
        vendor.status = status ?? vendor.status;

        const updatedVendor = await vendor.save();
        res.json({ message: 'Vendor updated successfully', vendor: updatedVendor });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update vendor' });
    }
};

export const deleteVendor = async (req, res) => {
    try {
        const deleted = await Vendor.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete vendor' });
    }
};
