const { pool } = require('../config/db');

async function getSetting(key) {
  const query = `SELECT value FROM system_settings WHERE key = $1`;
  const { rows } = await pool.query(query, [key]);
  return rows[0]?.value || null;
}

async function setSetting(key, value, userId = null) {
  const query = `
    INSERT INTO system_settings (key, value, updated_by, updated_at)
    VALUES ($1, $2, $3, now())
    ON CONFLICT (key) 
    DO UPDATE SET value = $2, updated_by = $3, updated_at = now()
    RETURNING value, updated_at
  `;
  const { rows } = await pool.query(query, [key, JSON.stringify(value), userId]);
  return rows[0];
}

async function getMaintenanceMode() {
  const setting = await getSetting('maintenance_mode');
  if (!setting) {
    // Default value
    return { enabled: false };
  }
  return typeof setting === 'string' ? JSON.parse(setting) : setting;
}

async function setMaintenanceMode(enabled, userId = null) {
  const value = { enabled: !!enabled };
  await setSetting('maintenance_mode', value, userId);
  return value;
}

module.exports = {
  getSetting,
  setSetting,
  getMaintenanceMode,
  setMaintenanceMode,
};


