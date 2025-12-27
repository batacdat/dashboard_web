import MenuItem from '../models/MenuItem.js';

// Get all menu items
export const getAllMenuItems = async (req, res) => {
    try {
        const menu = await MenuItem.find({});
        res.json(menu);

    } catch (error) {
        res.status(500).json({ message: 'Error retrieving menu items', error: error.message });
    }

};
// them mon moi
export const createMenuItem = async (req, res) => {
    try {
        const { name,price, category,image, description } = req.body;
        if(!name || !price || !category || !description){
            return res.status(400).json({ message: 'Vui lòng điền đủ thông tin' });
        }
        const newItem = new MenuItem({ name, price, category, image, description });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    }

catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error: error.message });
    }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
      const updateMenuItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateMenuItem);
    }
    catch(error) {
        res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }
};

// delete mon an
export const deleteMenuItem = async (req, res) => {
    try {
       const { id } = req.params;
         await MenuItem.findByIdAndDelete(id); 
        res.json({ message: 'Đã xóa thành công' });
    } catch (error) {
         res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
};