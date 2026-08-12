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
  barcode?: string;
  customFields?: Record<string, unknown>;
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "barcode">>;

export interface Barcode {
  id: string;
  code: string;
  productId: string | null;
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

  static async lookupBarcode(code: string): Promise<Barcode & { product: Product | null }> {
    const { data } = await httpClient.get<Barcode & { product: Product | null }>(
      `/products/barcode-lookup/${encodeURIComponent(code)}`,
    );
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
