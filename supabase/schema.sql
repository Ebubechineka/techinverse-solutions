-- ============================================================================
-- Techinverse Solutions — Supabase schema
-- ----------------------------------------------------------------------------
-- Run this ONCE in your Supabase project:
--   Supabase dashboard -> SQL Editor -> New query -> paste this file -> Run
--
-- It creates the products table, locks it down with Row Level Security, and
-- seeds it with the 24 products that were already on the site.
-- Safe to re-run: it uses IF NOT EXISTS / ON CONFLICT DO NOTHING.
-- ============================================================================

-- ---------------------------------------------------------------- products --
create table if not exists public.products (
    id          text primary key,
    name        text        not null,
    category    text        not null default 'Uncategorized',
    price       numeric(12,2) not null default 0,
    short       text        not null default '',
    full        text        not null default '',
    stock       text        not null default 'in'
                check (stock in ('in','low','out')),
    qty         integer     not null default 0,
    img         text        not null default '',
    href        text        not null default '',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at);
create index if not exists products_category_idx   on public.products (category);

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end $$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
    before update on public.products
    for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------- RLS --
-- Anyone may READ the catalog (the public shop needs it).
-- Only a signed-in admin may WRITE.
alter table public.products enable row level security;

drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable"
    on public.products for select
    using (true);

drop policy if exists "signed-in users can insert products" on public.products;
create policy "signed-in users can insert products"
    on public.products for insert
    to authenticated
    with check (true);

drop policy if exists "signed-in users can update products" on public.products;
create policy "signed-in users can update products"
    on public.products for update
    to authenticated
    using (true) with check (true);

drop policy if exists "signed-in users can delete products" on public.products;
create policy "signed-in users can delete products"
    on public.products for delete
    to authenticated
    using (true);

-- ------------------------------------------------------------ image bucket --
-- Public read, signed-in write. Run this block only if the bucket does not
-- exist yet (it is harmless to re-run).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images are publicly readable" on storage.objects;
create policy "product images are publicly readable"
    on storage.objects for select
    using (bucket_id = 'product-images');

drop policy if exists "signed-in users can upload product images" on storage.objects;
create policy "signed-in users can upload product images"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'product-images');

drop policy if exists "signed-in users can replace product images" on storage.objects;
create policy "signed-in users can replace product images"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'product-images');

drop policy if exists "signed-in users can delete product images" on storage.objects;
create policy "signed-in users can delete product images"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'product-images');

