import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PackagePlus, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ConfirmTxDialog } from "@/components/ConfirmTxDialog";
import { useBlockchain } from "@/lib/blockchain-context";
import { useTx } from "@/lib/use-tx";
import { getReadContract, friendlyError } from "@/lib/blockchain";

export const Route = createFileRoute("/add-product")({
  head: () => ({
    meta: [
      { title: "Add Product · ChainTrack" },
      { name: "description", content: "Register a new product on the Ethereum blockchain with ChainTrack." },
      { property: "og:title", content: "Add Product · ChainTrack" },
      { property: "og:description", content: "Register products on-chain." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AddProduct,
});

const empty = { id: "", name: "", manufacturer: "", category: "", manufacturingDate: "", description: "" };
const categories = ["Electronics", "Food & Beverage", "Pharmaceuticals", "Apparel", "Automotive", "Other"];
type Form = typeof empty;

function AddProduct() {
  const { account, isOwner, connect } = useBlockchain();
  const { send, pending } = useTx();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [confirm, setConfirm] = useState(false);
  const [checking, setChecking] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e: Partial<Form> = {};
    if (!form.id.trim()) e.id = "Product ID is required";
    else if (!/^[A-Za-z0-9-_]{2,32}$/.test(form.id.trim())) e.id = "2–32 letters, numbers, - or _";
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.manufacturer.trim()) e.manufacturer = "Manufacturer is required";
    if (!form.category) e.category = "Choose a category";
    if (!form.manufacturingDate) e.manufacturingDate = "Pick a date";
    else if (new Date(form.manufacturingDate) > new Date()) e.manufacturingDate = "Date can't be in the future";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setChecking(true);
    try {
      // Check duplicates on-chain before asking MetaMask to sign.
      if (await getReadContract().productExists(form.id.trim())) {
        setErrors({ id: "This product ID is already registered" });
        return;
      }
      setConfirm(true);
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setChecking(false);
    }
  }

  async function register() {
    const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as Form;
    const ok = await send("Register product", (c) =>
      c.registerProduct(f.id, f.name, f.manufacturer, f.category, f.manufacturingDate, f.description));
    if (ok) {
      setForm(empty);
      navigate({ to: "/products" });
    }
  }

  const blocked = !account || !isOwner;

  return (
    <AppShell title="Add Product" subtitle="Register a product on the blockchain (owner only)">
      {blocked && (
        <div className="card flex flex-wrap items-center gap-3 p-4 text-sm">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">{!account ? "Connect the contract owner wallet to register products." : "This wallet isn't the contract owner. Switch to the deployer account in MetaMask."}</span>
          {!account && <button onClick={connect} className="btn btn-primary">Connect Wallet</button>}
        </div>
      )}
      <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:grid-cols-2" noValidate>
        <Field label="Product ID" error={errors.id}><input className="field font-mono" placeholder="e.g. PRD-1001" value={form.id} onChange={set("id")} /></Field>
        <Field label="Product Name" error={errors.name}><input className="field" placeholder="Organic Coffee Beans" value={form.name} onChange={set("name")} /></Field>
        <Field label="Manufacturer" error={errors.manufacturer}><input className="field" placeholder="Acme Farms Ltd." value={form.manufacturer} onChange={set("manufacturer")} /></Field>
        <Field label="Category" error={errors.category}>
          <select className="field" value={form.category} onChange={set("category")}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Manufacturing Date" error={errors.manufacturingDate}><input type="date" className="field" value={form.manufacturingDate} onChange={set("manufacturingDate")} /></Field>
        <div className="sm:col-span-2">
          <Field label="Description" error={errors.description}><textarea rows={4} className="field" placeholder="Short product description" value={form.description} onChange={set("description")} /></Field>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn btn-outline" onClick={() => { setForm(empty); setErrors({}); }}>Reset</button>
          <button type="submit" disabled={blocked || pending || checking} className="btn btn-primary">
            {pending || checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
            {pending ? "Processing…" : "Register Product"}
          </button>
        </div>
      </form>
      <ConfirmTxDialog open={confirm} onOpenChange={setConfirm} title="Register product on-chain?" onConfirm={register}
        description={<>Product <b className="font-mono">{form.id}</b> — {form.name} by {form.manufacturer} will be permanently stored on the blockchain.</>} />
    </AppShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
