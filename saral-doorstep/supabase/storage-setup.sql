-- in Storage. Signatures are stored as "{booking_id}.png" — these
-- policies extract the booking id from the filename and check it
-- against the same agent/admin rules used on the bookings table.

create policy "signatures_select"
on storage.objects for select
using (
  bucket_id = 'signatures'
  and (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from bookings
      where bookings.id = split_part(storage.objects.name, '.', 1)
        and bookings.agent = (select full_name from profiles where id = auth.uid())
    )
  )
);

create policy "signatures_insert"
on storage.objects for insert
with check (
  bucket_id = 'signatures'
  and (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from bookings
      where bookings.id = split_part(storage.objects.name, '.', 1)
        and bookings.agent = (select full_name from profiles where id = auth.uid())
    )
  )
);

create policy "signatures_update"
on storage.objects for update
using (
  bucket_id = 'signatures'
  and (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from bookings
      where bookings.id = split_part(storage.objects.name, '.', 1)
        and bookings.agent = (select full_name from profiles where id = auth.uid())
    )
  )
);