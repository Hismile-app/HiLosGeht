const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
  console.log('🚀 Starting HLG Database Migrations on PostgreSQL 18...');

  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'HiLosGeht123',
    database: process.env.DB_NAME || 'postgres',
    ssl: false
  };

  console.log(`🔌 Connecting to PostgreSQL on ${dbConfig.host}:${dbConfig.port}...`);
  const client = new Client(dbConfig);
  await client.connect();
  console.log('✅ Connected successfully to PostgreSQL database engine!');

  try {
    const migrationFiles = [
      '01_schema_and_extensions.sql',
      '02_rbac_and_jwt_claims.sql',
      '03_seed_fleet_and_users.sql',
      '04_telematics_and_maintenance_triggers.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      console.log(`\n📄 Executing migration: ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`✅ Successfully applied: ${file}`);
    }

    console.log('\n🎉 ALL DATABASE MIGRATIONS & SEEDS APPLIED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Migration Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
