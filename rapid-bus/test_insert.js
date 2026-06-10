const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Fetching some rute and armada to use for insert...");
  const { data: rute } = await supabase.from('rute').select('id').limit(1);
  const { data: armada } = await supabase.from('armada').select('id').limit(1);

  if (!rute || !armada || rute.length === 0 || armada.length === 0) {
    console.error("No rute or armada found");
    return;
  }

  console.log("Attempting insert...");
  const { error } = await supabase.from('jadwal').insert({
    rute_id: rute[0].id,
    armada_id: armada[0].id,
    tanggal_berangkat: '2026-07-01',
    waktu_berangkat: '10:00:00',
    harga_tiket: 150000
  });

  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success!");
  }
}

testInsert();
