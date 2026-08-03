import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import {
  RolesApi,
  UsersApi,
  type AppUser,
  type Permission,
  type Role,
} from "@/pages/users/api/users.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useAppUsers(businessId?: string) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await UsersApi.list(businessId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { users, loading, error, refetch };
}

export function useRoles(businessId?: string) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRoles(await RolesApi.list(businessId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { roles, loading, error, refetch };
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void RolesApi.permissions()
      .then(setPermissions)
      .finally(() => setLoading(false));
  }, []);

  return { permissions, loading };
}
