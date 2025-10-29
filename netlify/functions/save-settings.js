exports.handler = async (event) => {
  const ADMIN = process.env.ADMIN_TOKEN || 'admin123';
  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
  if (!token || token !== ADMIN) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  try {
    const fs = require('fs');
    const path = require('path');
    const body = JSON.parse(event.body || '{}');
    const p = path.join(__dirname, '..', '..', 'data', 'site.json');
    fs.writeFileSync(p, JSON.stringify(body, null, 2));
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};