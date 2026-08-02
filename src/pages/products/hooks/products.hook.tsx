import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import {
  AttributeDefinitionsApi,
  BrandsApi,
  CategoriesApi,
  CategoryAttributesApi,
  ProductsApi,
  ProductVariantsApi,
  type AttributeDefinition,
  type Brand,
  type Category,
  type CategoryAttribute,
  type Product,
  type ProductVariant,
} from "@/pages/products/api/products.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCategories(await CategoriesApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBrands(await BrandsApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { brands, loading, error, refetch };
}

export function useAttributeDefinitions() {
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAttributes(await AttributeDefinitionsApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { attributes, loading, error, refetch };
}

export function useCategoryAttributes(categoryId: string | null) {
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!categoryId) {
      setCategoryAttributes([]);
      return;
    }
    setLoading(true);
    try {
      setCategoryAttributes(await CategoryAttributesApi.list(categoryId));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { categoryAttributes, loading, refetch };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await ProductsApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}

export function useProductVariants(productId: string | null) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!productId) {
      setVariants([]);
      return;
    }
    setLoading(true);
    try {
      setVariants(await ProductVariantsApi.list(productId));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { variants, loading, refetch };
}
