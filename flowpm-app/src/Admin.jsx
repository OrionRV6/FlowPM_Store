import { useEffect, useState } from "react";
import { supabase, fromRow, CATEGORIES } from "./lib/supabase";

const TEAL = "#17B6A4";
const clp = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

const EMPTY = { id: null, brand: "Puma", name: "", group: "Hombre", price: "", oldPrice: "", sizes: "", tag: "", image: "", active: true };

const field = "h-11 w-full border border-neutral-300 px-3 focus:border-black focus:outline-none";
const label = "mb-1 block text-sm font-medium";

/* Reduce la foto a máx. 1200px y la convierte a WebP: la tienda carga rápido y el almacenamiento rinde más */
async function optimize(file, max = 1200) {
  const bmp = await createImageBitmap(file);
  const ratio = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * ratio);
  canvas.height = Math.round(bmp.height * ratio);
  canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob(res, "image/webp", 0.85));
}

const storagePath = (url) => (url?.includes("/productos/") ? url.split("/productos/")[1] : null);

/* ───────────── Inicio de sesión ───────────── */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Correo o contraseña incorrectos.");
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-black px-5">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-8">
        <h1 className="display mb-1 text-4xl">Panel de la tienda</h1>
        <p className="mb-6 text-sm text-neutral-500">Ingresa con tu correo y contraseña de administrador.</p>
        <label className={label} htmlFor="email">Correo</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mb-4`} autoComplete="username" />
        <label className={label} htmlFor="pass">Contraseña</label>
        <input id="pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${field} mb-4`} autoComplete="current-password" />
        {error && <p className="mb-3 text-sm text-red-600" role="alert">{error}</p>}
        <button disabled={busy} className="display w-full py-3 text-xl text-black disabled:opacity-50" style={{ background: TEAL }}>
          {busy ? "Ingresando..." : "Ingresar"}
        </button>
        <a href="#/" className="mt-4 block text-center text-sm text-neutral-500 underline">Volver a la tienda</a>
      </form>
    </div>
  );
}

