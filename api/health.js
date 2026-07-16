module.exports = async function handler(req, res) {
  res.status(200).json({
    ok: true,
    supabaseUrl: process.env.VITE_SUPABASE_URL ? 'set' : 'MISSING',
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'MISSING',
    geminiKey: process.env.GEMINI_API_KEY ? 'set' : 'MISSING',
    seedSecret: process.env.SEED_SECRET ? 'set' : 'MISSING',
  })
}
