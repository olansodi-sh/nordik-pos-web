import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const UsersPage = () => {
  return (
    <div>
      <PageHeader title="Usuarios" description="Administración de usuarios" icon={Users} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default UsersPage;
