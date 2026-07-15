module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text) return res.status(400).json({ error: 'No text provided' })

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const prompt = `You are a recipe parser. Extract structured recipe data from the text below.
You MUST return ONLY a raw JSON object. No markdown. No backticks. No explanation. No preamble.
Start your response with { and end with }.

Use this exact JSON shape:
{
  "title": "Recipe name",
  "category": "one of: Chicken, Beef & Pork, Seafood, Pasta, Soups & Stews, Sides, Breakfast, Desserts, Appetizers & Snacks, Sauces & Dips, Other",
  "serves": "e.g. Serves 4",
  "time": "e.g. 30 min",
  "ingredients": [{"amount": "2 cups", "name": "all-purpose flour"}],
  "steps": ["Step 1 written as a full sentence.", "Step 2..."],
  "notes": ""
}

Rules:
- ingredients: separate the amount from the ingredient name. If no amount, use empty string for amount.
- steps: each step is a complete sentence. Include measurements inline in the step text.
- If a field is unknown, use an empty string.
- Return valid JSON only.

Recipe text:
${text}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || `Gemini API error ${response.status}`)

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (!raw) throw new Error('Gemini returned an empty response')

    // Clean up the response aggressively before parsing
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    // Find the JSON object even if there's extra text around it
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON object found in response')

    const parsed = JSON.parse(jsonMatch[0])

    // Validate we got something useful
    if (!parsed.title && !parsed.ingredients) {
      throw new Error('Could not identify recipe structure in the pasted text')
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Parse error:', err.message)
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
