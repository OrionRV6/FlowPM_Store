-- Flow PM Store · configuración de Supabase

-- 1) Tabla de productos
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  brand       text    not null default 'Puma',
  name        text    not null,
  category    text    not null check (category in ('Hombre', 'Mujer', 'Niño')),
  price       integer not null check (price > 0),
  old_price   integer check (old_price is null or old_price > price),
  sizes       numeric[] not null default '{}',
  tag         text,
  image_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2) Seguridad: cualquiera puede VER los productos visibles; solo el administrador puede modificar
alter table public.products enable row level security;

create policy "Catalogo publico" on public.products
  for select using (active = true);

create policy "Admin ve todo" on public.products
  for select to authenticated using (true);

create policy "Admin agrega" on public.products
  for insert to authenticated with check (true);

create policy "Admin edita" on public.products
  for update to authenticated using (true) with check (true);

create policy "Admin elimina" on public.products
  for delete to authenticated using (true);

-- 3) Almacenamiento de fotos (carpeta pública "productos")
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "Fotos publicas" on storage.objects
  for select using (bucket_id = 'productos');

create policy "Admin sube fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos');

create policy "Admin edita fotos" on storage.objects
  for update to authenticated using (bucket_id = 'productos');

create policy "Admin borra fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'productos');
