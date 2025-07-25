const { Pool } = require("pg");
require("dotenv").config();

// Use DATABASE_URL if available (Render/production), otherwise use individual vars (local dev)
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "resume_analyzer",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      ssl: false,
    };

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeTables = async () => {
  const createResumeTable = `
    CREATE TABLE IF NOT EXISTS resumes (
      id SERIAL PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      personal_details JSONB,
      resume_content JSONB,
      skills JSONB,
      ai_feedback JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at);
    CREATE INDEX IF NOT EXISTS idx_resumes_name ON resumes((personal_details->>'name'));
    CREATE INDEX IF NOT EXISTS idx_resumes_email ON resumes((personal_details->>'email'));
  `;

  try {
    await pool.query(createResumeTable);
    await pool.query(createIndexes);
    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database tables:", error.message);
    throw error;
  }
};

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Closing database connections...");
  await pool.end();
  console.log("Database connections closed.");
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = {
  pool,
  query,
  testConnection,
  initializeTables,
  gracefulShutdown,
};
