// Writes an encouraging, positives-only note to Sophie from her tournament facts,
// with Google Gemini. Needs GEMINI_API_KEY in Vercel. GEMINI_MODEL is optional.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const prompt = (facts, extra) => `Write a short letter to Sophie, a 9-year-old girl who plays junior golf on the U.S. Kids Golf Melbourne Local Tour (Australia). A parent will print it, fold it into a small card and hand it to her.

Rules:
- Celebrate only what she did well. No "areas to improve", no "next time fix", no criticism, nothing about mistakes, even gently.
- Never compare her with other players or mention where she finished, unless she won.
- Use only the facts below. Don't invent shots, holes, scores or places.
- Never mention shot tracking, dots or maps.
- When you talk about her swing, the message is: trust your speed, pick a clear target and hold your finish. Never tell her to slow down, steer it or "be more controlled".
- Warm, excited, simple words a 9-year-old reads easily. Australian spelling. Distances in metres.
- 3 or 4 short sections, each with a heading of a few words and 2 or 3 short points (one or two sentences each).
- title: a short, fun headline. intro: 2 or 3 sentences. closing: 2 sentences looking ahead with excitement.

Facts:
${facts}
${extra ? `\nThings the parent wants included:\n${extra}\n` : ''}`

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    intro: { type: 'STRING' },
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { heading: { type: 'STRING' }, points: { type: 'ARRAY', items: { type: 'STRING' } } },
        required: ['heading', 'points'],
      },
    },
    closing: { type: 'STRING' },
  },
  required: ['title', 'intro', 'sections', 'closing'],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(503).json({ error: 'not_configured' })

  const facts = String(req.body?.facts || '').slice(0, 6000)
  const extra = String(req.body?.extra || '').slice(0, 2000)
  if (!facts) return res.status(400).json({ error: 'Send { facts, extra }' })

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt(facts, extra) }] }],
        generationConfig: { temperature: 0.8, responseMimeType: 'application/json', responseSchema: SCHEMA },
      }),
    })
    if (r.status === 429) return res.status(429).json({ error: 'Busy right now. Try again in a minute.' })
    if (r.status === 401 || r.status === 403) return res.status(503).json({ error: 'not_configured' })
    if (!r.ok) return res.status(502).json({ error: `Letter writer error (${r.status})` })
    const data = await r.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
    let out
    try { out = JSON.parse(text) } catch { out = null }
    if (!out?.sections?.length) return res.status(422).json({ error: 'Could not write the letter. Try again.' })
    return res.status(200).json({
      title: String(out.title || ''),
      intro: String(out.intro || ''),
      sections: out.sections.slice(0, 5).map((s) => ({ heading: String(s.heading || ''), points: (s.points || []).map(String).slice(0, 4) })),
      closing: String(out.closing || ''),
    })
  } catch {
    return res.status(500).json({ error: 'Letter writer failed' })
  }
}
