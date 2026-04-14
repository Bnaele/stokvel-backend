const sql = require('mssql');

const config = {
  user: 'StokvelAdmin',
  password: 'AY8MEHfPf9Ew99p',
  server: 'stokvel-server.database.windows.net',
  database: 'stokvel-server',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function test() {
  try {
    await sql.connect(config);
    console.log('✅ Database connected successfully!');
    const result = await sql.query`SELECT 1 as test`;
    console.log('Query result:', result.recordset);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
