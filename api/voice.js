// Fish Audio text-to-speech: Coach, Regulator and DJ voices. Returns an mp3.
// Optional voice ids (from fish.audio voice pages): FISH_VOICE_COACH, FISH_VOICE_REGULATOR, FISH_VOICE_DJ.
const VOICES = { coach: "FISH_VOICE_COACH", regulator: "FISH_VOICE_REGULATOR", dj: "FISH_VOICE_DJ" };

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.FISH_API_KEY;
  if (!key) return res.status(503).json({ error: "Fish Audio key not set" });
  const { text, voice } = req.body || {};
  if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "no text" });
  const body = { text: text.slice(0, 1200), format: "mp3", latency: "balanced" };
  const ref = process.env[VOICES[voice] || "FISH_VOICE_COACH"];
  if (ref) body.reference_id = ref;
  const r = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", model: process.env.FISH_MODEL || "s2.1-pro-free" },
    body: JSON.stringify(body)
  });
  if (!r.ok) return res.status(502).json({ error: (await r.text()).slice(0, 300) });
  res.setHeader("Content-Type", "audio/mpeg");
  res.status(200).send(Buffer.from(await r.arrayBuffer()));
};
