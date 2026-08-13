import { useState } from "react";
import { Plus, Trash2, Tags } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { PriceListsApi, type PriceList } from "@/pages/pricelist/api/pricelist.api";
import { usePriceListItems, usePriceLists } from "@/pages/pricelist/hooks/pricelist.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

export function PriceListsTab() {
  const { priceLists, loading, refetch } = usePriceLists();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedListId, setSelectedListId] = useState("");
  const { items, loading: itemsLoading, refetch: refetchItems } = usePriceListItems(
    selectedListId || null,
  );
  const [itemProductId, setItemProductId] = useState("");
  const [itemPrice, setItemPrice] = useState("0");
  const [settingPrice, setSettingPrice] = useState(false);

  const stockableProducts = products;

  async function onCreate() {
    setSaving(true);
    try {
      await PriceListsApi.create({ name });
      notifySuccess("Lista de precios creada");
      setOpen(false);
      setName("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la lista de precios");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await PriceListsApi.remove(id);
      notifySuccess("Lista de precios eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la lista de precios");
    }
  }

  async function onSetPrice() {
    if (!selectedListId || !itemProductId) return;
    setSettingPrice(true);
    try {
      await PriceListsApi.setItem(selectedListId, {
        productId: itemProductId,
        price: Number(itemPrice),
      });
      notifySuccess("Precio guardado");
      setItemProductId("");
      setItemPrice("0");
      await refetchItems();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo guardar el precio");
    } finally {
      setSettingPrice(false);
    }
  }

  const columns: TableColumn<PriceList>[] = [
    { key: "name", header: "Nombre", render: (l) => l.name },
    { key: "isDefault", header: "Por defecto", render: (l) => (l.isDefault ? "Sí" : "No") },
    { key: "active", header: "Estado", render: (l) => (l.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (l) => (
        <button
          type="button"
          onClick={() => void onDelete(l.id)}
          className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nueva lista de precios
          </Button>
        </div>

        {!loading && priceLists.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="Sin listas de precios"
            description="Al crear el negocio ya debería existir una lista por defecto."
          />
        ) : (
          <Table columns={columns} rows={priceLists} rowKey={(l) => l.id} loading={loading} />
        )}
      </div>

      <div className="rounded-xl border border-outline p-6">
        <h3 className="mb-4 text-sm font-semibold text-on-surface">Precios por producto</h3>
        <div className="mb-4 max-w-xs">
          <Field label="Lista de precios">
            <Select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              placeholder="Selecciona una lista"
              options={priceLists.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Field>
        </div>

        {selectedListId && (
          <>
            <Table
              columns={[
                {
                  key: "product",
                  header: "Producto",
                  render: (i) => products.find((p) => p.id === i.productId)?.name ?? i.productId,
                },
                { key: "price", header: "Precio", render: (i) => i.price },
              ]}
              rows={items}
              rowKey={(i) => i.id}
              loading={itemsLoading}
              emptyMessage="Sin precios definidos en esta lista."
            />

            <div className="mt-4 grid grid-cols-3 gap-4">
              <Field label="Producto">
                <Select
                  value={itemProductId}
                  onChange={(e) => setItemProductId(e.target.value)}
                  placeholder="Selecciona un producto"
                  options={stockableProducts.map((p) => ({ value: p.id, label: p.name }))}
                />
              </Field>
              <Field label="Precio">
                <Input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
              </Field>
              <div className="flex items-end">
                <Button onClick={() => void onSetPrice()} loading={settingPrice} disabled={!itemProductId}>
                  Guardar precio
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={open}
        title="Nueva lista de precios"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!name}>
              Guardar
            </Button>
          </>
        }
      >
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mayoristas, VIP..." />
        </Field>
      </Modal>
    </div>
  );
}

export default PriceListsTab;
