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

        // làm socket
        const io = req.app.get('io');
        if(io) {
            io.emit('MENU_UPDATE', {type:'CREATE', item: savedItem});
        }

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
                // làm socket
        const io = req.app.get('io');
        if(io) {
            io.emit('MENU_UPDATE', {type:'UPDATE', item: updateMenuItem});
        }
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
                 // làm socket
        const io = req.app.get('io');
        if(io) {
            io.emit('MENU_UPDATE', {type:'DELETE', id: id});
        }
        res.json({ message: 'Đã xóa thành công' });
    } catch (error) {
         res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
};

export const toggleMenuItemAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({ message: "Món ăn không tồn tại"});
        }
        //dao nguoc trang thai true->false hoac false->true
        menuItem.is_available = !menuItem.is_available;
        const updatedMenuItem = await menuItem.save();

        // làm socket
        const io = req.app.get('io');
        if(io) {
            io.emit('MENU_UPDATE', {type:'UPDATE', item: updatedMenuItem});
        }

        res.json(updatedMenuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling menu item availability', error: error.message });
    }
}; 