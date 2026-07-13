import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImages() {
  const bucketName = 'clothes';

  // 1. Check if bucket exists, if not, create it
  const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
  if (getBucketsError) {
    console.error("Error listing buckets:", getBucketsError);
    return;
  }
  
  if (!buckets.some(b => b.name === bucketName)) {
    console.log(`Creating bucket ${bucketName}...`);
    const { error: createBucketError } = await supabase.storage.createBucket(bucketName, { public: true });
    if (createBucketError) {
      console.error("Error creating bucket:", createBucketError);
      return;
    }
  } else {
    console.log(`Bucket ${bucketName} already exists.`);
  }

  // 2. Upload images
  const images = ['p1.jpg', 'p2.jpg', 'p3.jpg', 'p4.jpg', 'p5.jpg', 'p6.jpg', 'p7.jpg'];
  const publicDir = path.join(process.cwd(), 'public');

  for (const image of images) {
    const filePath = path.join(publicDir, image);
    if (!fs.existsSync(filePath)) {
      console.warn(`File ${image} not found in public folder, skipping.`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`Uploading ${image}...`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(image, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${image}:`, error);
    } else {
      console.log(`Successfully uploaded ${image}`);
    }
  }
  console.log("Done uploading.");
}

uploadImages();
