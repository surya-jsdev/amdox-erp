import InventoryItem from '../models/InventoryItem.js';
import Vendor from '../models/Vendor.js';

export const getInventoryItems = async (req, res) => {
    try {
        const { search, status, category, supplier } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (supplier) filter.supplier = supplier;

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { itemName: regex },
                { sku: regex },
                { category: regex },
                { location: regex },
                { description: regex },
            ];
        }

        const items = await InventoryItem.find(filter)
            .populate('supplier', 'name')
            .sort({ updatedAt: -1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load inventory items' });
    }
};

export const getInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id).populate('supplier', 'name');
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load inventory item' });
    }
};

export const createInventoryItem = async (req, res) => {
    try {
        const {
            itemName,
            sku,
            category,
            quantity,
            reorderLevel,
            location,
            supplier,
            status,
            description,
        } = req.body;

        if (!itemName || !sku || typeof quantity === 'undefined' || typeof reorderLevel === 'undefined') {
            return res.status(400).json({ message: 'Item name, SKU, quantity and reorder level are required.' });
        }

        if (supplier) {
            const supplierExists = await Vendor.findById(supplier);
            if (!supplierExists) {
                return res.status(400).json({ message: 'Selected supplier does not exist.' });
            }
        }

        const item = await InventoryItem.create({
            itemName: itemName.trim(),
            sku: sku.trim(),
            category: category?.trim() || 'General',
            quantity: Number(quantity),
            reorderLevel: Number(reorderLevel),
            location: location?.trim() || '',
            supplier: supplier || null,
            status: status || 'In Stock',
            description: description?.trim() || '',
        });

        res.status(201).json({ message: 'Inventory item created successfully', item });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.sku) {
            return res.status(400).json({ message: 'SKU already exists.' });
        }
        res.status(500).json({ message: error.message || 'Failed to create inventory item' });
    }
};

export const updateInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const {
            itemName,
            sku,
            category,
            quantity,
            reorderLevel,
            location,
            supplier,
            status,
            description,
        } = req.body;

        if (supplier) {
            const supplierExists = await Vendor.findById(supplier);
            if (!supplierExists) {
                return res.status(400).json({ message: 'Selected supplier does not exist.' });
            }
        }

        item.itemName = itemName?.trim() ?? item.itemName;
        item.sku = sku?.trim() ?? item.sku;
        item.category = category?.trim() ?? item.category;
        item.quantity = typeof quantity !== 'undefined' ? Number(quantity) : item.quantity;
        item.reorderLevel = typeof reorderLevel !== 'undefined' ? Number(reorderLevel) : item.reorderLevel;
        item.location = location?.trim() ?? item.location;
        item.supplier = supplier || null;
        item.status = status ?? item.status;
        item.description = description?.trim() ?? item.description;

        const updatedItem = await item.save();
        const populatedItem = await updatedItem.populate('supplier', 'name');

        res.json({ message: 'Inventory item updated successfully', item: populatedItem });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.sku) {
            return res.status(400).json({ message: 'SKU already exists.' });
        }
        res.status(500).json({ message: error.message || 'Failed to update inventory item' });
    }
};

export const deleteInventoryItem = async (req, res) => {
    try {
        const deleted = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete inventory item' });
    }
};
