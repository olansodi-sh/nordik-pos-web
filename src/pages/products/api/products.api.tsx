import { httpClient } from "@/services/http/httpClient";

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: string;
}

export interface Brand {
  id: string;
  name: string;
  active: boolean;
}

export interface CreateBrandPayload {
  name: string;
  active?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  brandId: string | null;
  unit: string;
  tracksInventory: boolean;
  hasVariants: boolean;
  active: boolean;
  customFields: Record<string, unknown>;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  unit?: string;
  tracksInventory?: boolean;
  hasVariants?: boolean;
  barcode?: string;
  customFields?: Record<string, unknown>;
}

export type UpdateProductPayload = Partial<
  Omit<CreateProductPayload, "hasVariants" | "barcode">
>;

export interface ProductVariant {
  id: string;
  productId: string;
  cost: number;
  listPrice: number | null;
  discountPercent: number;
  active: boolean;
}

export interface CreateVariantPayload {
  cost?: number;
  listPrice?: number;
  discountPercent?: number;
  barcode?: string;
}

export interface Barcode {
  id: string;
  code: string;
  productId: string | null;
  variantId: string | null;
}

export class CategoriesApi {
  static async list(): Promise<Category[]> {
    const { data } = await httpClient.get<Category[]>("/categories");
    return data;
  }

  static async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await httpClient.post<Category>("/categories", payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/categories/${id}`);
  }
}

export class BrandsApi {
  static async list(): Promise<Brand[]> {
    const { data } = await httpClient.get<Brand[]>("/brands");
    return data;
  }

  static async create(payload: CreateBrandPayload): Promise<Brand> {
    const { data } = await httpClient.post<Brand>("/brands", payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/brands/${id}`);
  }
}

export class ProductsApi {
  static async list(): Promise<Product[]> {
    const { data } = await httpClient.get<Product[]>("/products");
    return data;
  }

  static async findOne(id: string): Promise<Product> {
    const { data } = await httpClient.get<Product>(`/products/${id}`);
    return data;
  }

  static async barcodes(id: string): Promise<Barcode[]> {
    const { data } = await httpClient.get<Barcode[]>(`/products/${id}/barcodes`);
    return data;
  }

  static async lookupBarcode(code: string): Promise<Barcode & { product: Product | null; variant: ProductVariant | null }> {
    const { data } = await httpClient.get<
      Barcode & { product: Product | null; variant: ProductVariant | null }
    >(`/products/barcode-lookup/${encodeURIComponent(code)}`);
    return data;
  }

  static async create(payload: CreateProductPayload): Promise<Product> {
    const { data } = await httpClient.post<Product>("/products", payload);
    return data;
  }

  static async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data } = await httpClient.patch<Product>(`/products/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/products/${id}`);
  }
}

export class ProductVariantsApi {
  static async list(productId: string): Promise<ProductVariant[]> {
    const { data } = await httpClient.get<ProductVariant[]>(`/products/${productId}/variants`);
    return data;
  }

  static async barcodes(productId: string, variantId: string): Promise<Barcode[]> {
    const { data } = await httpClient.get<Barcode[]>(
      `/products/${productId}/variants/${variantId}/barcodes`,
    );
    return data;
  }

  static async create(productId: string, payload: CreateVariantPayload): Promise<ProductVariant> {
    const { data } = await httpClient.post<ProductVariant>(
      `/products/${productId}/variants`,
      payload,
    );
    return data;
  }

  static async remove(productId: string, variantId: string): Promise<void> {
    await httpClient.delete(`/products/${productId}/variants/${variantId}`);
  }
}
