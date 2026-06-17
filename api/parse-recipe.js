import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text) return res.status(400).json({ error: 'No text provided' })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a recipe parser. Extract structured recipe data from raw text.
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
For steps, write each as a complete sentence and include any amounts/measurements inline in the step text.`,
      messages: [{ role: 'user', content: `Parse this recipe:\n\n${text}` }],
    })

    const raw = message.content?.[0]?.text || ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Parse error:', err)
    return res.status(500).json({ error: err.message })
  }
}
