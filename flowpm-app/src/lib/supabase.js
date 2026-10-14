import { createClient } from "@supabase/supabase-js";

// Estas dos variables van en el archivo .env (y en Vercel al publicar)
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan, la tienda sigue funcionando con los productos de ejemplo de App.jsx
export const supabase = url && key ? createClient(url, key) : null;

export const CATEGORIES = ["Hombre", "Mujer", "Niño"];

// Fila de la base de datos -> formato que usa la tienda
export const fromRow = (r) => ({
  id: r.id,
  brand: r.brand,
  name: r.name,
  group: r.category,
  price: r.price,
  oldPrice: r.old_price ?? undefined,
  sizes: r.sizes ?? [],
  tag: r.tag ?? undefined,
  image: r.image_url ?? "",
  active: r.active,
});
