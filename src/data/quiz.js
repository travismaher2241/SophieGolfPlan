// Rules of Golf (current R&A / USGA rules) and etiquette questions pitched
// at junior level. `answer` is the index of the right option in `options`;
// options are shuffled when shown.

export const QUIZ_CATEGORIES = [
  { id: 'mix', label: '🎲 Mix' },
  { id: 'rules', label: '📘 Rules' },
  { id: 'etiquette', label: '🤝 Etiquette' },
]

export const QUESTIONS = [
  // ---------- Rules ----------
  { id: 'r-clubs', cat: 'rules', q: 'What is the most clubs you can carry in your bag?', options: ['14', '12', '16', 'As many as you like'], answer: 0, why: 'You can carry up to 14 clubs.' },
  { id: 'r-tee-box', cat: 'rules', q: 'Where can you tee up your ball on the tee?', options: ['Between the markers and up to two club-lengths behind them', 'Anywhere in front of the markers', 'Anywhere on the tee box', 'Right next to the markers only'], answer: 0, why: 'The teeing area is between the front of the tee markers and two club-lengths back.' },
  { id: 'r-ob-stakes', cat: 'rules', q: 'What colour stakes or lines show out of bounds?', options: ['White', 'Red', 'Yellow', 'Blue'], answer: 0, why: 'White stakes or lines mark out of bounds.' },
  { id: 'r-ob-penalty', cat: 'rules', q: 'Your ball goes out of bounds. What do you do?', options: ['Add 1 penalty stroke and play again from where you last hit', 'Drop where it went out with no penalty', 'Add 2 strokes and drop on the fairway', 'Keep playing it from out of bounds'], answer: 0, why: 'That is called stroke and distance: 1 penalty stroke and replay from where you hit.' },
  { id: 'r-lost', cat: 'rules', q: 'How long can you search for a lost ball?', options: ['3 minutes', '5 minutes', '1 minute', 'As long as it takes'], answer: 0, why: 'You have 3 minutes to find your ball.' },
  { id: 'r-provisional', cat: 'rules', q: 'You think your ball might be lost. What can you hit to save time?', options: ['A provisional ball (say "provisional" first)', 'A mulligan', 'A free practice ball', 'Nothing, you must go and look first'], answer: 0, why: 'Tell your group you are playing a "provisional" ball, then hit it before you go looking.' },
  { id: 'r-red', cat: 'rules', q: 'What colour stakes mark a penalty area where you can also drop beside where your ball crossed the edge?', options: ['Red', 'Yellow', 'White', 'Green'], answer: 0, why: 'Red penalty areas give you the extra sideways option. Yellow ones do not.' },
  { id: 'r-penalty-area', cat: 'rules', q: 'Your ball lands in a pond (penalty area) and you take relief. What is the penalty?', options: ['1 stroke', 'No penalty', '2 strokes', 'You lose the hole'], answer: 0, why: 'Taking relief from a penalty area costs 1 stroke.' },
  { id: 'r-pa-play', cat: 'rules', q: 'Can you play your ball as it lies inside a penalty area?', options: ['Yes, with no penalty', 'No, never', 'Only with a 1 stroke penalty', 'Only if it is a red area'], answer: 0, why: 'If you can hit it, you may play it as it lies with no penalty.' },
  { id: 'r-unplayable', cat: 'rules', q: 'Your ball is stuck under a bush. If you call it unplayable, what is the penalty?', options: ['1 stroke', '2 strokes', 'No penalty', 'You must play it'], answer: 0, why: 'An unplayable ball costs 1 stroke, and you choose one of the relief options.' },
  { id: 'r-drop', cat: 'rules', q: 'How high do you drop a ball when taking relief?', options: ['From knee height', 'From shoulder height', 'From waist height', 'Just place it down'], answer: 0, why: 'Drop straight down from knee height.' },
  { id: 'r-path', cat: 'rules', q: 'Your ball stops on a cart path. What can you do?', options: ['Take free relief: drop within one club-length of the nearest spot off the path, not nearer the hole', 'Add 1 stroke and drop', 'You must play it from the path', 'Move it anywhere on the fairway'], answer: 0, why: 'A cart path is an immovable obstruction, so relief is free.' },
  { id: 'r-gur', cat: 'rules', q: 'Your ball is in an area marked "Ground Under Repair". Do you get free relief?', options: ['Yes', 'No', 'Only with a penalty', 'Only on the green'], answer: 0, why: 'Ground under repair is an abnormal course condition, so relief is free.' },
  { id: 'r-embedded', cat: 'rules', q: 'Your ball plugs in its own pitch mark on the fairway. What can you do?', options: ['Take free relief right behind the spot', 'Add 1 stroke and drop', 'Play it as it lies only', 'Re-tee'], answer: 0, why: 'An embedded ball in the general area gets free relief.' },
  { id: 'r-bunker-touch', cat: 'rules', q: 'Can you touch the sand with your club on a practice swing in a bunker?', options: ['No, it is a 2 stroke penalty', 'Yes, that is fine', 'Only behind the ball', 'Yes, but only once'], answer: 0, why: 'Testing the sand with practice swings or grounding the club right behind the ball costs 2 strokes.' },
  { id: 'r-bunker-leaf', cat: 'rules', q: 'There is a leaf next to your ball in the bunker. Can you move it?', options: ['Yes, as long as your ball does not move', 'No, never', 'Only with a 1 stroke penalty', 'Only on the green'], answer: 0, why: 'Loose things like leaves and twigs can be removed, even in a bunker. Just don\'t move your ball.' },
  { id: 'r-flag', cat: 'rules', q: 'Can you putt with the flagstick still in the hole?', options: ['Yes, no penalty', 'No, it is 2 strokes', 'Only from off the green', 'Only if it is windy'], answer: 0, why: 'You can leave the flagstick in or take it out. Your choice.' },
  { id: 'r-mark', cat: 'rules', q: 'Your ball is on the green. Can you mark it, pick it up and clean it?', options: ['Yes', 'No', 'Only if it is muddy', 'Only on the last hole'], answer: 0, why: 'On the green you may mark, lift and clean your ball. Always mark it first.' },
  { id: 'r-spike', cat: 'rules', q: 'Can you fix spike marks and pitch marks on the green before you putt?', options: ['Yes', 'No, only after the hole', 'Only pitch marks', 'Only with permission'], answer: 0, why: 'You can repair almost any damage on the green, including spike marks.' },
  { id: 'r-order', cat: 'rules', q: 'After everyone tees off, who plays first?', options: ['The player farthest from the hole', 'The player closest to the hole', 'The youngest player', 'Whoever is ready'], answer: 0, why: 'The player "away" (farthest from the hole) plays first, although ready golf is fine in casual stroke play.' },
  { id: 'r-wrong-ball', cat: 'rules', q: 'In stroke play you hit someone else\'s ball by mistake. What happens?', options: ['2 stroke penalty, then play your own ball', 'No penalty', '1 stroke penalty', 'You keep playing their ball'], answer: 0, why: 'Playing a wrong ball costs 2 strokes, and you must go back and play your own ball.' },
  { id: 'r-advice', cat: 'rules', q: 'In a tournament, can you ask another player which club they hit?', options: ['No, that is asking for advice and costs 2 strokes', 'Yes, anytime', 'Only on par 3s', 'Only if they are your friend'], answer: 0, why: 'You can only ask your caddie (or partner) for advice, not other players.' },
  { id: 'r-double-hit', cat: 'rules', q: 'You accidentally hit the ball twice in one swing. How many strokes do you count?', options: ['1 stroke', '2 strokes', '3 strokes', 'You replay the shot'], answer: 0, why: 'An accidental double hit is just one stroke with no penalty.' },
  { id: 'r-hits-you', cat: 'rules', q: 'Your ball bounces off a tree and accidentally hits you. What is the penalty?', options: ['No penalty, play it where it stops', '1 stroke', '2 strokes', 'Replay the shot'], answer: 0, why: 'There is no penalty if your ball accidentally hits you or your equipment.' },
  { id: 'r-ball-moves', cat: 'rules', q: 'On the green you accidentally knock your ball while marking it. What do you do?', options: ['Put it back with no penalty', 'Add 1 stroke', 'Play it from where it stopped', 'Add 2 strokes'], answer: 0, why: 'Accidentally moving your ball on the green is no penalty. Just replace it.' },
  { id: 'r-score', cat: 'rules', q: 'What happens if you sign for a LOWER score than you really had on a hole?', options: ['You are disqualified', 'Nothing', '1 stroke penalty', 'The score is fixed for you'], answer: 0, why: 'Always check your card. A lower score than you took means disqualification. A higher one stands.' },
  { id: 'r-penalties-count', cat: 'rules', q: 'Do penalty strokes count in your score for the hole?', options: ['Yes, always add them', 'No', 'Only in tournaments', 'Only on par 5s'], answer: 0, why: 'Your score is every stroke you made plus any penalty strokes.' },
  { id: 'r-ball-sides', cat: 'rules', q: 'Before you start, why should you put your own mark on your ball?', options: ['So you can tell it is yours', 'To make it fly further', 'It is required to tee off', 'To show it is new'], answer: 0, why: 'A personal mark helps you avoid playing a wrong ball.' },

  // ---------- Etiquette ----------
  { id: 'e-quiet', cat: 'etiquette', q: 'What should you do when someone is about to hit?', options: ['Stand still and stay quiet', 'Practise your swing', 'Walk to your ball', 'Talk quietly'], answer: 0, why: 'Being still and silent helps them concentrate.' },
  { id: 'e-where', cat: 'etiquette', q: 'Where is the best place to stand when someone is hitting?', options: ['Off to the side, facing them, well out of their way', 'Right behind them', 'In front of them', 'Close beside their bag'], answer: 0, why: 'Stand to the side where they can see you and you are safe.' },
  { id: 'e-fore', cat: 'etiquette', q: 'Your ball is heading toward other people. What do you shout?', options: ['"Fore!"', '"Look out!"', '"Ball!"', 'Nothing'], answer: 0, why: 'Shout "Fore!" loudly so people can protect themselves.' },
  { id: 'e-safety', cat: 'etiquette', q: 'Before a practice swing, what should you always check?', options: ['That nobody is close to you', 'Which way the wind blows', 'Your score', 'That your shoes are tied'], answer: 0, why: 'Always look around first. Clubs can hurt people.' },
  { id: 'e-wait', cat: 'etiquette', q: 'When should you hit your shot toward the group in front?', options: ['Only when they are well out of your range', 'As soon as they leave the tee', 'When they are on the green', 'Whenever you are ready'], answer: 0, why: 'Wait until you could not possibly reach them.' },
  { id: 'e-line', cat: 'etiquette', q: 'On the green, what should you avoid stepping on?', options: ['Another player\'s putting line', 'The fringe', 'Your own ball marker', 'The flagstick'], answer: 0, why: 'Walking on someone\'s line can make footprints that change their putt.' },
  { id: 'e-shadow', cat: 'etiquette', q: 'Where should your shadow NOT be when someone is putting?', options: ['Across their line or the hole', 'Behind you', 'On the fringe', 'It doesn\'t matter'], answer: 0, why: 'A shadow on their line can be distracting.' },
  { id: 'e-rake', cat: 'etiquette', q: 'What should you do after hitting out of a bunker?', options: ['Rake your footprints and the hole you made', 'Leave it for the greenkeeper', 'Kick sand over it', 'Rake only if it is a tournament'], answer: 0, why: 'Leave the bunker smooth for the next player.' },
  { id: 'e-divot', cat: 'etiquette', q: 'You take a divot on the fairway. What should you do?', options: ['Replace it or fill it with sand', 'Leave it', 'Throw it in the bushes', 'Take it home'], answer: 0, why: 'Fixing divots keeps the course nice for everyone.' },
  { id: 'e-pitch', cat: 'etiquette', q: 'What should you do with the dent (pitch mark) your ball makes on the green?', options: ['Fix it with a pitch mark tool', 'Leave it', 'Step on it hard', 'Tell the next group'], answer: 0, why: 'Push the edges in toward the middle, then tap it flat.' },
  { id: 'e-flag', cat: 'etiquette', q: 'How should you put the flagstick down?', options: ['Lay it gently on the green or fringe, off everyone\'s line', 'Drop it anywhere', 'Throw it to the side', 'Stick it in the fringe'], answer: 0, why: 'Being gentle protects the green.' },
  { id: 'e-honour', cat: 'etiquette', q: 'Who has "the honour" and tees off first on the next hole?', options: ['The player with the lowest score on the last hole', 'The player with the highest score', 'The oldest player', 'Whoever gets there first'], answer: 0, why: 'The best score on the previous hole goes first.' },
  { id: 'e-pace', cat: 'etiquette', q: 'How can you help keep a good pace of play?', options: ['Be ready to hit when it is your turn', 'Take lots of practice swings', 'Wait until it is your turn to pick a club', 'Look for lost balls for 10 minutes'], answer: 0, why: 'Plan your shot while others play, then hit when it\'s your turn.' },
  { id: 'e-score-where', cat: 'etiquette', q: 'Where should you write down your scores after a hole?', options: ['At the next tee', 'On the green', 'While walking off the green', 'At the end of the round'], answer: 0, why: 'Leave the green quickly so the next group can play, then write scores at the next tee.' },
  { id: 'e-bag', cat: 'etiquette', q: 'Where is the best place to leave your bag near the green?', options: ['To the side of the green nearest the next tee', 'On the green', 'In front of the green', 'In a bunker'], answer: 0, why: 'You can grab it and head straight to the next tee.' },
  { id: 'e-through', cat: 'etiquette', q: 'A faster group is waiting behind you. What is the polite thing to do?', options: ['Let them play through', 'Walk faster but don\'t let them pass', 'Ignore them', 'Ask them to wait'], answer: 0, why: 'Waving faster groups through keeps everyone happy.' },
  { id: 'e-temper', cat: 'etiquette', q: 'You hit a bad shot. What does a true champion do?', options: ['Stay calm and focus on the next shot', 'Throw the club', 'Shout and complain', 'Quit the hole'], answer: 0, why: 'Respect for yourself and others means staying calm. Every golfer hits bad shots.' },
  { id: 'e-phone', cat: 'etiquette', q: 'What should you do with a phone on the course?', options: ['Put it on silent', 'Play music out loud', 'Take calls on the tee', 'Leave the sound on for games'], answer: 0, why: 'Noise can put other players off.' },
  { id: 'e-greens', cat: 'etiquette', q: 'Can you take a buggy or push trolley onto the green?', options: ['No, keep them off greens and tees', 'Yes', 'Only if it is light', 'Only on par 3s'], answer: 0, why: 'Wheels damage the greens.' },
  { id: 'e-handshake', cat: 'etiquette', q: 'What should you do at the end of a round?', options: ['Shake hands and thank your playing partners', 'Leave straight away', 'Tell everyone your score', 'Only talk to the winner'], answer: 0, why: 'Thanking your group shows great sportsmanship.' },
  { id: 'e-honest', cat: 'etiquette', q: 'Is it ever OK to miscount your score?', options: ['No, always count every stroke honestly', 'Yes, if nobody saw', 'Yes, on practice rounds', 'Only by one stroke'], answer: 0, why: 'Golf is a game of honesty. You call penalties on yourself.' },
  { id: 'e-dress', cat: 'etiquette', q: 'Do some golf clubs have a dress code?', options: ['Yes, so check before you play', 'No, never', 'Only for adults', 'Only in tournaments'], answer: 0, why: 'Many clubs ask for collared shirts and golf shoes.' },
]

export const QUIZ_LENGTH = 10

export function buildQuiz(cat) {
  const pool = QUESTIONS.filter((q) => cat === 'mix' || q.cat === cat)
  return shuffle(pool).slice(0, QUIZ_LENGTH).map((q) => {
    const order = shuffle(q.options.map((_, i) => i))
    return { ...q, shown: order.map((i) => q.options[i]), correct: order.indexOf(q.answer) }
  })
}

function shuffle(xs) {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
