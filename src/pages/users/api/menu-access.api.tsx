import { httpClient } from "@/services/http/httpClient";

export type MenuAccessEffect = "allow" | "deny";

export interface MenuItem {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  path: string | null;
  parentId: string | null;
  sortOrder: number;
  superAdminOnly: boolean;
  active: boolean;
}

export interface MenuAccessRule {
  id: string;
  membershipId: string;
  menuItemId: string;
  effect: MenuAccessEffect;
}

export class MenuAccessApi {
  static async items(): Promise<MenuItem[]> {
    const { data } = await httpClient.get<MenuItem[]>("/menu/items");
    return data;
  }

  static async rulesForUser(userId: string): Promise<MenuAccessRule[]> {
    const { data } = await httpClient.get<MenuAccessRule[]>(`/menu/rules/by-user/${userId}`);
    return data;
  }

  static async setRuleForUser(
    userId: string,
    menuItemId: string,
    effect: MenuAccessEffect | null,
  ): Promise<void> {
    await httpClient.put(`/menu/rules/by-user/${userId}/${menuItemId}`, { effect });
  }
}
