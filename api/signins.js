// Download the sign-in list as a spreadsheet: /api/signins?key=YOUR_ADMIN_KEY
module.exports = async (req, res) => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) return res.status(401).send("Not allowed");
  if (!url || !token) return res.status(503).send("Storage not connected");
  const r = await fetch(`${url}/lrange/signins/0/-1`, { headers: { Authorization: `Bearer ${token}` } });
  const rows = ((await r.json()).result || []).map(x => JSON.parse(x));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=pay-me-in-crypto-signins.csv");
  res.status(200).send("email,signed_in_at\n" + rows.map(x => `${x.email},${x.at}`).join("\n"));
};
