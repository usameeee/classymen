import { isValidObjectId, type Types } from 'mongoose';
import type {
  ProductInput,
  ProductQuery,
  ProductUpdateInput,
} from '@shared/schemas/product.schema';
import { CategoryModel } from '../models/Category';
import { ProductModel } from '../models/Product';
import { ApiError } from '../utils/http';
import { ensureUniqueSlug } from '../utils/slug';

const CATEGORY_POPULATE = 'slug name displayStyle';

/** Only the fields the list endpoint filters on. */
interface ProductFilter {
  isActive?: boolean;
  isFeatured?: boolean;
  category?: Types.ObjectId | { $in: Types.ObjectId[] };
}

/** Resolves a category id or slug to its single ObjectId. */
async function resolveCategoryId(idOrSlug: string): Promise<Types.ObjectId> {
  const category = isValidObjectId(idOrSlug)
    ? await CategoryModel.findById(idOrSlug).select('_id')
    : await CategoryModel.findOne({ slug: idOrSlug }).select('_id');

  if (!category) {
    throw new ApiError(400, 'Unknown category.');
  }
  return category._id as Types.ObjectId;
}

/** Resolves a category id or slug to its id and includes all descendant subcategory IDs. */
async function resolveCategoryAndDescendantIds(idOrSlug: string): Promise<Types.ObjectId[]> {
  const primaryId = await resolveCategoryId(idOrSlug);
  const subCategories = await CategoryModel.find({ parent: primaryId }).select('_id');
  return [primaryId, ...subCategories.map((c) => c._id as Types.ObjectId)];
}

export async function listProducts(query: ProductQuery, includeInactive = false) {
  const filter: ProductFilter = {};
  if (!includeInactive) {
    filter.isActive = true;
  }
  if (query.featured !== undefined) {
    filter.isFeatured = query.featured;
  }
  if (query.category) {
    if (query.direct) {
      const primaryId = await resolveCategoryId(query.category);
      filter.category = primaryId;
    } else {
      const categoryIds = await resolveCategoryAndDescendantIds(query.category);
      filter.category = categoryIds.length === 1 ? categoryIds[0] : { $in: categoryIds };
    }
  }

  const [total, items] = await Promise.all([
    ProductModel.countDocuments(filter),
    ProductModel.find(filter)
      .populate('category', CATEGORY_POPULATE)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(total / query.limit),
  };
}

export async function getProduct(idOrSlug: string) {
  const query = isValidObjectId(idOrSlug)
    ? ProductModel.findById(idOrSlug)
    : ProductModel.findOne({ slug: idOrSlug });

  const product = await query.populate('category', CATEGORY_POPULATE);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  return product;
}

export async function createProduct(input: ProductInput) {
  const category = await resolveCategoryId(input.category);
  const slug = await ensureUniqueSlug(ProductModel, input.slug ?? input.name.ar);
  const product = await ProductModel.create({ ...input, slug, category });
  return product.populate('category', CATEGORY_POPULATE);
}

export async function updateProduct(id: string, input: ProductUpdateInput) {
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const { slug, category, ...rest } = input;
  product.set(rest);
  if (category) {
    product.category = await resolveCategoryId(category);
  }
  if (slug) {
    product.slug = await ensureUniqueSlug(ProductModel, slug, id);
  }

  await product.save();
  return product.populate('category', CATEGORY_POPULATE);
}

export async function deleteProduct(id: string) {
  const deleted = await ProductModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Product not found.');
  }
}
