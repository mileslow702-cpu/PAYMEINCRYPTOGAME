// Tells the game which AI features are switched on (never returns the keys).
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ gemini: !!process.env.GEMINI_API_KEY, fish: !!process.env.FISH_API_KEY });
};
