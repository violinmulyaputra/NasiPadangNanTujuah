-- Skema fitur Ulasan

-- Tabel reviews

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null check (char_length(author_name) between 2 and 40),
  rating       numeric(2,1) not null
                 check (rating between 0.5 and 5 and rating * 2 = round(rating * 2)),
  comment      text not null check (char_length(comment) between 10 and 500),
  is_visible   boolean not null default true,
  is_sample    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists reviews_created_idx
  on public.reviews (created_at desc);

-- Tabel review_attempts

create table if not exists public.review_attempts (
  id          bigint generated always as identity primary key,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists review_attempts_ip_created_idx
  on public.review_attempts (ip_hash, created_at);

-- Row Level Security

alter table public.reviews         enable row level security;
alter table public.review_attempts enable row level security;

drop policy if exists "Ulasan tampil bisa dibaca publik" on public.reviews;
create policy "Ulasan tampil bisa dibaca publik"
  on public.reviews for select
  to anon, authenticated
  using (is_visible = true);

-- View review_stats

create or replace view public.review_stats
with (security_invoker = true)
as
select
  coalesce(round(avg(rating), 1), 0)::numeric(2,1) as average_rating,
  count(*)::integer                               as review_count
from public.reviews
where is_visible = true;

grant select on public.review_stats to anon, authenticated;
