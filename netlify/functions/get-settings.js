exports.handler = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const p = path.join(__dirname, '..', '..', 'data', 'site.json');
    const raw = fs.readFileSync(p, 'utf8');
    return { statusCode: 200, headers: {'Content-Type':'application/json'}, body: raw };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};