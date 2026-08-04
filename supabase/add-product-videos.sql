alter table public.store_products
add column if not exists video_url text;

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm'
    ]
where id = 'product-images';
