// Distances are converted from the booklets' feet and yards to metres.
// U.S. Kids Golf Player Pathway, Levels 1–5, taken from the Level 1–3 Player
// Pathway booklets and the Level 4 and Level 5 assessment sheets.
//
// Each level has five checkpoints (one Achievement Pin each). A checkpoint is
// made of sections; each section has "forms" (say it and show it) and
// "skills" (tests done with the coach).
//
// Skill test types:
//   makes   – N attempts, need at least `need` successes        (tap each ball ✓ / ✗)
//   strokes – hole all N balls in `max` strokes or fewer          (tap each ball's strokes)
//   grid    – stations × rounds of strokes, total `max` or fewer  (Level 4/5 putting)
//   chipout – stations, chip/pitch then putt out, total `max` or fewer
//   holes   – play a hole from a distance, score `target` or less `times` times
//   nine    – play 9 holes, score `target` or less `times` times (uses logged rounds too)

export const CHECKPOINTS = [
  { id: 'putting', name: 'Putting', emoji: '⛳' },
  { id: 'aroundGreen', name: 'Around the Green', emoji: '🏖️' },
  { id: 'fullSwing', name: 'Full Swing', emoji: '🏌️‍♀️' },
  { id: 'knowledge', name: 'Knowledge', emoji: '🧠' },
  { id: 'scoring', name: 'Scoring', emoji: '🏆' },
]

const makes = (id, name, detail, need, attempts = 5) => ({ id, name, detail, type: 'makes', attempts, need })
const strokes = (id, name, detail, max, balls = 5) => ({ id, name, detail, type: 'strokes', balls, max })

const KNOWLEDGE_1_3 = (equipment, sportsmanship) => [
  {
    id: 'kn',
    title: 'Knowledge',
    forms: [
      { id: 'etiquette', name: 'Etiquette quiz – 5 of 5 right' },
      { id: 'rules', name: 'Rules quiz – 5 of 5 right' },
      { id: 'equipment', name: equipment },
      { id: 'sportsmanship', name: sportsmanship },
    ],
    skills: [],
  },
]

const KNOWLEDGE_4_5 = [
  {
    id: 'kn',
    title: 'Equipment, Rules & Etiquette',
    forms: [
      { id: 'equipment', name: 'Equipment questions' },
      { id: 'rules', name: 'Rules questions' },
      { id: 'etiquette', name: 'Etiquette questions' },
      { id: 'quiz', name: 'Answer 5 of 5 questions right out loud' },
    ],
    skills: [],
  },
]

