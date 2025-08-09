-- Seed minimal data
truncate table public.group_participants restart identity cascade;
truncate table public.groups restart identity cascade;
truncate table public.orders restart identity cascade;
truncate table public.products restart identity cascade;
truncate table public.users restart identity cascade;

-- Users
insert into public.users (id, email, name, role) values
  ('00000000-0000-0000-0000-000000000001','merchant@example.com','Alice Merchant','merchant'),
  ('00000000-0000-0000-0000-000000000002','customer@example.com','Bob Customer','customer');

-- Products
insert into public.products (id, merchant_id, title, description, price, group_price, images, current_groups) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Cà phê hoà tan 3in1 (20 gói)','Cà phê đậm đà cho dân văn phòng bận rộn.',120000,89000,array['/next.svg'],6),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Hộp khẩu trang 4 lớp (50 cái)','Thoáng khí, phù hợp khi di chuyển.',85000,59000,array['/vercel.svg'],9);

-- Groups
insert into public.groups (id, product_id, leader_id, required_count, current_count, expires_at, status) values
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',5,3,now() + interval '1 hour','open');

-- Group participants
insert into public.group_participants (id, group_id, user_id) values
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002');

