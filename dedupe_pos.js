import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function deduplicate() {
    const { data: pos } = await supabase.from('apparel_orders').select('order_id, session_id, created_at').order('created_at', { ascending: false });
    const seenSessions = new Set();
    const toDelete = [];

    for (const po of pos) {
        if (po.session_id) {
            if (seenSessions.has(po.session_id)) {
                toDelete.push(po.order_id);
            } else {
                seenSessions.add(po.session_id);
            }
        }
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicate POs...`);
        for (const id of toDelete) {
            await supabase.from('apparel_orders').delete().eq('order_id', id);
        }
        console.log('Deduplication complete.');
    } else {
        console.log('No duplicates found.');
    }
}

deduplicate().catch(console.error);
