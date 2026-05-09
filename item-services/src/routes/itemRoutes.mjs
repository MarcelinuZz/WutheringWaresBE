import { Router } from 'express';
import { getItems, addItem, updateItem, deleteItem } from '../controllers/itemController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';
import adminMiddleware from '../middleware/adminMiddleware.mjs';
import upload from '../middleware/multerConfig.mjs';
import validate from '../middleware/validate.mjs';
import { addItemValidator, updateItemValidator } from '../validators/itemValidators.mjs';

const router = Router();

router.get('/', getItems);

router.post('/', authMiddleware, adminMiddleware, upload.single('image'), addItemValidator, validate, addItem);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateItemValidator, validate, updateItem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteItem);

export default router;
