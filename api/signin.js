// Saves a player's email when they sign in. Storage: Upstash Redis from the Vercel Marketplace
// (it adds KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return res.status(400).json({ error: "Enter a real email" });
  const row = JSON.stringify({ email, at: new Date().toISOString() });
  console.log("signin", row);
  if (!URL_() || !TOKEN()) return res.status(200).json({ ok: true, stored: false });
  const r = await fetch(`${URL_()}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN()}`, "Content-Type": "application/json" },
    body: JSON.stringify([["RPUSH", "signins", row], ["SADD", "emails", email]])
  });
  res.status(200).json({ ok: true, stored: r.ok });
};
