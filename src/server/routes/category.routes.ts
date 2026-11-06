import { Router } from 'express';
import { categoryInputSchema, categoryUpdateSchema } from '@shared/schemas/category.schema';
import { listQuerySchema } from '@shared/schemas/common.schema';
import { hasAdminRole, optionalAuth, requireAuth, requireRole } from '../middleware/auth';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from '../services/category.service';
import { routeParam } from '../utils/http';
import { parseOrThrow } from '../utils/validation';

export const categoryRouter = Router();

/** Public list; admins may add `?includeInactive=true`, optional `?parent=<id|slug|root>`. */
categoryRouter.get('/', optionalAuth, async (req, res) => {
  const { includeInactive } = parseOrThrow(listQuerySchema, req.query);
  const parent = typeof req.query.parent === 'string' ? req.query.parent : undefined;
  const items = await listCategories({
    includeInactive: Boolean(includeInactive) && hasAdminRole(req.auth),
    parent,
  });
  res.json({ items });
});

categoryRouter.get('/:idOrSlug', async (req, res) => {
  res.json({ category: await getCategory(routeParam(req.params.idOrSlug)) });
});

categoryRouter.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const input = parseOrThrow(categoryInputSchema, req.body);
  res.status(201).json({ category: await createCategory(input) });
});

categoryRouter.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const input = parseOrThrow(categoryUpdateSchema, req.body);
  res.json({ category: await updateCategory(routeParam(req.params.id), input) });
});

categoryRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await deleteCategory(routeParam(req.params.id));
  res.status(204).end();
});
