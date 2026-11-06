import { isValidObjectId } from 'mongoose';
import type { CategoryInput, CategoryUpdateInput } from '@shared/schemas/category.schema';
import { CategoryModel } from '../models/Category';
import { ProductModel } from '../models/Product';
import { ApiError } from '../utils/http';
import { ensureUniqueSlug } from '../utils/slug';

const CATEGORY_PARENT_POPULATE = 'slug name';

export interface ListCategoriesFilter {
  includeInactive?: boolean;
  parent?: string | null;
}

export async function listCategories(filter: ListCategoriesFilter | boolean = false) {
  const includeInactive = typeof filter === 'boolean' ? filter : Boolean(filter.includeInactive);
  const query: Record<string, unknown> = includeInactive ? {} : { isActive: true };

  if (typeof filter === 'object' && filter.parent !== undefined) {
    if (filter.parent === null || filter.parent === 'null' || filter.parent === 'root') {
      query.parent = null;
    } else if (isValidObjectId(filter.parent)) {
      query.parent = filter.parent;
    } else {
      const parentCat = await CategoryModel.findOne({ slug: filter.parent }).select('_id');
      query.parent = parentCat ? parentCat._id : null;
    }
  }

  return CategoryModel.find(query)
    .populate('parent', CATEGORY_PARENT_POPULATE)
    .sort({ order: 1, createdAt: 1 })
    .lean();
}

function findCategory(idOrSlug: string) {
  const query = isValidObjectId(idOrSlug)
    ? CategoryModel.findById(idOrSlug)
    : CategoryModel.findOne({ slug: idOrSlug });
  return query.populate('parent', CATEGORY_PARENT_POPULATE);
}

export async function getCategory(idOrSlug: string) {
  const category = await findCategory(idOrSlug);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  return category;
}

async function wouldCreateCycle(categoryId: string, candidateParentId: string): Promise<boolean> {
  let currentId: string | null = candidateParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) {
      return true;
    }
    if (visited.has(currentId)) {
      return true;
    }
    visited.add(currentId);
    const parentCat: { parent?: unknown } | null = await CategoryModel.findById(currentId)
      .select('parent')
      .lean();
    currentId = parentCat?.parent ? String(parentCat.parent) : null;
  }
  return false;
}

export async function createCategory(input: CategoryInput) {
  const { parentId, slug: inputSlug, ...rest } = input;
  let parent = null;

  if (parentId) {
    if (!isValidObjectId(parentId)) {
      throw new ApiError(400, 'Invalid parent category ID.');
    }
    const parentExists = await CategoryModel.exists({ _id: parentId });
    if (!parentExists) {
      throw new ApiError(404, 'Parent category not found.');
    }
    parent = parentId;
  }

  const slug = await ensureUniqueSlug(CategoryModel, inputSlug ?? input.name.ar);
  const created = await CategoryModel.create({ ...rest, parent, slug });
  return created.populate('parent', CATEGORY_PARENT_POPULATE);
}

export async function updateCategory(id: string, input: CategoryUpdateInput) {
  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  const { slug, parentId, ...rest } = input;
  category.set(rest);

  if (parentId !== undefined) {
    if (parentId === null || parentId === '') {
      category.parent = null;
    } else {
      if (!isValidObjectId(parentId)) {
        throw new ApiError(400, 'Invalid parent category ID.');
      }
      if (parentId === id) {
        throw new ApiError(400, 'A category cannot be its own parent.');
      }
      const parentCat = await CategoryModel.findById(parentId);
      if (!parentCat) {
        throw new ApiError(404, 'Parent category not found.');
      }
      if (await wouldCreateCycle(id, parentId)) {
        throw new ApiError(400, 'Cannot set parent: would create a circular category relationship.');
      }
      category.parent = parentCat._id;
    }
  }

  if (slug) {
    category.slug = await ensureUniqueSlug(CategoryModel, slug, id);
  }

  await category.save();
  return category.populate('parent', CATEGORY_PARENT_POPULATE);
}

export async function deleteCategory(id: string) {
  const childCount = await CategoryModel.countDocuments({ parent: id });
  if (childCount > 0) {
    throw new ApiError(
      409,
      `Category still has ${childCount} subcategory/ies. Move or delete them first.`,
    );
  }

  const productCount = await ProductModel.countDocuments({ category: id });
  if (productCount > 0) {
    throw new ApiError(
      409,
      `Category still has ${productCount} product(s). Move or delete them first.`,
    );
  }

  const deleted = await CategoryModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Category not found.');
  }
}
