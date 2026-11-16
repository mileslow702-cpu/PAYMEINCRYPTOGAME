# Pay Me In Crypto

A browser game that teaches independent creators in smaller markets how to fund, market and own a release, by playing one through. First level: Afrobeats.

**Learn it by playing it.** Make or upload a song, plan the content, fund the release with a fan token or a royalty sale, run an 8-week rollout off real data, and leave with a real playbook.

Built for the Twin Pillars x Imaginarium Birthday Hackathon, assignment 1: "Pay Us in Crypto." A Do Better Network game.

## Run it
Static site, no build step. Open `index.html`, or deploy the folder to Vercel.

## Files
- `index.html`: the whole game
- `demo-black-candle-world.mp3`: demo song

## Notes
- Everything is simulated: no real wallets, tokens or trades, and nothing here is financial advice.
- The Splice stack library holds names, tempos, keys and links only. Players load sounds from their own Splice account.

## AI features (Vercel only)

Set these in Vercel → Settings → Environment Variables, then redeploy:

- `GEMINI_API_KEY`: hooks and captions, "Ask the crew" after each rollout week, a personal playbook, and the radio recap script.
- `FISH_API_KEY`: the Coach voice (🔊 on each stage goal), the Regulator voice, and the DJ radio recap.
- Optional: `FISH_VOICE_COACH`, `FISH_VOICE_REGULATOR`, `FISH_VOICE_DJ` (Fish Audio voice ids), `GEMINI_MODEL`, `FISH_MODEL`.

Keys stay on the server (`/api/*.js`). Without them, the AI buttons hide and the game plays the same.
