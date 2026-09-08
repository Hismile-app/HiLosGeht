import app from './app';
import { verifySmtpConnection } from './services/nodemailer';
import db from './config/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('====================================================');
  console.log('🚜 HI LOS GEHT (HLG) HEAVY MACHINERY PLATFORM SERVER');
  console.log('====================================================');

  try {
    // 1. Verify PostgreSQL Database Connection
    const dbTest = await db.query('SELECT current_database(), version();');
    console.log(`✅ PostgreSQL Connected [Database: ${dbTest.rows[0].current_database}]`);

    // 2. Verify Nodemailer SMTP Connection
    await verifySmtpConnection();

    // 3. Start HTTP Listener
    const server = app.listen(PORT, () => {
      console.log(`🚀 HLG Backend API listening on http://localhost:${PORT}`);
      console.log(`📡 API v1 Routes available at http://localhost:${PORT}/api/v1`);
      console.log(`📍 Operating Headquarters: Meru, Kenya`);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start HLG Server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default startServer;
