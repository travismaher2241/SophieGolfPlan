// Reads a photo of a golf scorecard and returns the par (and length in
// metres, when printed) for each hole. Needs ANTHROPIC_API_KEY in Vercel.
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

const Card = z.object({
  courseName: z.string(),
  holes: z.array(z.object({
    hole: z.number().int(),
    par: z.number().int(),
    metres: z.number().int().nullable(),
  })),
  notes: z.string(),
})

const PROMPT = `This is a photo of a golf course scorecard. Read it and return every hole in order.
- par: the par for that hole (usually 3, 4 or 5). If the card lists different pars for different tees, use the women's / junior / forward tee par.
- metres: the hole length for the SHORTEST set of tees on the card, in metres. If the card is in yards, convert to metres (1 yard = 0.9144 m) and round. Use null if no lengths are readable.
- courseName: the course name if printed, otherwise an empty string.
- notes: one short sentence about anything you weren't sure of, or an empty string.
Only include holes you can actually see (9 or 18). Don't include OUT/IN/TOTAL columns.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'not_configured' })

  const { image, mediaType } = req.body || {}
  if (!image || !/^image\/(jpeg|png|webp|gif)$/.test(mediaType || '')) {
    return res.status(400).json({ error: 'Send { image: <base64>, mediaType: "image/jpeg" }' })
  }

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low', format: zodOutputFormat(Card) },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
          { type: 'text', text: PROMPT },
        ],
      }],
    })
    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return res.status(422).json({ error: 'Could not read that scorecard. Try a clearer photo, or tap the pars in.' })
    }
    const card = response.parsed_output
    card.holes = card.holes
      .filter((h) => h.par >= 3 && h.par <= 6)
      .sort((a, b) => a.hole - b.hole)
    return res.status(200).json(card)
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'Busy right now. Try again in a minute.' })
    if (err instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'not_configured' })
    if (err instanceof Anthropic.APIError) return res.status(502).json({ error: `Scorecard reader error (${err.status})` })
    return res.status(500).json({ error: 'Scorecard reader failed' })
  }
}

