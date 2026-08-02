import { useState } from "react";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { useTopCustomers } from "@/pages/reports/hooks/reports.hook";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import type { TopCustomerRow } from "@/pages/reports/api/reports.api";

export function TopCustomersTab() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { rows, loading } = useTopCustomers({ from: from || undefined, to: to || undefined });
  const { customers } = useCustomers();

  const columns: TableColumn<TopCustomerRow>[] = [
    { key: "customer", header: "Cliente", render: (r) => customers.find((c) => c.id === r.customerId)?.name ?? r.customerId },
    { key: "orders", header: "Pedidos", render: (r) => r.orderCount },
    { key: "total", header: "Total comprado", render: (r) => r.totalSpent },
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 max-w-md">
        <Field label="Desde">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="Hasta">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>
      <Table columns={columns} rows={rows} rowKey={(r) => r.customerId} loading={loading} emptyMessage="Sin ventas con cliente asociado en el rango elegido." />
    </div>
  );
}

export default TopCustomersTab;
