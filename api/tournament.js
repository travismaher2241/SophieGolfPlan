// Reads a tournament scorecard or results sheet (photo or PDF) with Google Gemini:
// Sophie's hole-by-hole score, the pars and lengths, and every other player's total.
// Needs GEMINI_API_KEY in Vercel. GEMINI_MODEL is optional.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const prompt = (player) => `This is a junior golf tournament scorecard, leaderboard or results sheet (U.S. Kids Golf Local Tour, Australia).
Find the player named "${player}" (match the first name if that's all that's printed, and don't confuse similar names such as Sofia with Sophie).
Return:
- courseName: the course or event venue if printed, otherwise "".
- date: the round date as YYYY-MM-DD if a full date is printed, otherwise "".
- holes: one entry per hole in order (9 or 18). par for each hole. metres: the hole length in metres; U.S. Kids Golf cards print YARDS, so if the lengths are in yards convert them (1 yard = 0.9144 m) and round; null if not printed. score: ${player}'s GROSS strokes on that hole (not the score to par), or null if not shown. putts: her putts on that hole if shown, otherwise null. Leave holes empty if the sheet only has totals.
- playerTotal: ${player}'s total gross strokes, or null if she isn't on the sheet.
- totalPar: the total par for the round if printed, otherwise null.
- field: every OTHER player in the same division with their total gross strokes. Skip players marked WD, NS or DQ, or with no score.
- notes: one short sentence about anything you weren't sure of, or "".
Don't include OUT/IN/TOTAL columns as holes.`

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    courseName: { type: 'STRING' },
    date: { type: 'STRING' },
    holes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          hole: { type: 'INTEGER' },
          par: { type: 'INTEGER' },
          metres: { type: 'INTEGER', nullable: true },
          score: { type: 'INTEGER', nullable: true },
          putts: { type: 'INTEGER', nullable: true },
        },
        required: ['hole', 'par'],
      },
    },
    playerTotal: { type: 'INTEGER', nullable: true },
    totalPar: { type: 'INTEGER', nullable: true },
    field: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { name: { type: 'STRING' }, score: { type: 'INTEGER' } },
        required: ['name', 'score'],
      },
    },
    notes: { type: 'STRING' },
  },
  required: ['courseName', 'date', 'holes', 'field', 'notes'],
}

const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(503).json({ error: 'not_configured' })

  const { file, mediaType, player } = req.body || {}
  if (!file || !/^(image\/(jpeg|png|webp|gif)|application\/pdf)$/.test(mediaType || '')) {
    return res.status(400).json({ error: 'Send { file: <base64>, mediaType: "image/jpeg" | "application/pdf" }' })
  }
  const name = String(player || 'Sophie').slice(0, 60)

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mediaType, data: file } }, { text: prompt(name) }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: SCHEMA },
      }),
    })

    if (r.status === 429) return res.status(429).json({ error: 'Busy right now. Try again in a minute.' })
    if (r.status === 401 || r.status === 403) return res.status(503).json({ error: 'not_configured' })
    if (!r.ok) return res.status(502).json({ error: `Results reader error (${r.status})` })

    const data = await r.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
    let out
    try { out = JSON.parse(text) } catch { out = null }
    if (!out) return res.status(422).json({ error: 'Could not read that sheet. Try a clearer photo or type the scores in.' })

    const holes = (out.holes || [])
      .filter((h) => int(h.par, 3, 6))
      .sort((a, b) => a.hole - b.hole)
      .map((h) => ({ par: h.par, metres: int(h.metres, 30, 600), score: int(h.score, 1, 15), putts: int(h.putts, 0, 6) }))
    return res.status(200).json({
      courseName: out.courseName || '',
      date: /^\d{4}-\d{2}-\d{2}$/.test(out.date || '') ? out.date : '',
      holes: holes.length === 9 || holes.length === 18 ? holes : [],
      playerTotal: int(out.playerTotal, 20, 200),
      totalPar: int(out.totalPar, 27, 80),
      field: (out.field || []).filter((p) => int(p.score, 20, 200)).map((p) => ({ name: String(p.name || '').trim(), score: p.score })),
      notes: out.notes || '',
    })
  } catch {
    return res.status(500).json({ error: 'Results reader failed' })
  }
}
