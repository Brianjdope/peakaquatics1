import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const prompt = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    if (!prompt) return res.status(400).json({ error: 'Message is required.' })

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
      max_tokens: 700,
      system: 'You are Peak Aquatic Sports assistant. Keep responses short, friendly, and useful for swimmers and parents.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    return res.json({ reply: text || 'No response returned.' })
  } catch (error) {
    return res.status(error?.status || 500).json({ error: error?.message || 'Claude request failed.' })
  }
}
