const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: true }
});

async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
  `);
  
  const fkeys = await client.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
  `);

  const tables = {};
  res.rows.forEach(r => {
    if (!tables[r.table_name]) tables[r.table_name] = { columns: [], fkeys: [] };
    tables[r.table_name].columns.push(r.column_name + ' (' + r.data_type + ')');
  });

  fkeys.rows.forEach(r => {
    if (tables[r.table_name]) {
      tables[r.table_name].fkeys.push(`${r.column_name} -> ${r.foreign_table_name}(${r.foreign_column_name})`);
    }
  });

  console.log(JSON.stringify(tables, null, 2));
  await client.end();
}
check();