export const LEVELS = [
  {
    level: 1,
    color: '#1d4ea8',
    blurb: 'Learning the basics. Short game first, then the full swing.',
    checkpoints: {
      putting: [
        {
          id: 'putt',
          title: 'Putting',
          forms: [
            { id: 'thumbs', name: 'Thumbs on Top' },
            { id: 'ysetup', name: 'The “Y” Setup' },
            { id: 'eyes', name: 'Eyes Over the Ball' },
            { id: 'bsft', name: 'Backswing = Follow-through' },
          ],
          skills: [
            makes('short', 'Short Putt', '0.6 m, flat green. Make 3 of 5.', 3),
            strokes('medium', 'Medium Putt', '5 balls from 3 m. Hole all 5 in 12 strokes or less.', 12),
          ],
        },
      ],
      aroundGreen: [
        {
          id: 'chip',
          title: 'Chipping',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball in the Middle' },
            { id: 'bsft', name: 'Backswing = Follow-through' },
            { id: 'brush', name: 'Brush the Grass' },
          ],
          skills: [makes('short', 'Short Chip', '6 m from the hole. 3 of 5 finish within 2.4 m.', 3)],
        },
        {
          id: 'pitch',
          title: 'Pitching',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball in the Middle' },
            { id: 'ltol', name: 'Little “L” to Little “L”' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'finish', name: 'Stick the Finish | Show Some Shoe' },
          ],
          skills: [makes('short', 'Short Pitch', '9 m from the green. Land and stay on in 2 of 5.', 2)],
        },
        {
          id: 'sand',
          title: 'Sand',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ballfwd', name: 'Ball Forward | Open the Clubface' },
            { id: 'ltol', name: 'Little “L” to Little “L”' },
            { id: 'splash', name: 'Splash the Sand' },
            { id: 'finish', name: 'Stick the Finish' },
          ],
          skills: [makes('sand', 'Sand Splash', 'No ball. Splash sand out of the bunker 3 of 5.', 3)],
        },
      ],
      fullSwing: [
        {
          id: 'full',
          title: 'Full Swing',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup' },
            { id: 'ytol', name: '“Y” to “L”' },
            { id: 'release', name: 'Release the “L” | Brush the Grass' },
            { id: 'finish', name: 'Stick the Finish | Show Some Shoe' },
          ],
          skills: [makes('iron', 'Full Swing Shot', 'Yard Club or 8-iron off a tee. Fly it 23 m, 3 of 5.', 3)],
        },
      ],
      knowledge: KNOWLEDGE_1_3('Name the 3 club types and parts of a club', 'Show Respect for the Course'),
      scoring: [
        {
          id: 'score',
          title: 'Playing the Course',
          forms: [],
          skills: [{ id: 'hole', name: '46 m hole', detail: 'Score 6 or less, 3 times, from 46 m.', type: 'holes', metres: 46, target: 6, times: 3 }],
        },
      ],
    },
  },
  {
    level: 2,
    color: '#e8590c',
    blurb: 'Longer putts, aiming the train and the driver.',
    checkpoints: {
      putting: [
        {
          id: 'putt',
          title: 'Putting',
          forms: [
            { id: 'thumbs', name: 'Thumbs on Top' },
            { id: 'ysetup', name: 'The “Y” Setup' },
            { id: 'eyes', name: 'Eyes Over the Ball' },
            { id: 'bsft', name: 'Backswing = Follow-through' },
            { id: 'sml', name: 'Short, Medium, Long Putt' },
            { id: 'train', name: 'Aim the Train' },
            { id: 'spot', name: 'Aim at a Spot (for break)' },
          ],
          skills: [
            makes('short', 'Short Putt', '0.6 m, flat green. Make 4 of 5.', 4),
            strokes('medium', 'Medium Putt', '5 balls from 6 m, gentle slope. Hole all 5 in 13 or less.', 13),
            strokes('long', 'Long Putt', '5 balls from 12 m, flat. Hole all 5 in 16 or less.', 16),
          ],
        },
      ],
      aroundGreen: [
        {
          id: 'chip',
          title: 'Chipping',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball in the Middle' },
            { id: 'bsft', name: 'Backswing = Follow-through' },
            { id: 'sm', name: 'Short and Medium Chip' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'train', name: 'Aim the Train' },
          ],
          skills: [
            makes('short', 'Short Chip', '6 m from the hole. 4 of 5 within 2.4 m.', 4),
            makes('medium', 'Medium Chip', '12 m from the hole. 2 of 5 within 2.4 m.', 2),
          ],
        },
        {
          id: 'pitch',
          title: 'Pitching',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball in the Middle' },
            { id: 'ltol', name: 'Little “L” to Little “L”' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'finish', name: 'Stick the Finish | Show Some Shoe' },
            { id: 'train', name: 'Aim the Train' },
          ],
          skills: [makes('short', 'Short Pitch', '9 m from the green. Land and stay on in 2 of 5.', 2)],
        },
        {
          id: 'sand',
          title: 'Sand',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball Forward' },
            { id: 'notouch', name: 'Don’t Touch the Sand' },
            { id: 'ytol', name: '“Y” to “L”' },
            { id: 'splash', name: 'Splash the Sand' },
            { id: 'finish', name: 'Stick the Finish | Show Some Shoe' },
          ],
          skills: [makes('sand', 'Sand Shot', '5 balls in a shallow bunker. Get out 2 of 5.', 2)],
        },
      ],
      fullSwing: [
        {
          id: 'full',
          title: 'Full Swing',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball Positions' },
            { id: 'ytol', name: '“Y” to “L”' },
            { id: 'release', name: 'Release the “L” | Brush the Grass' },
            { id: 'finish', name: 'Stick the Finish | Show Some Shoe' },
            { id: 'train', name: 'Aim the Train' },
          ],
          skills: [
            makes('iron', 'Iron Shot', '7 or 8-iron off the ground. Fly it 23 m, 3 of 5.', 3),
            makes('driver', 'Driver Shot', 'Driver off a tee. Fly it 37 m, 3 of 5.', 3),
          ],
        },
      ],
      knowledge: KNOWLEDGE_1_3('Name the parts of a clubhead', 'Show Respect for Others'),
      scoring: [
        {
          id: 'score',
          title: 'Playing the Course',
          forms: [],
          skills: [{ id: 'hole', name: '91 m hole', detail: 'Score 6 or less, 3 times, from 91 m.', type: 'holes', metres: 91, target: 6, times: 3 }],
        },
      ],
    },
  },
  {
    level: 3,
    color: '#c92a2a',
    blurb: 'Reading greens and building a routine for every shot.',
    checkpoints: {
      putting: [
        {
          id: 'putt',
          title: 'Putting',
          forms: [
            { id: 'thumbs', name: 'Thumbs on Top' },
            { id: 'ysetup', name: 'The “Y” Setup' },
            { id: 'eyes', name: 'Eyes Over the Ball' },
            { id: 'sml', name: 'Short, Medium, Long Putt' },
            { id: 'spot', name: 'Aim the Train at a Spot' },
            { id: 'tworead', name: 'Reading the Green | Two Point Read' },
            { id: 'routine', name: 'Putting Routine' },
          ],
          skills: [
            makes('short', 'Short Putt', '0.6 m, flat green. Make 5 of 5.', 5),
            strokes('medium', 'Medium Putt', '5 balls from 6 m, right-to-left break. All 5 in 12 or less.', 12),
            strokes('opposite', 'Opposite Side', '5 balls from 6 m, left-to-right break. All 5 in 12 or less.', 12),
            strokes('long', 'Long Putt', '5 balls from 12 m, flat. All 5 in 13 or less.', 13),
          ],
        },
      ],
      aroundGreen: [
        {
          id: 'chip',
          title: 'Chipping',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball in the Middle' },
            { id: 'bsft', name: 'Backswing = Follow-through' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'sm', name: 'Short and Medium Chip' },
            { id: 'routine', name: 'Chipping Routine' },
            { id: 'choke', name: 'Choke Down' },
            { id: 'finish', name: 'Stick the Finish and Be Still' },
          ],
          skills: [
            makes('short', 'Short Chip', '6 m from the hole. 5 of 5 within 2.4 m.', 5),
            makes('medium', 'Medium Chip', '12 m from the hole. 3 of 5 within 2.4 m.', 3),
          ],
        },
        {
          id: 'pitch',
          title: 'Pitching',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball in the Middle' },
            { id: 'ltol', name: 'Little “L” to Little “L”' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'medium', name: 'Medium Pitch' },
            { id: 'routine', name: 'Pitching Routine' },
            { id: 'finish', name: 'Stick the Finish | Show Some Shoe' },
          ],
          skills: [
            makes('short', 'Short Pitch', '9 m from the green. Land and stay on 3 of 5.', 3),
            makes('medium', 'Medium Pitch', '18 m from the green. Land and stay on 2 of 5.', 2),
          ],
        },
        {
          id: 'sand',
          title: 'Sand',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'notouch', name: 'Don’t Touch the Sand' },
            { id: 'routine', name: 'Sand Routine' },
            { id: 'open', name: 'Open Stance | Swing Parallel' },
            { id: 'splash', name: 'Splash the Sand Under the Ball' },
            { id: 'finish', name: 'Stick the Finish' },
          ],
          skills: [makes('sand', 'Sand Shot', '5 balls in a shallow bunker. Out 3 of 5, with 1 staying on the green.', 3)],
        },
      ],
      fullSwing: [
        {
          id: 'full',
          title: 'Full Swing',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup | Ball Positions' },
            { id: 'train', name: 'Aim the Train' },
            { id: 'ytol', name: '“Y” to “L”' },
            { id: 'release', name: 'Release the “L” | Brush the Grass' },
            { id: 'finish', name: 'Stick the Finish | Show Some Shoe' },
            { id: 'routine', name: 'Full Swing Routine' },
          ],
          skills: [
            makes('iron', 'Iron Shot', '6, 7 or 8-iron off the ground. Fly it 37 m, 3 of 5.', 3),
            makes('driver', 'Driver Shot', 'Driver off a tee. Fly it 55 m, 3 of 5.', 3),
          ],
        },
      ],
      knowledge: KNOWLEDGE_1_3('Clubs that fit my size and swing speed', 'Show Respect for Yourself'),
      scoring: [
        {
          id: 'score',
          title: 'Playing the Course',
          forms: [],
          skills: [{ id: 'hole', name: '137 m hole', detail: 'Score 6 or less, 3 times, from 137 m.', type: 'holes', metres: 137, target: 6, times: 3 }],
        },
      ],
    },
  },
  {
    level: 4,
    color: '#2f9e44',
    blurb: 'Onto the course: 9 holes at about 1,234 m.',
    checkpoints: {
      putting: [
        {
          id: 'putt',
          title: 'Putting',
          forms: [
            { id: 'tworead', name: 'Reading the Green: Two Point Read' },
            { id: 'target', name: 'Find Your Target' },
            { id: 'practice', name: 'Practice the Stroke You Will Use' },
            { id: 'thumbs', name: 'Thumbs on Top' },
            { id: 'ysetup', name: 'The “Y” Setup / Eyes Over the Ball' },
            { id: 'train', name: 'Aim the Train at a Spot' },
            { id: 'bsft', name: 'Backswing = FT: Short, Medium, Long Putt' },
            { id: 'mark', name: 'Mark the Ball' },
            { id: 'still', name: 'Be Still and Stick the Finish' },
          ],
          skills: [
            {
              id: 'combine',
              name: 'Putting Skills Test',
              detail: '4 stations × 3 rounds: 0.9 m merry-go-round, 6 m on a slope, 6 m opposite side, 12 m. Combined 29 or less.',
              type: 'grid',
              stations: ['0.9 m', '6 m', '6 m opp', '12 m'],
              rounds: 3,
              max: 29,
            },
          ],
        },
      ],
      aroundGreen: [
        {
          id: 'chip',
          title: 'Chipping',
          forms: [
            { id: 'target', name: 'Find the Target' },
            { id: 'club', name: 'Select the Club' },
            { id: 'practice', name: 'Practice Swing You Will Use' },
            { id: 'hotdog', name: 'Hotdog in a Bun' },
            { id: 'ysetup', name: '“Y” Setup, Ball in Middle' },
            { id: 'train', name: 'Aim the Train at a Spot' },
            { id: 'bsft', name: 'Backswing = FT / Short, Medium Chip' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'still', name: 'Stick the Finish and Be Still' },
            { id: 'lie', name: 'Reading the Lie' },
            { id: 'green', name: 'Reading the Green' },
            { id: 'long', name: '“Y” Swing / Long Chip' },
          ],
          skills: [
            {
              id: 'chipout',
              name: 'Chip & Putt Out',
              detail: 'Chip from 6, 12 and 18 m, then putt out. Total 11 or less.',
              type: 'chipout',
              stations: ['6 m', '12 m', '18 m'],
              max: 11,
            },
          ],
        },
        {
          id: 'pitch',
          title: 'Pitching',
          forms: [
            { id: 'target', name: 'Find the Target' },
            { id: 'club', name: 'Select the Club' },
            { id: 'practice', name: 'Practice the Swing You Will Use' },
            { id: 'hotdog', name: 'Hotdog in a Bun' },
            { id: 'ysetup', name: '“Y” Setup / Ball in the Middle' },
            { id: 'train', name: 'Aim the Train at a Spot' },
            { id: 'bsft', name: 'Backswing = FT / Short, Medium Pitch' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'finish', name: 'Stick the Finish / Show Some Shoe' },
            { id: 'lie', name: 'Reading the Lie' },
            { id: 'long', name: 'Long Pitch' },
          ],
          skills: [
            {
              id: 'pitchout',
              name: 'Pitch & Putt Out',
              detail: 'Pitch from 9, 18 and 27 m, then putt out. Total 12 or less.',
              type: 'chipout',
              stations: ['9 m', '18 m', '27 m'],
              max: 12,
            },
          ],
        },
        {
          id: 'sand',
          title: 'Sand',
          forms: [
            { id: 'practice', name: 'Practice the Swing You Will Use' },
            { id: 'enter', name: 'Enter the Bunker' },
            { id: 'lie', name: 'Determine Your Lie' },
            { id: 'notouch', name: 'Don’t Touch' },
            { id: 'ballfwd', name: 'Ball Forward / Aim the Clubface' },
            { id: 'open', name: 'Open Stance / Swing Parallel' },
            { id: 'ytol', name: '“Y” to “L”' },
            { id: 'splash', name: 'Splash the Sand Under the Ball' },
            { id: 'finish', name: 'Stick the Finish' },
            { id: 'club', name: 'Club Selection: Loft and Bounce' },
          ],
          skills: [makes('sand', 'Sand Shot', 'Out of the bunker, landing and staying on the green, 4 of 5.', 4)],
        },
      ],
      fullSwing: [
        {
          id: 'full',
          title: 'Full Swing',
          forms: [
            { id: 'hotdog', name: 'Hotdog in the Bun' },
            { id: 'ysetup', name: '“Y” Setup / Ball Positions' },
            { id: 'train', name: 'Aim the Train' },
            { id: 'ytol', name: '“Y” to “L”' },
            { id: 'release', name: 'Release the “L”' },
            { id: 'brush', name: 'Brush the Grass' },
            { id: 'finish', name: 'Stick the Finish, Show Some Shoe' },
            { id: 'routine', name: 'Full Swing Routine' },
            { id: 'posture', name: 'Posture' },
          ],
          skills: [
            makes('iron', 'Iron Shot', '6, 7 or 8-iron off the ground. Fly it 46 m, 3 of 5.', 3),
            makes('driver', 'Driver Shot', 'Driver off a tee. Fly it 69 m, 3 of 5.', 3),
          ],
        },
      ],
      knowledge: KNOWLEDGE_4_5,
      scoring: [
        {
          id: 'score',
          title: '9 Holes',
          forms: [],
          skills: [{ id: 'nine', name: '9-hole score', detail: 'Play 9 holes (about 1,234 m). Score 54 or less once.', type: 'nine', target: 54, times: 1 }],
        },
      ],
    },
  },
  {
    level: 5,
    color: '#f59f00',
    blurb: 'Plan · Setup · Play on every shot. Lower 9-hole scores.',
    checkpoints: {
      putting: [
        {
          id: 'putt',
          title: 'Putting',
          forms: [
            { id: 'mark', name: 'PLAN: Mark the Ball' },
            { id: 'tworead', name: 'PLAN: Reading the Green: Two Point Read' },
            { id: 'target', name: 'PLAN: Find Your Target' },
            { id: 'practice', name: 'PLAN: Practice the Strokes' },
            { id: 'thumbs', name: 'SETUP: Thumbs on Top' },
            { id: 'ysetup', name: 'SETUP: The “Y” Setup' },
            { id: 'eyes', name: 'SETUP: Eyes Over the Ball' },
            { id: 'train', name: 'SETUP: Aim the Train at a Spot' },
            { id: 'bsft', name: 'PLAY: Backswing = FT: Short, Medium, Long' },
            { id: 'still', name: 'PLAY: Be Still and Stick the Finish' },
          ],
          skills: [
            {
              id: 'combine',
              name: 'Putting Skills Test',
              detail: '4 stations × 3 rounds: 0.9 m merry-go-round, 6 m on a slope, 6 m opposite side, 12 m. Combined 26 or less.',
              type: 'grid',
              stations: ['0.9 m', '6 m', '6 m opp', '12 m'],
              rounds: 3,
              max: 26,
            },
          ],
        },
      ],
      aroundGreen: [
        {
          id: 'chip',
          title: 'Chipping',
          forms: [
            { id: 'lie', name: 'PLAN: Reading the Lie' },
            { id: 'green', name: 'PLAN: Reading the Green' },
            { id: 'target', name: 'PLAN: Find the Target' },
            { id: 'club', name: 'PLAN: Club Selection' },
            { id: 'practice', name: 'PLAN: Practice Swing' },
            { id: 'hotdog', name: 'SETUP: Hotdog in a Bun' },
            { id: 'ysetup', name: 'SETUP: “Y” Setup, Ball in Middle' },
            { id: 'train', name: 'SETUP: Aim the Train at a Spot' },
            { id: 'yswing', name: 'PLAY: “Y” Swing / Backswing = Follow-through' },
            { id: 'brush', name: 'PLAY: Brush the Grass' },
            { id: 'still', name: 'PLAY: Stick the Finish and Be Still' },
          ],
          skills: [
            {
              id: 'chipout',
              name: 'Chip & Putt Out',
              detail: 'Chip from 6, 12 and 18 m, then putt out. Total 10 or less.',
              type: 'chipout',
              stations: ['6 m', '12 m', '18 m'],
              max: 10,
            },
          ],
        },
        {
          id: 'pitch',
          title: 'Pitching',
          forms: [
            { id: 'lie', name: 'PLAN: Reading the Lie' },
            { id: 'target', name: 'PLAN: Find the Target' },
            { id: 'club', name: 'PLAN: Club Selection' },
            { id: 'practice', name: 'PLAN: Practice Swings' },
            { id: 'hotdog', name: 'SETUP: Hotdog in a Bun' },
            { id: 'ysetup', name: 'SETUP: “Y” Setup / Ball in the Middle' },
            { id: 'train', name: 'SETUP: Aim the Train at a Spot' },
            { id: 'ltol', name: 'PLAY: Backswing = FT / “L” to “L” Swing' },
            { id: 'brush', name: 'PLAY: Brush the Grass' },
            { id: 'finish', name: 'PLAY: Stick the Finish' },
          ],
          skills: [
            {
              id: 'pitchout',
              name: 'Pitch & Putt Out',
              detail: 'Pitch from 9, 18 and 27 m, then putt out. Total 11 or less.',
              type: 'chipout',
              stations: ['9 m', '18 m', '27 m'],
              max: 11,
            },
          ],
        },
        {
          id: 'sand',
          title: 'Sand',
          forms: [
            { id: 'club', name: 'PLAN: Club Selection: Loft and Bounce' },
            { id: 'practice', name: 'PLAN: Practice Swings' },
            { id: 'enter', name: 'PLAN: Enter the Bunker' },
            { id: 'lie', name: 'PLAN: Determine Your Lie' },
            { id: 'notouch', name: 'SETUP: Don’t Touch' },
            { id: 'hotdog', name: 'SETUP: Hotdog in a Bun' },
            { id: 'open', name: 'SETUP: Open Stance / Swing Parallel' },
            { id: 'ytol', name: 'PLAY: Backswing = FT / “Y” to “L” Swing' },
            { id: 'splash', name: 'PLAY: Splash the Sand Under the Ball' },
            { id: 'finish', name: 'PLAY: Stick the Finish' },
            { id: 'rake', name: 'PLAY: Rake the Bunker' },
          ],
          skills: [makes('sand', 'Sand Shot', 'Out of the bunker, landing and staying on the green, 5 of 5.', 5)],
        },
      ],
      fullSwing: [
        {
          id: 'full',
          title: 'Full Swing',
          forms: [
            { id: 'target', name: 'PLAN: Find Your Target' },
            { id: 'club', name: 'PLAN: Club Selection' },
            { id: 'practice', name: 'PLAN: Practice Swings' },
            { id: 'hotdog', name: 'SETUP: Hotdog in the Bun' },
            { id: 'posture', name: 'SETUP: Posture' },
            { id: 'ysetup', name: 'SETUP: “Y” Setup / Ball Positions' },
            { id: 'train', name: 'SETUP: Aim the Train at the Target' },
            { id: 'ytol', name: 'PLAY: “Y” to “L”' },
            { id: 'release', name: 'PLAY: Release the “L”' },
            { id: 'brush', name: 'PLAY: Brush the Grass' },
            { id: 'finish', name: 'PLAY: Stick the Finish, Show Some Shoe' },
          ],
          skills: [
            makes('iron', 'Iron Shot', '6, 7 or 8-iron off the ground. Fly it 55 m, 4 of 5.', 4),
            makes('driver', 'Driver Shot', 'Driver off a tee. Fly it 82 m, 4 of 5.', 4),
          ],
        },
      ],
      knowledge: KNOWLEDGE_4_5,
      scoring: [
        {
          id: 'score',
          title: '9 Holes',
          forms: [],
          skills: [{ id: 'nine', name: '9-hole score', detail: 'Play 9 holes (about 1,234 m). Score 51 or less once.', type: 'nine', target: 51, times: 1 }],
        },
      ],
    },
  },
]

