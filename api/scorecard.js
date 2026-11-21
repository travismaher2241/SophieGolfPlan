// Reads a photo of a golf scorecard with Google Gemini and returns the par
// (and length in metres, when printed) for each hole.
// Needs GEMINI_API_KEY in Vercel. GEMINI_MODEL is optional.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const PROMPT = `This is a photo of a golf course scorecard. Read it and return every hole in order.
- par: the par for that hole (usually 3, 4 or 5). If the card lists different pars for different tees, use the women's / junior / forward tee par.
- metres: the hole length for the SHORTEST set of tees on the card, in metres. If the card is in yards, convert to metres (1 yard = 0.9144 m) and round. Use null if no lengths are readable.
- courseName: the course name if printed, otherwise an empty string.
- notes: one short sentence about anything you weren't sure of, or an empty string.
Only include holes you can actually see (9 or 18). Don't include OUT/IN/TOTAL columns.`

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    courseName: { type: 'STRING' },
    holes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          hole: { type: 'INTEGER' },
          par: { type: 'INTEGER' },
          metres: { type: 'INTEGER', nullable: true },
        },
        required: ['hole', 'par'],
      },
    },
    notes: { type: 'STRING' },
  },
  required: ['courseName', 'holes', 'notes'],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(503).json({ error: 'not_configured' })

  const { image, mediaType } = req.body || {}
  if (!image || !/^image\/(jpeg|png|webp|gif)$/.test(mediaType || '')) {
    return res.status(400).json({ error: 'Send { image: <base64>, mediaType: "image/jpeg" }' })
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { inline_data: { mime_type: mediaType, data: image } },
            { text: PROMPT },
          ],
        }],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
        },
      }),
    })

    if (r.status === 429) return res.status(429).json({ error: 'Busy right now. Try again in a minute.' })
    if (r.status === 401 || r.status === 403) return res.status(503).json({ error: 'not_configured' })
    if (!r.ok) return res.status(502).json({ error: `Scorecard reader error (${r.status})` })

    const data = await r.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
    let card
    try { card = JSON.parse(text) } catch { card = null }
    if (!card || !Array.isArray(card.holes) || !card.holes.length) {
      return res.status(422).json({ error: 'Could not read that scorecard. Try a clearer photo, or tap the pars in.' })
    }
    card.holes = card.holes
      .filter((h) => Number.isInteger(h.par) && h.par >= 3 && h.par <= 6)
      .map((h) => ({ hole: h.hole, par: h.par, metres: Number.isFinite(h.metres) ? h.metres : null }))
      .sort((a, b) => a.hole - b.hole)
    return res.status(200).json(card)
  } catch {
    return res.status(500).json({ error: 'Scorecard reader failed' })
  }
}