-- -------------------------------------------------------------------- seed --
insert into public.products (id, name, category, price, short, full, stock, qty, img, href) values
  ('p01', 'Lenovo ThinkPad x1 Carbon Intel Core i7 8th generation', 'Laptops', 460000, '', '', 'in', 5, 'images/img-2caeca33b0.webp', 'products/lenovo-thinkpad-x1-carbon-intel-core-i7-8th-generation.html'),
  ('p02', 'Dell latitude 7410 Intel Core i5 10th generation', 'Laptops', 335000, '', '', 'in', 5, 'images/img-575d21de86.webp', 'products/dell-latitude-7410-intel-core-i5-10th-generation.html'),
  ('p03', 'Dell latitude 5410 Intel core i5 10th generation', 'Laptops', 305000, '', '', 'in', 5, 'images/img-9ce142a8ad.webp', 'products/dell-latitude-5410-intel-core-i5-10th-generation.html'),
  ('p04', 'Dell latitude 5410 Intel Core i5 10th generation sweet deal', 'Laptops', 350000, '', '', 'in', 5, 'images/img-066950a1a3.webp', 'products/dell-latitude-5410-intel-core-i5-10th-generation-sweet-deal.html'),
  ('p05', 'Apple iPad 6th gen', 'iPAD', 160000, '', '', 'in', 0, 'images/img-8beaf97573.webp', 'https://techinversesolutions.com/products/apple-ipad-6th-gen'),
  ('p06', 'Dell latitude 5310 2in1 Silver color 10th generation Touchscreen And x360 Convertible', 'Laptops', 380000, '', '', 'in', 5, 'images/img-4ec1046268.webp', 'products/dell-latitude-5310-2in1-silver-color-10th-generation-touchscreen-and-x360-convertible.html'),
  ('p07', 'Dell Latitude 5300 Intel Core i5 8th generation Keyboard light', 'Laptops', 385000, '', '', 'in', 5, 'images/img-e8533a408e.webp', 'products/dell-latitude-5300-intel-core-i5-8th-generation-keyboard-light.html'),
  ('p08', 'Ho Elitebook 630 G10, TOUCHSCREEN 13th gen Core i7', 'Laptops', 750000, '', '', 'in', 5, 'images/img-c9e44c301a.webp', 'products/ho-elitebook-630-g10-touchscreen-13th-gen-core-i7.html'),
  ('p09', 'Open BoX Hp Elitebook 1040 G8 x360 Touchscreen 32gb/512gb ssd', 'Laptops', 850000, '', '', 'in', 2, 'images/img-3f828844ab.webp', 'products/open-box-hp-elitebook-1040-g8-x360-touchscreen-32gb512gb-ssd.html'),
  ('p10', 'Dell Latitude 7400 Intel Core i5 8th generation', 'Laptops', 295000, '', '', 'in', 5, 'images/img-a765aa11aa.webp', 'products/dell-latitude-7400-intel-core-i5-8th-generation.html'),
  ('p11', 'Laptop Model: Hp Probook x360 435 G8 Touchscreen', 'Laptops', 380000, '', '', 'in', 5, 'images/img-e854b3b5f4.webp', 'products/laptop-model-hp-probook-x360-435-g8-touchscreen.html'),
  ('p12', 'Dell latitude 3120 2-in-1 Pentium Silver 11th generation X360 Touchscreen', 'Laptops', 195000, '', '', 'in', 10, 'images/img-8171e0ddf7.webp', 'products/dell-latitude-3120-2-in-1-pentium-silver-11th-generation-x360-touchscreen.html'),
  ('p13', 'Dell latitude 7490 Intel core i7 8th generation', 'Laptops', 335000, '', '', 'in', 10, 'images/img-28993d54ef.webp', 'products/dell-latitude-7490-intel-core-i7-8th-generation.html'),
  ('p14', 'Hp Elitebook 630 G10 Touchscreen 13th gen Intel core i7', 'Laptops', 950000, '', '', 'in', 0, 'images/img-6173734b95.webp', 'https://techinversesolutions.com/products/hp-elitebook-630-g10-touchscreen-13th-gen-intel-core-i7'),
  ('p15', 'Dell latitude 7420 intel Core i7 32gb Ram 11th generation', 'Laptops', 600000, '', '', 'in', 0, 'images/img-16863a12b7.webp', 'https://techinversesolutions.com/products/dell-latitude-7420-intel-core-i7-32gb-ram-11th-generation'),
  ('p16', 'Dell latitude 5320 Intel core i5 11th generation 16gb ram TOUCHSCREEN', 'Laptops', 380000, '', '', 'in', 0, 'images/img-e4b59d873c.webp', 'https://techinversesolutions.com/products/dell-latitude-5320-intel-core-i5-11th-generation-16gb-ram'),
  ('p17', 'Alienware M16 R2, Intel® Core™ Ultra 7 155H, 8gb NVIDIA GeForce RTX 4070', 'Laptops', 2500000, '', '', 'in', 0, 'images/img-4376460992.webp', 'https://techinversesolutions.com/products/alienware-m16-r2-intel-core-ultra-7-155h-8gb-nvidia-geforce-rtx-4070'),
  ('p18', 'Hp Elitebook 830 G7, (Touchscreen) 10th gen', 'Laptops', 460000, '', '', 'in', 0, 'images/img-8f3dbbc487.webp', 'https://techinversesolutions.com/products/hp-elitebook-830-g7-touchscreen-10th-gen'),
  ('p19', 'MacBook Pro 2018 intel core i9 4gb Dedicated graphics 32gb ram 1TB SSD', 'Laptops', 850000, '', '', 'in', 0, 'images/img-4ea726f399.webp', 'https://techinversesolutions.com/products/macbook-pro-2019-intel-core-i7-8gb-dedicated-graphics-16gb-ram'),
  ('p20', 'Microsoft Surface Laptop Studio, Intel core i7, 11th generation, 4GB NVIDIA GeForce RTX 3050 Ti Laptop GPU', 'Laptops', 1250000, '', '', 'in', 0, 'images/img-0b6a9d38c2.webp', 'https://techinversesolutions.com/products/microsoft-surface-laptop-studio-intel-core-i7-11th-generation-4gb-nvidia-geforce-rtx-3050-ti-laptop-gpu'),
  ('p21', '🛍️Laptop Model: Hp Elitebook x360 1040 G9 Touchscreen Core i7, 12th generation (10cores, 12 logical Processor)', 'Laptops', 790000, '', '', 'in', 0, 'images/img-96bf5b24e5.webp', 'https://techinversesolutions.com/products/laptop-model-hp-elitebook-x360-1040-g9-touchscreen-core-i7-12th-generation-10cores-12-logical-processor'),
  ('p22', 'Brand new Double Lens CCTV Camera', 'Accessories', 75000, '', '', 'in', 25, 'images/img-f36ff44a51.webp', 'products/brand-new-double-lens-cctv-camera.html'),
  ('p23', 'Brand New Tripple Lens CCTV Camera with Solar Panels', 'Accessories', 85000, '', '', 'in', 20, 'images/img-64da37ee23.webp', 'products/brand-new-tripple-lens-cctv-camera-with-solar-panels.html'),
  ('p24', 'MacBook Pro 2019, 4gb Dedicated Graphics, core i7, 16gb ram, 512gb ssd', 'Laptops', 700000, '', '', 'in', 0, 'images/img-31a2e619b5.webp', 'https://techinversesolutions.com/products/macbook-pro-2019-4gb-dedicated-graphics-core-i7-16gb-ram-512gb-ssd')
on conflict (id) do nothing;
