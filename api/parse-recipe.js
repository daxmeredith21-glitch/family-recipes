export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text) return res.status(400).json({ error: 'No text provided' })

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured in Vercel environment variables' })
  }

  const prompt = `You are a recipe parser. Extract structured recipe data from the text below.
Return ONLY valid JSON with no markdown, no backticks, no explanation. Use this exact shape:
{
  "title": "Recipe name",
  "category": "one of: Chicken, Beef & Pork, Seafood, Pasta, Soups & Stews, Sides, Breakfast, Desserts, Appetizers & Snacks, Sauces & Dips, Other",
  "serves": "e.g. Serves 4",
  "time": "e.g. 30 min",
  "ingredients": [{"amount": "2 cups", "name": "all-purpose flour"}, ...],
  "steps": ["Step 1 written as a full sentence including amounts.", "Step 2...", ...],
  "notes": "any tips or notes, or empty string"
}
For ingredients, always separate the amount from the ingredient name.
For steps, write each as a complete sentence and include any amounts/measurements inline in the step text.

Recipe to parse:
${text}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini API error ${response.status}`)
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Parse error:', err)
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
