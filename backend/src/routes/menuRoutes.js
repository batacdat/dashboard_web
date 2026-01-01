import express from 'express';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability } from '../controllers/menuController.js';


const router = express.Router();

// Route to get all menu items
router.get('/', getAllMenuItems);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

router.patch('/:id/toggle', toggleMenuItemAvailability);
export default router;











