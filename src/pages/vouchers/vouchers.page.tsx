import { useState } from "react";
import { Wallet, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { VouchersApi, type Voucher, type VoucherStatus } from "@/pages/vouchers/api/vouchers.api";
import { useVouchers } from "@/pages/vouchers/hooks/vouchers.hook";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";

const STATUS_LABELS: Record<VoucherStatus, string> = {
  active: "Activo",
  redeemed: "Redimido",
  expired: "Vencido",
};

const VouchersPage = () => {
  const { vouchers, loading, refetch } = useVouchers();
  const { customers } = useCustomers();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  const [redeemVoucher, setRedeemVoucher] = useState<Voucher | null>(null);
  const [redeemAmount, setRedeemAmount] = useState("0");
  const [redeeming, setRedeeming] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [searching, setSearching] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await VouchersApi.create({
        customerId: customerId || undefined,
        amount: Number(amount),
        reason: reason || undefined,
        expiresAt: expiresAt || undefined,
      });
      notifySuccess("Vale creado");
      setOpen(false);
      setCustomerId("");
      setAmount("0");
      setReason("");
      setExpiresAt("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear el vale");
    } finally {
      setSaving(false);
    }
  }

  async function onRedeem() {
    if (!redeemVoucher) return;
    setRedeeming(true);
    try {
      await VouchersApi.redeem(redeemVoucher.id, Number(redeemAmount));
      notifySuccess("Vale redimido");
      setRedeemVoucher(null);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo redimir el vale");
    } finally {
      setRedeeming(false);
    }
  }

  async function onSearchByCode() {
    if (!searchCode.trim()) return;
    setSearching(true);
    try {
      const voucher = await VouchersApi.findByCode(searchCode.trim());
      setRedeemVoucher(voucher);
      setRedeemAmount(String(voucher.balance));
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se encontró ningún vale con ese código");
    } finally {
      setSearching(false);
    }
  }

  const columns: TableColumn<Voucher>[] = [
    { key: "code", header: "Código", render: (v) => v.code },
    { key: "customer", header: "Cliente", render: (v) => customers.find((c) => c.id === v.customerId)?.name ?? "—" },
    { key: "amount", header: "Monto original", render: (v) => v.amount },
    { key: "balance", header: "Saldo", render: (v) => v.balance },
    { key: "status", header: "Estado", render: (v) => STATUS_LABELS[v.status] },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (v) =>
        v.status === "active" ? (
          <button
            type="button"
            onClick={() => {
              setRedeemVoucher(v);
              setRedeemAmount(String(v.balance));
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-container"
          >
            Redimir
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Vales" description="Vales/créditos a favor de clientes" icon={Wallet} />
      <Card>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Input
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSearchByCode();
              }}
              placeholder="Buscar por código..."
              className="w-64"
            />
            <Button variant="secondary" onClick={() => void onSearchByCode()} loading={searching}>
              <Search size={15} />
            </Button>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nuevo vale
          </Button>
        </div>

        {!loading && vouchers.length === 0 ? (
          <EmptyState icon={Wallet} title="Sin vales" description="Crea vales para devoluciones o promociones." />
        ) : (
          <Table columns={columns} rows={vouchers} rowKey={(v) => v.id} loading={loading} />
        )}
      </Card>

      <Modal
        open={open}
        title="Nuevo vale"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={Number(amount) <= 0}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Cliente (opcional)">
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Sin cliente"
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
          <Field label="Monto">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Motivo (opcional)">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <Field label="Vencimiento (opcional)">
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </Field>
        </div>
      </Modal>

      {redeemVoucher && (
        <Modal
          open
          title={`Redimir vale ${redeemVoucher.code}`}
          onClose={() => setRedeemVoucher(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRedeemVoucher(null)}>
                Cancelar
              </Button>
              <Button onClick={() => void onRedeem()} loading={redeeming}>
                Confirmar
              </Button>
            </>
          }
        >
          <p className="mb-4 text-sm text-secondary">Saldo disponible: {redeemVoucher.balance}</p>
          <Field label="Monto a redimir">
            <Input type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  );
};

export default VouchersPage;