/* ───────────── Formulario de producto ───────────── */
function ProductForm({ initial, onSaved, onCancel }) {
  const [f, setF] = useState(initial);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial.image || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const price = Number(f.price);
    const oldPrice = f.oldPrice === "" ? null : Number(f.oldPrice);
    const sizes = f.sizes.split(/[,\s]+/).filter(Boolean).map(Number);

    if (!f.name.trim()) return setError("Escribe el nombre del modelo.");
    if (!(price > 0)) return setError("Escribe un precio válido, solo números.");
    if (oldPrice !== null && !(oldPrice > price)) return setError("El precio anterior debe ser mayor al precio actual. Déjalo vacío si no hay oferta.");
    if (sizes.some((s) => !Number.isFinite(s) || s <= 0)) return setError("Revisa las tallas. Ejemplo: 38, 39, 40");
    if (!preview) return setError("Sube una foto de la zapatilla.");

    setBusy(true);
    try {
      let image_url = f.image;
      if (file) {
        const blob = await optimize(file);
        const path = `${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from("productos").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (upErr) throw upErr;
        image_url = supabase.storage.from("productos").getPublicUrl(path).data.publicUrl;
        const old = storagePath(f.image);
        if (old) await supabase.storage.from("productos").remove([old]);
      }
      const row = {
        brand: f.brand.trim() || "Puma",
        name: f.name.trim(),
        category: f.group,
        price,
        old_price: oldPrice,
        sizes,
        tag: f.tag.trim() || null,
        image_url,
        active: f.active,
      };
      const { error: dbErr } = f.id
        ? await supabase.from("products").update(row).eq("id", f.id)
        : await supabase.from("products").insert(row);
      if (dbErr) throw dbErr;
      onSaved(f.id ? "Cambios guardados." : "Zapatilla agregada al catálogo.");
    } catch (err) {
      setError("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.");
      console.error(err);
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-8">
      <form onSubmit={submit} className="mx-auto max-w-2xl bg-white p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display text-4xl">{f.id ? "Editar zapatilla" : "Nueva zapatilla"}</h2>
          <button type="button" onClick={onCancel} className="px-2 text-3xl leading-none" aria-label="Cerrar">×</button>
        </div>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div>
            <span className={label}>Foto</span>
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              {preview ? <img src={preview} alt="Vista previa" className="h-full w-full object-cover" /> : <span className="absolute inset-0 grid place-items-center px-3 text-center text-sm text-neutral-400">Sin foto todavía</span>}
            </div>
            <label className="mt-2 block cursor-pointer border border-black py-2 text-center text-sm font-medium hover:bg-black hover:text-white">
              {preview ? "Cambiar foto" : "Subir foto"}
              <input type="file" accept="image/*" onChange={pickFile} className="sr-only" />
            </label>
            <p className="mt-2 text-xs text-neutral-500">Mejor si es cuadrada, con fondo limpio y buena luz.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="name">Modelo</label>
              <input id="name" value={f.name} onChange={set("name")} placeholder="Ej: Kaia 2.0" className={field} />
            </div>
            <div>
              <label className={label} htmlFor="brand">Marca</label>
              <input id="brand" value={f.brand} onChange={set("brand")} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="cat">Categoría</label>
              <select id="cat" value={f.group} onChange={set("group")} className={`${field} bg-white`}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="price">Precio (CLP)</label>
              <input id="price" inputMode="numeric" value={f.price} onChange={set("price")} placeholder="41990" className={field} />
            </div>
            <div>
              <label className={label} htmlFor="old">Precio anterior (si está en oferta)</label>
              <input id="old" inputMode="numeric" value={f.oldPrice} onChange={set("oldPrice")} placeholder="Opcional" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="sizes">Tallas disponibles</label>
              <input id="sizes" value={f.sizes} onChange={set("sizes")} placeholder="35, 36, 37, 38" className={field} />
              <p className="mt-1 text-xs text-neutral-500">Sepáralas con coma. Si no queda ninguna, la zapatilla aparece como "Agotado".</p>
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="tag">Etiqueta (opcional)</label>
              <input id="tag" value={f.tag} onChange={set("tag")} placeholder="Nuevo, Clásico, Últimas unidades..." className={field} />
            </div>
            <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
              <input type="checkbox" checked={f.active} onChange={(e) => setF((s) => ({ ...s, active: e.target.checked }))} className="h-5 w-5 accent-[#17B6A4]" />
              <span className="text-sm">Visible en la tienda</span>
            </label>
          </div>
        </div>

        {error && <p className="mt-5 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-5 py-3 text-sm font-medium underline">Cancelar</button>
          <button disabled={busy} className="display px-8 py-3 text-xl text-black disabled:opacity-50" style={{ background: TEAL }}>
            {busy ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────────── Panel ───────────── */
export default function Admin() {
  const [session, setSession] = useState(undefined); // undefined = cargando
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error) setProducts(data.map(fromRow));
  };
  useEffect(() => { if (session) load(); }, [session]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(""), 3500); };

  const toggle = async (p) => {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    load();
  };
  const remove = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer. Si solo quieres ocultarla, usa "Ocultar".`)) return;
    await supabase.from("products").delete().eq("id", p.id);
    const path = storagePath(p.image);
    if (path) await supabase.storage.from("productos").remove([path]);
    flash("Zapatilla eliminada.");
    load();
  };

  const fonts = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,800;1,900&family=DM+Sans:wght@400;500;700&display=swap');
      .display { font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif; font-style: italic; font-weight: 900; text-transform: uppercase; }
      button, a[href], select, label[class*="cursor-pointer"] { cursor: pointer; }
      button:disabled { cursor: not-allowed; }
    `}</style>
  );

  if (!supabase) {
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {fonts}
        <p className="max-w-md">El panel todavía no está conectado a la base de datos. Falta configurar las variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.</p>
      </div>
    );
  }
  if (session === undefined) return <div className="min-h-screen bg-black" />;
  if (!session) return <div style={{ fontFamily: "'DM Sans', sans-serif" }}>{fonts}<Login /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {fonts}
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <span className="display text-2xl">Panel de la tienda</span>
          <div className="flex items-center gap-5 text-sm">
            <a href="#/" className="underline">Ver tienda</a>
            <button onClick={() => supabase.auth.signOut()} className="underline">Cerrar sesión</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="display text-5xl">Catálogo</h1>
            <p className="text-sm text-neutral-500">{products.length} {products.length === 1 ? "zapatilla" : "zapatillas"} en total</p>
          </div>
          <button onClick={() => setEditing(EMPTY)} className="display px-6 py-3 text-xl text-black" style={{ background: TEAL }}>
            + Agregar zapatilla
          </button>
        </div>

        {notice && <p className="mb-4 bg-black px-4 py-3 text-sm text-white" role="status">{notice}</p>}

        {products.length === 0 ? (
          <p className="border border-dashed border-neutral-300 py-16 text-center text-neutral-500">Aún no hay zapatillas. Agrega la primera con el botón de arriba.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
            {products.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden bg-neutral-100">
                  {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-semibold">{p.brand} {p.name}</p>
                  <p className="text-sm text-neutral-500">
                    {p.group} · {clp(p.price)}{p.oldPrice ? ` (antes ${clp(p.oldPrice)})` : ""} · {p.sizes.length ? `Tallas ${p.sizes.join(", ")}` : "Agotado"}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium ${p.active ? "bg-[#17B6A4]/20 text-[#0C8577]" : "bg-neutral-200 text-neutral-600"}`}>
                  {p.active ? "Visible" : "Oculta"}
                </span>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => setEditing({ ...p, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : "", sizes: p.sizes.join(", "), tag: p.tag || "" })} className="underline">Editar</button>
                  <button onClick={() => toggle(p)} className="underline">{p.active ? "Ocultar" : "Mostrar"}</button>
                  <button onClick={() => remove(p)} className="text-red-600 underline">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {editing && (
        <ProductForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); flash(msg); load(); }}
        />
      )}
    </div>
  );
}
