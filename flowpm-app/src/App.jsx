import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion, MotionConfig } from "motion/react";
import { supabase, fromRow } from "./lib/supabase";

const Admin = lazy(() => import("./Admin"));

/* ───────────── Configuración de la tienda (edita aquí) ───────────── */
const STORE = {
  name: "Flow PM Store",
  instagram: "flowpm_store",
  whatsapp: "56982185015", // +56 9 8218 5015
};

const WA_DEFAULT_MESSAGE = `Hola ${STORE.name}, vi su tienda online y quiero consultar por zapatillas. ¿Qué modelos y tallas tienen disponibles?`;
const waUrl = (text) => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;

const BENEFITS = [
  { title: "Entrega en metro (Santiago)", text: "Coordinamos contigo una estación de metro y te entregamos en persona. Pago por transferencia o efectivo." },
  { title: "Envíos a regiones", text: "Despachamos con BlueExpress, Starken o Chilexpress a todo Chile. Pago por transferencia." },
  { title: "Cambio de talla", text: "Si no te calzan, lo coordinamos por mensaje." },
];

/* ───────────── Catálogo exclusivo Puma ───────────── */
const PRODUCTS = [
  { id: 1, brand: "Puma", name: "Kaia 2.0", group: "Niño", price: 41990, sizes: [35, 36, 37, 38], tag: "Clásico", image: "/img/kaia.jpg" },
  
];

/* ───────────── Colores sacados del logo ───────────── */
const TEAL = "#17B6A4";
const TEAL_DARK = "#0C8577";

const clp = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

/* ───────────── Piezas pequeñas ───────────── */
const Spark = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 0c.8 6.5 4.5 10.2 12 12-7.5 1.8-11.2 5.5-12 12-.8-6.5-4.5-10.2-12-12C7.5 10.2 11.2 6.5 12 0z" fill="currentColor" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l1 13H5L6 7z" />
    <path d="M9 7a3 3 0 016 0" />
  </svg>
);

const Logo = ({ className = "" }) => (
  <a href="#inicio" className={`flex items-center gap-2 ${className}`} aria-label={`${STORE.name}, inicio`}>
    <img src="/logo.png" alt="PM Store" className="h-20 w-auto md:h-24 object-contain" />
    <span className="display text-4xl leading-none text-white">PM</span>
    <span className="display rounded-full border-2 px-3 py-0.5 text-sm leading-tight text-white" style={{ borderColor: TEAL }}>
      STORE
    </span>
  </a>
);

