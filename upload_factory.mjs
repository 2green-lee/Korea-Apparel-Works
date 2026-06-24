import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const bucketName = 'factory';

  // Check if bucket exists, if not create it
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
    return;
  }

  const bucketExists = buckets.some((b) => b.name === bucketName);
  if (!bucketExists) {
    console.log(`Creating bucket '${bucketName}'...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true, // Make bucket public for CDN access
    });
    if (createError) {
      console.error('Error creating bucket:', createError);
      return;
    }
  } else {
    // Ensure bucket is public
    await supabase.storage.updateBucket(bucketName, {
      public: true,
    });
  }

  const publicDir = path.join(process.cwd(), 'public');
  const files = ['b1.jpg', 'b2-2.jpg', 'b3.jpg', 'b4.jpg', 'b5.jpg', 'b6.jpg', 'b7.jpg', 'b8.jpg', 'b9.jpg'];

  for (const file of files) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File ${file} does not exist. Skipping.`);
      continue;
    }
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`Uploading ${file}...`);
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(file, fileBuffer, {
      upsert: true,
      contentType: 'image/jpeg',
    });

    if (uploadError) {
      console.error(`Failed to upload ${file}:`, uploadError);
    } else {
      console.log(`Successfully uploaded ${file}`);
    }
  }

  console.log('Upload complete.');
}

main();
