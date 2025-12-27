import express from 'express';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';


const router = express.Router();

// Route to get all menu items
router.get('/', getAllMenuItems);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);
export default router;











