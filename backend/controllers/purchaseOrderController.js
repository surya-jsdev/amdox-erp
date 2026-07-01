import PurchaseOrder from '../models/PurchaseOrder.js';
import Vendor from '../models/Vendor.js';

const generatePoNumber = async () => {
    const date = new Date();
    const prefix = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await PurchaseOrder.countDocuments({ poNumber: { $regex: `^${prefix}` } });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

const calculateItems = (items = []) => {
    return items.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return {
            item: item.item || null,
            description: item.description || '',
            quantity,
            unitPrice,
            total: quantity * unitPrice,
        };
    });
};

export const getPurchaseOrders = async (req, res) => {
    try {
        const { vendorId, status, search } = req.query;
        const filter = {};

        if (vendorId) {
            filter.vendor = vendorId;
        }

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.poNumber = { $regex: search, $options: 'i' };
        }

        const purchaseOrders = await PurchaseOrder.find(filter)
            .populate('vendor', 'name contactPerson email phone')
            .sort({ createdAt: -1 });

        res.json(purchaseOrders);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load purchase orders' });
    }
};

export const getPurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findById(req.params.id).populate('vendor', 'name contactPerson email phone');
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.json(purchaseOrder);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load purchase order' });
    }
};

export const createPurchaseOrder = async (req, res) => {
    try {
        const { poNumber, vendor, items, expectedDeliveryDate, notes } = req.body;

        if (!vendor) {
            return res.status(400).json({ message: 'Vendor is required' });
        }

        const vendorExists = await Vendor.findById(vendor);
        if (!vendorExists) {
            return res.status(400).json({ message: 'Selected vendor does not exist' });
        }

        const sanitizedItems = calculateItems(items || []);
        if (sanitizedItems.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }

        const totalAmount = sanitizedItems.reduce((sum, item) => sum + item.total, 0);
        const generatedPoNumber = poNumber?.trim() || (await generatePoNumber());

        const purchaseOrder = await PurchaseOrder.create({
            poNumber: generatedPoNumber,
            vendor,
            items: sanitizedItems,
            totalAmount,
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
            notes: notes?.trim() || '',
            status: 'Pending',
            createdBy: req.get('x-user-id') || null,
        });

        res.status(201).json({ message: 'Purchase order created successfully', purchaseOrder });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.poNumber) {
            return res.status(409).json({ message: 'Purchase order number already exists' });
        }
        res.status(500).json({ message: error.message || 'Failed to create purchase order' });
    }
};

export const updatePurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findById(req.params.id);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        const role = req.get('x-user-role');
        if (role !== 'Admin' && ['Received', 'Cancelled'].includes(purchaseOrder.status)) {
            return res.status(403).json({ message: 'Cannot edit a completed or cancelled purchase order' });
        }

        const { vendor, items, expectedDeliveryDate, notes, status } = req.body;

        if (vendor && vendor !== String(purchaseOrder.vendor)) {
            const vendorExists = await Vendor.findById(vendor);
            if (!vendorExists) {
                return res.status(400).json({ message: 'Selected vendor does not exist' });
            }
            purchaseOrder.vendor = vendor;
        }

        if (items) {
            const sanitizedItems = calculateItems(items);
            if (sanitizedItems.length === 0) {
                return res.status(400).json({ message: 'At least one item is required' });
            }
            purchaseOrder.items = sanitizedItems;
            purchaseOrder.totalAmount = sanitizedItems.reduce((sum, item) => sum + item.total, 0);
        }

        if (expectedDeliveryDate) {
            purchaseOrder.expectedDeliveryDate = new Date(expectedDeliveryDate);
        }

        if (notes !== undefined) {
            purchaseOrder.notes = notes?.trim() || '';
        }

        if (status && role === 'Admin') {
            purchaseOrder.status = status;
        } else if (status && role !== 'Admin' && status !== purchaseOrder.status) {
            return res.status(403).json({ message: 'HR cannot change purchase order status directly' });
        }

        await purchaseOrder.save();
        res.json({ message: 'Purchase order updated successfully', purchaseOrder });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update purchase order' });
    }
};

export const approvePurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findById(req.params.id);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        if (purchaseOrder.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending purchase orders can be approved' });
        }

        purchaseOrder.status = 'Approved';
        purchaseOrder.approvedBy = req.get('x-user-id') || null;
        purchaseOrder.history.push({
            status: 'Approved',
            changedBy: req.get('x-user-id') || 'unknown',
            changedAt: new Date(),
            comment: req.body.comment || 'Approved by role',
        });

        await purchaseOrder.save();
        res.json({ message: 'Purchase order approved successfully', purchaseOrder });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to approve purchase order' });
    }
};

export const deletePurchaseOrder = async (req, res) => {
    try {
        const deleted = await PurchaseOrder.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.json({ message: 'Purchase order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete purchase order' });
    }
};
