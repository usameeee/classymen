import { Router } from 'express';
import { listQuerySchema } from '@shared/schemas/common.schema';
import {
  productInputSchema,
  productQuerySchema,
  productUpdateSchema,
} from '@shared/schemas/product.schema';
import { hasAdminRole, optionalAuth, requireAuth, requireRole } from '../middleware/auth';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '../services/product.service';
import { routeParam } from '../utils/http';
import { parseOrThrow } from '../utils/validation';

export const productRouter = Router();

/** Public list (`?category=`, `?featured=`, `?page=`, `?limit=`); admins may add `?includeInactive=true`. */
productRouter.get('/', optionalAuth, async (req, res) => {
  const query = parseOrThrow(productQuerySchema, req.query);
  const { includeInactive } = parseOrThrow(listQuerySchema, req.query);
  const result = await listProducts(query, Boolean(includeInactive) && hasAdminRole(req.auth));
  res.json(result);
});

productRouter.get('/:idOrSlug', async (req, res) => {
  res.json({ product: await getProduct(routeParam(req.params.idOrSlug)) });
});

productRouter.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const input = parseOrThrow(productInputSchema, req.body);
  res.status(201).json({ product: await createProduct(input) });
});

productRouter.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const input = parseOrThrow(productUpdateSchema, req.body);
  res.json({ product: await updateProduct(routeParam(req.params.id), input) });
});

productRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await deleteProduct(routeParam(req.params.id));
  res.status(204).end();
});