// 9-hole scoring targets further up the pyramid (Player Development pyramid
// and the Pathway scoring table), used for the "next goals" ladder.
export const SCORE_LADDER = [
  { level: 4, nine: 54, note: '54 or less over 9 holes (about 1,234 m)' },
  { level: 5, nine: 51, note: '51 or less over 9 holes (about 1,234 m)' },
  { level: 6, nine: 48, note: 'Playing local tours. 48 for 9 holes' },
  { level: 7, nine: 45, note: 'Local tour and multi-day events. 45 for 9' },
  { level: 8, nine: 42, note: '42 or better, twice' },
  { level: 9, nine: 39, note: 'Elite: 39 or better, 3 times' },
  { level: 10, nine: 36, note: 'Par or better: 36, 3 times' },
]

export const getLevel = (n) => LEVELS.find((l) => l.level === n)

export const formKey = (level, cp, section, form) => `L${level}.${cp}.${section}.${form}`
export const skillKey = (level, cp, section, skill) => `L${level}.${cp}.${section}.${skill}`

export function findSkill(key) {
  const [lv, cp, sec, sk] = key.split('.')
  const level = getLevel(Number(lv.slice(1)))
  const section = level?.checkpoints[cp]?.find((s) => s.id === sec)
  const skill = section?.skills.find((s) => s.id === sk)
  return skill ? { level, cpId: cp, section, skill } : null
}
