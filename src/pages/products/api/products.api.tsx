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

export type AttributeType = "text" | "number" | "boolean" | "select";

export interface AttributeDefinition {
  id: string;
  name: string;
  type: AttributeType;
  unit: string | null;
  isVariant: boolean;
  options: string[] | null;
}

export interface CreateAttributeDefinitionPayload {
  name: string;
  type: AttributeType;
  unit?: string;
  isVariant?: boolean;
  options?: string[];
}

export interface CategoryAttribute {
  categoryId: string;
  attributeDefinitionId: string;
  required: boolean;
  active: boolean;
  attributeDefinition: AttributeDefinition;
}

export interface AttributeValueInput {
  attributeDefinitionId: string;
  value: string;
}

export interface ProductAttributeValue {
  productId: string;
  attributeDefinitionId: string;
  value: string;
  attributeDefinition: AttributeDefinition;
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
  attributes?: AttributeValueInput[];
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
  attributes?: AttributeValueInput[];
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

export class AttributeDefinitionsApi {
  static async list(): Promise<AttributeDefinition[]> {
    const { data } = await httpClient.get<AttributeDefinition[]>("/attribute-definitions");
    return data;
  }

  static async create(payload: CreateAttributeDefinitionPayload): Promise<AttributeDefinition> {
    const { data } = await httpClient.post<AttributeDefinition>("/attribute-definitions", payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/attribute-definitions/${id}`);
  }
}

export class CategoryAttributesApi {
  static async list(categoryId: string): Promise<CategoryAttribute[]> {
    const { data } = await httpClient.get<CategoryAttribute[]>(
      `/categories/${categoryId}/attributes`,
    );
    return data;
  }

  static async assign(
    categoryId: string,
    attributeDefinitionId: string,
    required?: boolean,
  ): Promise<CategoryAttribute> {
    const { data } = await httpClient.post<CategoryAttribute>(
      `/categories/${categoryId}/attributes`,
      { attributeDefinitionId, required },
    );
    return data;
  }

  static async unassign(categoryId: string, attributeDefinitionId: string): Promise<void> {
    await httpClient.delete(`/categories/${categoryId}/attributes/${attributeDefinitionId}`);
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

  static async attributeValues(id: string): Promise<ProductAttributeValue[]> {
    const { data } = await httpClient.get<ProductAttributeValue[]>(`/products/${id}/attributes`);
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
