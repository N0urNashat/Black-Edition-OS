import { Router } from 'express';
import { getInvoices, getInvoiceById, createInvoice } from '../controllers/invoices.controller';

const router = Router();

// Invoice routes
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);

export default router;