/* ───────────── Tarjeta de producto ───────────── */
function ProductCard({ p, onAdd }) {
  const [size, setSize] = useState(null);
  const [warn, setWarn] = useState(false);
  const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : 0;
  const soldOut = !p.sizes?.length;

  const add = () => {
    if (!size) return setWarn(true);
    onAdd(p, size);
    setSize(null);
    setWarn(false);
  };

  return (
    <article className="flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#F4F4F4] to-[#DCDCDC]">
        {p.image ? (
          <img src={p.image} alt={`${p.brand} ${p.name}`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="display absolute inset-0 grid place-items-center text-[7rem] text-black/10" aria-hidden="true">PM</span>
        )}
        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-white/60">
            <span className="display bg-black px-5 py-1 text-xl text-white">Agotado</span>
          </div>
        )}
        {(discount > 0 || p.tag) && (
          <span
            className="display absolute left-0 top-3 px-3 py-1 text-sm text-white"
            style={{ background: discount > 0 ? "#000" : TEAL }}
          >
            {discount > 0 ? `-${discount}%` : p.tag}
          </span>
        )}
      </div>

      <div className="mt-3 flex-1">
        <p className="text-sm text-neutral-500">{p.brand}</p>
        <h3 className="font-semibold leading-snug">{p.name}</h3>
        <p className="mt-1">
          <span className="font-bold">{clp(p.price)}</span>
          {p.oldPrice && <span className="ml-2 text-sm text-neutral-400 line-through">{clp(p.oldPrice)}</span>}
        </p>
      </div>

      {soldOut ? (
        <a
          href={waUrl(`Hola ${STORE.name}, ¿van a reponer las ${p.brand} ${p.name}?`)}
          target="_blank"
          rel="noreferrer"
          className="display mt-3 block w-full border-2 border-black py-3 text-center text-lg hover:bg-black hover:text-white"
        >
          Consultar reposición
        </a>
      ) : (
        <>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={`Tallas de ${p.name}`}>
        {p.sizes.map((s) => (
          <button
            key={s}
            onClick={() => { setSize(s); setWarn(false); }}
            aria-pressed={size === s}
            className={`h-9 min-w-9 border px-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17B6A4] ${
              size === s ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <p className={`mt-1 h-5 text-sm ${warn ? "text-red-600" : "text-transparent"}`} role="status">
        Elige una talla para agregar
      </p>
      <button
        onClick={add}
        className="display w-full bg-black py-3 text-lg text-white transition-colors hover:bg-[#0C8577] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17B6A4]"
      >
        Agregar al carro
      </button>
        </>
      )}
    </article>
  );
}

/* ───────────── Carro (panel lateral) ───────────── */
function CartDrawer({ open, onClose, items, onRemove }) {
  const total = items.reduce((t, i) => t + i.price * i.qty, 0);
  const message = [
    `Hola ${STORE.name}, quiero comprar:`,
    ...items.map((i) => `• ${i.qty}x ${i.brand} ${i.name} (talla ${i.size}) - ${clp(i.price * i.qty)}`),
    `Total: ${clp(total)}`,
  ].join("\n");

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 cursor-pointer bg-black/60 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Carro de compras"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between bg-black px-5 py-4 text-white">
          <h2 className="display text-2xl">Tu carro</h2>
          <button onClick={onClose} className="px-2 text-2xl leading-none" aria-label="Cerrar carro">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-neutral-500">Tu carro está vacío. Elige una talla y agrega tu primer par.</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {items.map((i) => (
                <li key={i.key} className="flex items-start justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm text-neutral-500">{i.brand}</p>
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-sm">Talla {i.size} · {i.qty} {i.qty > 1 ? "unidades" : "unidad"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{clp(i.price * i.qty)}</p>
                    <button onClick={() => onRemove(i.key)} className="mt-1 text-sm text-neutral-500 underline hover:text-black">Quitar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-neutral-200 px-5 py-4">
          <div className="mb-3 flex justify-between text-lg font-bold"><span>Total</span><span>{clp(total)}</span></div>
          <a
            href={waUrl(items.length ? message : WA_DEFAULT_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            className="display block py-3 text-center text-xl text-white hover:brightness-110"
            style={{ background: TEAL }}
          >
            {items.length ? "Pedir por WhatsApp" : "Consultar por WhatsApp"}
          </a>
        </div>
      </aside>
    </>
  );
}

/* ───────────── Página ───────────── */
/* ───────────── Botón de categoría con animación ─────────────
   Entrada lenta y suave, salida más rápida, sin rebotes.
   Ajusta los tiempos aquí: IN = al poner el mouse, OUT = al sacarlo. */
const EASE = [0.4, 0, 0.2, 1];
const IN = { duration: 0.5, ease: EASE };
const OUT = { duration: 1.5, ease: EASE };
const GLOW_OUT = { duration: 0.1, ease: EASE };

function CategoryTile({ label, bg, tone, onClick }) {
  // tone = "r,g,b" del color del marco y del brillo
  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap="tap"
      variants={{
        rest: {
          y: 0,
          scale: 1,
          boxShadow: `0 0 0 2px rgba(${tone},0), 0 0 0 0 rgba(${tone},0)`,
          transition: { default: OUT, boxShadow: GLOW_OUT },
        },
        hover: {
          y: -5,
          scale: 1.04,
          boxShadow: `0 0 0 2px rgba(${tone},1), 0 18px 40px -10px rgba(${tone},0.6)`,
          transition: { default: IN, boxShadow: IN },
        },
        tap: { y: -2, scale: 0.98, transition: { duration: 0.15 } },
      }}
      className="display relative flex h-36 items-end overflow-hidden p-5 text-left text-3xl text-white hover:z-10 focus-visible:z-10 md:h-48 md:text-4xl"
      style={{ background: bg }}
    >
      {/* destello que cruza el botón */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/2"
        style={{ background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)" }}
        variants={{
          rest: { x: "-120%", opacity: 0, transition: { opacity: { duration: 0.2 }, x: { duration: 0 , delay: 0.2 } } },
          hover: { x: "340%", opacity: 1, transition: { duration: 1.3, ease: EASE } },
        }}
      />
      <motion.span className="relative z-10" variants={{ rest: { x: 0, transition: OUT }, hover: { x: 6, transition: IN } }}>
        {label}
      </motion.span>
      <motion.span
        className="absolute right-4 top-4 h-6 w-6 text-white/80 md:right-5 md:top-5 md:h-8 md:w-8"
        variants={{ rest: { rotate: 0, scale: 1, transition: OUT }, hover: { rotate: 90, scale: 1.15, transition: { duration: 0.9, ease: EASE } } }}
      >
        <Spark className="h-full w-full" />
      </motion.span>
      <motion.span
        className="display absolute -right-2 bottom-[-1.5rem] text-[7rem] leading-none text-white/10 md:text-[9rem]"
        aria-hidden="true"
        variants={{ rest: { x: 0, y: 0, scale: 1, transition: OUT }, hover: { x: -10, y: -8, scale: 1.08, transition: { duration: 1, ease: EASE } } }}
      >
        PM
      </motion.span>
    </motion.button>
  );
}

function Store() {
  const [products, setProducts] = useState(supabase ? [] : PRODUCTS);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [loadError, setLoadError] = useState(false);
  const [group, setGroup] = useState("Todos");
  const [onlySale, setOnlySale] = useState(false);
  const [sort, setSort] = useState("destacados");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setLoadError(true);
        else setProducts(data.map(fromRow));
        setLoading(false);
      });
  }, []);

  const visible = useMemo(() => {
    let list = products.filter(
      (p) =>
        (group === "Todos" || p.group === group) &&
        (!onlySale || p.oldPrice) &&
        `${p.brand} ${p.name}`.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (sort === "menor") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "mayor") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, group, onlySale, sort, query]);

  const addToCart = (p, size) => {
    const key = `${p.id}-${size}`;
    setCart((c) =>
      c.some((i) => i.key === key)
        ? c.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { key, brand: p.brand, name: p.name, price: p.price, size, qty: 1 }]
    );
    setCartOpen(true);
  };
  const removeFromCart = (key) => setCart((c) => c.filter((i) => i.key !== key));
  const count = cart.reduce((t, i) => t + i.qty, 0);

  const goTo = (g, sale = false) => {
    setGroup(g);
    setOnlySale(sale);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const chip = (active) =>
    `h-10 shrink-0 border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17B6A4] ${
      active ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"
    }`;

  return (
    <div id="inicio" className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,800;1,900&family=DM+Sans:wght@400;500;700&display=swap');
        .display { font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif; font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: .01em; }
        .outline-text { color: transparent; -webkit-text-stroke: 2px #fff; }
        html { scroll-behavior: smooth; }
        button, a[href], select, summary, [role="button"] { cursor: pointer; }
        button:disabled { cursor: not-allowed; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } * { transition: none !important; } }
      `}</style>

      {/* Barra superior */}
      <div className="display py-2 text-center text-sm text-black" style={{ background: TEAL }}>
        Envíos a todo Chile · Entrega en metro en Santiago · Pago por transferencia o efectivo
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
            {[
              ["Catálogo", () => goTo("Todos")],
              ["Hombre", () => goTo("Hombre")],
              ["Mujer", () => goTo("Mujer")],
              ["Niño", () => goTo("Niño")],
              ["Oferta", () => goTo("Todos", true)],
            ].map(([label, fn]) => (
              <button key={label} onClick={fn} className="display text-xl hover:text-[#17B6A4]">{label}</button>
            ))}
          </nav>
          <button onClick={() => setCartOpen(true)} className="relative p-2 hover:text-[#17B6A4]" aria-label={`Abrir carro, ${count} productos`}>
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-bold text-black" style={{ background: TEAL }}>
                {count}
              </span>
            )}
          </button>
        </div>
        <nav className="flex gap-6 overflow-x-auto border-t border-white/10 px-5 py-2 md:hidden" aria-label="Principal móvil">
          {[
            ["Catálogo", () => goTo("Todos")],
            ["Hombre", () => goTo("Hombre")],
            ["Mujer", () => goTo("Mujer")],
            ["Niño", () => goTo("Niño")],
            ["Oferta", () => goTo("Todos", true)],
          ].map(([label, fn]) => (
            <button key={label} onClick={fn} className="display shrink-0 text-lg">{label}</button>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute -right-24 top-10 h-72 w-72 rotate-12 opacity-90 md:h-[28rem] md:w-[28rem]" style={{ background: TEAL, borderRadius: "58% 42% 61% 39% / 44% 56% 44% 56%" }} aria-hidden="true" />
        <div className="absolute -bottom-16 left-1/3 h-40 w-80 -rotate-6 opacity-70" style={{ background: TEAL, borderRadius: "70% 30% 60% 40% / 50% 60% 40% 50%" }} aria-hidden="true" />
        {/* Marca de agua: el archivo logo-pm.png va en la carpeta /public */}
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          draggable="false"
          className="pointer-events-none absolute left-[57%] top-1/2 h-[135%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.10] md:h-[150%]"
        />
        <Spark className="absolute left-8 top-12 h-8 w-8 text-white" />
        <Spark className="absolute bottom-16 right-1/4 h-6 w-6 text-white" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-28">
          <h1 className="display text-[19vw] leading-[.82] md:text-[10.5rem]">
            Nuevos<br /><span className="outline-text">ingresos</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-neutral-200">
            Zapatillas Puma seleccionadas para Hombre, Mujer y Niño. Elige tu talla, arma tu carro y pídelo por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => goTo("Todos")} className="display px-8 py-3 text-xl text-black hover:brightness-110" style={{ background: TEAL }}>
              Ver catálogo
            </button>
            <a href={`https://www.instagram.com/${STORE.instagram}/`} target="_blank" rel="noreferrer" className="display border-2 border-white px-8 py-3 text-xl hover:bg-white hover:text-black">
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Accesos por categoría */}
      <MotionConfig reducedMotion="user">
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-10 md:grid-cols-4">
        {[
          ["Hombre", "Hombre", false],
          ["Mujer", "Mujer", false],
          ["Niño", "Niño", false],
          ["Oferta", "Todos", true],
        ].map(([label, g, sale], i) => (
          <CategoryTile
            key={label}
            label={label}
            onClick={() => goTo(g, sale)}
            tone={i === 3 ? "255,255,255" : "23,182,164"}
            bg={i === 3 ? TEAL_DARK : i === 2 ? "#1A1A1A" : i === 1 ? "#2B2B2B" : "#000"}
          />
        ))}
      </section>
      </MotionConfig>

      {/* Catálogo */}
      <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-5xl md:text-6xl">{onlySale ? "Oferta" : group === "Todos" ? "Catálogo" : group}</h2>
          {!loading && !loadError && <p className="text-neutral-500">{visible.length} {visible.length === 1 ? "modelo" : "modelos"}</p>}
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por modelo..."
              aria-label="Buscar zapatillas"
              className="h-10 flex-1 border border-neutral-300 px-4 text-sm focus:border-black focus:outline-none"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar por" className="h-10 border border-neutral-300 bg-white px-3 text-sm">
              <option value="destacados">Destacados</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por género">
            {["Todos", "Hombre", "Mujer", "Niño"].map((g) => (
              <button key={g} onClick={() => setGroup(g)} aria-pressed={group === g} className={chip(group === g)}>{g}</button>
            ))}
            <button onClick={() => setOnlySale((s) => !s)} aria-pressed={onlySale} className={chip(onlySale)}>Solo ofertas</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Cargando catálogo">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-neutral-200" />
                <div className="mt-3 h-4 w-2/3 bg-neutral-200" />
                <div className="mt-2 h-4 w-1/3 bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <p className="py-16 text-center text-neutral-500">No pudimos cargar el catálogo. Recarga la página o escríbenos por WhatsApp.</p>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">No encontramos zapatillas con esos filtros. Prueba borrando la búsqueda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
          </div>
        )}
      </section>

      {/* Beneficios */}
      <section className="bg-neutral-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-3">
              <Spark className="mt-1 h-5 w-5 shrink-0" style={{ color: TEAL }} />
              <div>
                <h3 className="display text-2xl">{b.title}</h3>
                <p className="text-neutral-600">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section className="relative overflow-hidden px-5 py-16 text-center text-black" style={{ background: TEAL }}>
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          draggable="false"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[190%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.05] md:h-[150%]"
        />
          <div className="relative">
          <h2 className="display text-5xl md:text-7xl">@{STORE.instagram}</h2>
          <p className="mx-auto mt-3 max-w-md">Mira los nuevos drops y el stock del día en nuestras historias.</p>
          <a href={`https://www.instagram.com/${STORE.instagram}/`} target="_blank" rel="noreferrer" className="display mt-6 inline-block bg-black px-8 py-3 text-xl text-white hover:bg-white hover:text-black">
          Seguir en Instagram
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-neutral-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <Logo />
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li><a href={waUrl(WA_DEFAULT_MESSAGE)} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a></li>
            <li><a href={`https://www.instagram.com/${STORE.instagram}/`} className="hover:text-white">Instagram</a></li>
            <li><button onClick={() => goTo("Todos")} className="hover:text-white">Catálogo</button></li>
          </ul>
          <p className="text-sm text-neutral-500">© {new Date().getFullYear()} {STORE.name}</p>
        </div>
      </footer>

      <a
        href={waUrl(WA_DEFAULT_MESSAGE)}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribirnos por WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full text-black shadow-lg transition-transform hover:scale-110"
        style={{ background: TEAL }}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 01-11.6 7.1L4 20l.9-5A8 8 0 1121 12z" />
        </svg>
      </a>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onRemove={removeFromCart} />
    </div>
  );
}

/* ───────────── Rutas: tienda en "/" y panel de administración en "/#/admin" ───────────── */
export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  if (hash.startsWith("#/admin")) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Admin />
      </Suspense>
    );
  }
  return <Store />;
}
