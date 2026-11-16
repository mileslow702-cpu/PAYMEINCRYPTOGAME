// Gemini text: hooks/captions, the advisor crew, personal playbook, radio recap.
// The prompt is built here from the task name, so this can't be used as an open proxy.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

const BASE = "You are inside PAY ME IN CRYPTO, a game that teaches independent artists in smaller markets to release a song, fund it with their own community, and roll it out with data. Be practical, specific, and short. Plain text only, no markdown symbols. Never promise investment returns or say a token will go up; fan tokens sell access and perks, not profit.";

const TASKS = {
  captions: c => `Write 5 short-form video hooks and captions for this song. For each: the first 3 seconds (what's on screen and said), a caption under 20 words, and one comment keyword the artist says out loud and puts on screen. Rules: open on the artist performing the best line, never a flyer; promo is weakest; send people to the profile, not straight to Spotify.\n\nSong info:\n${c}`,
  crew: c => `Three advisers react to this week of a song rollout, 2 sentences each, then agree on ONE move for next week. Format exactly:\nMANAGER: ...\nMARKETER: ...\nSUPERFAN: ...\nNEXT MOVE: ...\nThe manager watches money and the backers, the marketer watches the data (which content and which city hit), the superfan says what the fans actually feel.\n\nThis week:\n${c}`,
  playbook: c => `Rewrite this release playbook into a personal plan for this exact artist, city and fan base. Keep it to: 3 things to do this week, an 8-week plan in one line per week, a funding plan with real numbers from their game, and the 3 mistakes from their game to avoid in real life. Under 350 words.\n\n${c}`,
  listen: c => `You are an honest, experienced A&R listening to this demo for an independent artist. Listen to the attached audio. Be specific about what you actually hear (melody, vocals, lyrics you can make out, production, energy). Format exactly:\nGENRE: (closest genre and sub-style)\nMOOD: ...\nWHAT IT'S ABOUT: ...\nTHE HOOK: (timestamp and why it works or doesn't)\nWHAT WORKS: (2-3 points)\nFIX FIRST: (the 1-2 changes that would help most)\nWHO IT'S FOR: (the fans and places this fits)\nSCORE: x/10 as a release right now\n\n${c}`,
  recap: c => `Write a 40-second radio recap of this artist's 8-week release, as a warm, hype community-radio DJ talking to listeners. Mention the song, the city, the best moment and one lesson. Under 110 words. No stage directions, just the words to speak.\n\n${c}`
};

// Fastest model first; if one is slow or overloaded, move to the next.
const TEXT_MODELS = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
const AUDIO_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-2.5-flash"];

async function call(model, key, body, ms) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body)
    });
    const j = await r.json();
    if (!r.ok) return { error: j.error?.message || "Gemini error" };
    const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
    return text ? { text } : { error: "Empty answer" };
  } catch (e) {
    return { error: e.name === "AbortError" ? `${model} took too long` : e.message };
  } finally { clearTimeout(t); }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "Gemini key not set" });
  const { task, context, audio } = req.body || {};
  if (!TASKS[task] || typeof context !== "string") return res.status(400).json({ error: "bad request" });
  const listen = task === "listen" && typeof audio === "string";
  const body = {
    systemInstruction: { parts: [{ text: BASE }] },
    contents: [{ role: "user", parts: [
      ...(listen ? [{ inline_data: { mime_type: "audio/wav", data: audio } }] : []),
      { text: TASKS[task](context.slice(0, 6000)) }] }]
  };
  const models = [...new Set([process.env.GEMINI_MODEL, ...(listen ? AUDIO_MODELS : TEXT_MODELS)].filter(Boolean))];
  const started = Date.now();
  let last = "Gemini error";
  for (const m of models) {
    const left = 55000 - (Date.now() - started);
    if (left < 4000) break;
    const r = await call(m, key, body, Math.min(listen ? 30000 : 15000, left));
    if (r.text) return res.status(200).json({ text: r.text, model: m });
    last = r.error;
  }
  res.status(502).json({ error: last });
};
