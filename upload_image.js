import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function upload() {
  const fileData = fs.readFileSync('./src/components/white-fabric-texture-bg-optimized2.jpg');
  
  // Create bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === 'public-assets')) {
    await supabase.storage.createBucket('public-assets', { public: true });
  }

  const { data, error } = await supabase.storage
    .from('public-assets')
    .upload('white-fabric-texture-bg-optimized2.jpg', fileData, {
      contentType: 'image/jpeg',
      upsert: true
    });
    
  if (error) {
    console.error('Error uploading:', error);
  } else {
    const { data: publicUrl } = supabase.storage.from('public-assets').getPublicUrl('white-fabric-texture-bg-optimized2.jpg');
    console.log('Upload success! Public URL:', publicUrl.publicUrl);
  }
}
upload();
