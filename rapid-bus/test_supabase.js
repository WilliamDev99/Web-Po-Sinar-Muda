const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://slpemsjqvbjoiptxnvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscGVtc2pxdmJqb2lwaXR4bnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MDUzMjEsImV4cCI6MjA5NjI4MTMyMX0.WoFkub3S-HQHsGzpXwMVgYCh6qIl8SsquUPKZwAEuAU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching...");
  try {
    const { data, error } = await supabase
      .from('jadwal')
      .select(`
        id,
        tanggal_berangkat,
        waktu_berangkat,
        harga_tiket,
        rute!inner (kota_asal, kota_tujuan, estimasi_waktu),
        armada!inner (nama_kelas, total_kursi, fasilitas)
      `)
      .ilike('rute.kota_asal', '%Makassar%')
      .ilike('rute.kota_tujuan', '%Toraja%');

    if (error) console.error("Error:", error);
    else console.log("Data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Exception:", e);
  }
}

test();
