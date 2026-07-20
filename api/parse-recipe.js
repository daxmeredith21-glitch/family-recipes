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

  const systemPrompt = [
    'You are a recipe parser. Extract structured recipe data from the user text.',
    'Return ONLY a valid JSON object. No markdown. No backticks. No explanation.',
    'The JSON must have these exact keys:',
    '  title (string)',
    '  category (one of: Chicken, Beef & Pork, Seafood, Pasta, Soups & Stews, Sides, Breakfast, Desserts, Appetizers & Snacks, Sauces & Dips, Vegetarian, Other)',
    '  serves (string, e.g. "Serves 4" or "")',
    '  time (string, e.g. "2 hours" or "")',
    '  ingredients (array of objects, each with "amount" string and "name" string)',
    '  steps (array of strings, each a complete sentence with measurements included inline)',
    '  notes (string, any tips or empty string)',
    'Separate ingredient amounts from ingredient names.',
    'If a value is unknown use an empty string or empty array.',
  ].join('\n')

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: text }] }],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json',
    },
  }

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    const data = await apiRes.json()

    if (!apiRes.ok) {
      const msg = data?.error?.message || `Gemini API error ${apiRes.status}`
      console.error('Gemini error:', msg)
      return res.status(500).json({ error: msg })
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Gemini raw response (first 500):', raw.slice(0, 500))

    if (!raw) {
      const finishReason = data?.candidates?.[0]?.finishReason || 'unknown'
      return res.status(500).json({ error: `Gemini returned empty response. Finish reason: ${finishReason}` })
    }

    // Strip any markdown fences if present
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()

    // Extract JSON object — find outermost { }
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) {
      return res.status(500).json({ error: `Response was not JSON. Got: ${cleaned.slice(0, 200)}` })
    }

    const jsonStr = cleaned.slice(start, end + 1)
    const parsed = JSON.parse(jsonStr)

    return res.status(200).json(parsed)

  } catch (err) {
    console.error('Parse error:', err.message)
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
