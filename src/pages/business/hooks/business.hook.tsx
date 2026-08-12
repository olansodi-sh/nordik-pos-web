import { useCallback, useEffect, useState } from "react";
import { BusinessApi, type Business } from "@/pages/business/api/business.api";
import {
  CustomFieldsApi,
  type CustomFieldDefinition,
  type CustomizableEntityType,
} from "@/pages/business/api/custom-fields.api";

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BusinessApi.list();
      setBusinesses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { businesses, loading, refetch };
}

export function useBusiness() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BusinessApi.me();
      setBusiness(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { business, loading, refetch };
}

export function useCustomFields(entityType: CustomizableEntityType) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setFields(await CustomFieldsApi.list(entityType));
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { fields, loading, refetch };
}
