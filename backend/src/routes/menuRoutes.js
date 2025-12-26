import express from 'express';
import { getAllMenuItems, createMenuItem } from '../controllers/menuController.js';


const router = express.Router();

// Route to get all menu items
router.get('/', getAllMenuItems);
router.post('/', createMenuItem);

export default router;











