/* ═══════════════════════════════════════════════════════════════════
   NOVA AI — app.js
   HOW TO READ THIS FILE:
   Each section is labelled. To add a new feature, find the right
   section and follow the pattern already there.
═══════════════════════════════════════════════════════════════════ */

// ════════════════════════════════════════════════════════════════
// SECTION 1 — CONFIGURATION
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   - Get your FREE Groq API key at: https://console.groq.com
//   - Sign up → "API Keys" → "Create API Key" → paste below
//   - Change SYSTEM_PROMPT to make the AI answer differently
//   - Change MAX_TOKENS to get longer/shorter answers

const CONFIG = {
  // 🔑 Paste your free Groq API key here
  GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE',

  // AI model — this is free and very fast
  GROQ_MODEL: 'llama3-8b-8192',

  // Max words in AI answer (increase for longer answers)
  MAX_TOKENS: 400,

  // Speech language
  SPEECH_LANG: 'en-US',

  // Max history items to save
  MAX_HISTORY: 60,

  // ✏️ Change this to control how the AI responds
  SYSTEM_PROMPT: `You are NOVA, a concise and helpful AI voice assistant.
Rules you must follow:
- Keep all answers under 4 sentences unless explaining a law/formula
- For scientific laws and theories: state the name, definition, and a real-world example
- For historical facts: give the key dates and significance
- For math: just say "The answer is X"
- Always be clear and beginner-friendly
- Never use markdown, bullet points, or formatting — plain sentences only`
};


// ════════════════════════════════════════════════════════════════
// SECTION 2 — VIDEO DATABASE
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY — Add more videos:
//   1. Find a YouTube video about the topic
//   2. Copy the video ID from the URL (the part after ?v=)
//      Example: youtube.com/watch?v=ABC123  → ID is "ABC123"
//   3. Add a new line: 'your topic keyword': 'VIDEO_ID',
//   Note: keywords are matched if they APPEAR in the user's input

const VIDEO_DB = {
  'newton first law':   'CQYghaXEVVE',
  'newton second law':  'ou9YMWlJgkE',
  'newton third law':   'By-ggTfeuJU',
  'photosynthesis':     'UPBMG5EYydo',
  'water cycle':        'al-do-HGuIk',
  'solar system':       'libKVRa01L8',
  'black hole':         'e-P5IFTqB98',
  'gravity':            'MTY1Kje0yLg',
  'dna':                'AhsIF-cmoQQ',
  'mitosis':            'f-ldPgEfAHI',
  'einstein':           'hW7DW9NIO9E',
  'big bang':           'NbqB_vZLLb8',
  'periodic table':     'fPnwBITSmgU',
  'pythagorean':        'CAkMUdeB06o',
  'ohm law':            'HsLLq6Rm5tA',
  'electromagnetic':    'kB6q-BFLVQ0',
  // ➕ ADD MORE BELOW:
  // 'your topic': 'youtube-video-id',
};


// ════════════════════════════════════════════════════════════════
// SECTION 3 — MATH OPERATIONS
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY — Add a new math operation:
//   1. Add a new entry below
//   2. 'name' = what appears in the result label
//   3. 'keywords' = words that trigger this operation
//   4. 'fn' = the JavaScript math function
//   5. 'single' = true if it only needs ONE number (like sqrt)
//
// Example — adding "factorial":
//   factorial: {
//     name: 'Factorial',
//     keywords: ['factorial', 'fact'],
//     single: true,
//     fn: (a) => { let r=1; for(let i=2;i<=a;i++) r*=i; return r; }
//   }

const MATH_OPS = {
  add: {
    name: 'Addition',
    keywords: ['add', 'plus', 'sum', 'total', 'and', '+'],
    fn: (a, b) => a + b
  },
  subtract: {
    name: 'Subtraction',
    keywords: ['subtract', 'sub', 'minus', 'difference', 'take away', '-'],
    fn: (a, b) => a - b
  },
  multiply: {
    name: 'Multiplication',
    keywords: ['multiply', 'mul', 'times', 'product', 'into', '×', '*'],
    fn: (a, b) => a * b
  },
  divide: {
    name: 'Division',
    keywords: ['divide', 'div', 'divided by', 'quotient', 'over', '/'],
    fn: (a, b) => {
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
    }
  },
  modulo: {
    name: 'Modulo (Remainder)',
    keywords: ['modulo', 'mod', 'remainder', '%'],
    fn: (a, b) => a % b
  },
  power: {
    name: 'Power',
    keywords: ['power', 'pow', 'exponent', 'raised to', '^'],
    fn: (a, b) => Math.pow(a, b)
  },
  sqrt: {
    name: 'Square Root',
    keywords: ['square root', 'sqrt', '√'],
    single: true,
    fn: (a) => Math.sqrt(a)
  },
  // ➕ ADD MORE BELOW:
};

// Word → number map (so "add two and five" works too)
const WORD_NUMBERS = {
  zero:0, one:1, two:2, three:3, four:4, five:5,
  six:6, seven:7, eight:8, nine:9, ten:10,
  eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15,
  sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20,
  thirty:30, forty:40, fifty:50, sixty:60, seventy:70,
  eighty:80, ninety:90, hundred:100, thousand:1000
};


// ════════════════════════════════════════════════════════════════
// SECTION 4 — TOPIC → IMAGE KEYWORDS
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY — Add image topics:
//   When a user asks about a topic, this maps their keywords
//   to a Wikipedia article title to fetch an image from.
//   Format: 'keyword in user query': 'Wikipedia article title'

const IMAGE_TOPICS = {
  'newton':         'Isaac Newton',
  'einstein':       'Albert Einstein',
  'gravity':        'Gravity',
  'photosynthesis': 'Photosynthesis',
  'dna':            'DNA',
  'solar system':   'Solar System',
  'black hole':     'Black hole',
  'water cycle':    'Water cycle',
  'mitosis':        'Mitosis',
  'darwin':         'Charles Darwin',
  'pythagoras':     'Pythagoras',
  'archimedes':     'Archimedes',
  'moon':           'Moon',
  'sun':            'Sun',
  'earth':          'Earth',
  'mars':           'Mars',
  'atom':           'Atom',
  'cell':           'Cell biology',
  'evolution':      'Evolution',
  'dinosaur':       'Dinosaur',
  'volcano':        'Volcano',
  'earthquake':     'Earthquake',
  'ocean':          'Ocean',
  'climate':        'Climate change',
  'artificial intelligence': 'Artificial intelligence',
  // ➕ ADD MORE: 'keyword': 'Wikipedia_Article_Title',
};


// ════════════════════════════════════════════════════════════════
// SECTION 5 — DOM ELEMENTS (do not modify unless you rename HTML IDs)
// ════════════════════════════════════════════════════════════════

const el = {
  textInput:     document.getElementById('textInput'),
  sendBtn:       document.getElementById('sendBtn'),
  micBtn:        document.getElementById('micBtn'),
  micIcon:       document.getElementById('micIcon'),
  micStatus:     document.getElementById('micStatus'),
  statusDot:     document.getElementById('statusDot'),
  loader:        document.getElementById('loader'),
  loaderText:    document.getElementById('loaderText'),
  emptyState:    document.getElementById('emptyState'),
  outputContent: document.getElementById('outputContent'),
  recognizedText:document.getElementById('recognizedText'),
  intentTag:     document.getElementById('intentTag'),
  textOutput:    document.getElementById('textOutput'),
  imageOutput:   document.getElementById('imageOutput'),
  outputImage:   document.getElementById('outputImage'),
  imageCaption:  document.getElementById('imageCaption'),
  videoOutput:   document.getElementById('videoOutput'),
  outputVideo:   document.getElementById('outputVideo'),
  speakBtn:      document.getElementById('speakBtn'),
  copyBtn:       document.getElementById('copyBtn'),
  historyList:   document.getElementById('historyList'),
  emptyHistory:  document.getElementById('emptyHistory'),
  clearBtn:      document.getElementById('clearBtn'),
};

let lastAnswerText = '';   // stores the last spoken answer
let isListening = false;


// ════════════════════════════════════════════════════════════════
// SECTION 6 — MAIN HANDLER
// This is the entry point — called when user submits any input
// ════════════════════════════════════════════════════════════════

async function handleInput(rawText) {
  const text = rawText.trim();
  if (!text) return;

  el.textInput.value = '';
  el.recognizedText.textContent = text;
  showLoading('Thinking…');

  try {
    // Step 1: Try math first
    const mathResult = tryMath(text);
    if (mathResult) {
      displayResult({
        type:   'math',
        answer: mathResult.display,
        speak:  mathResult.speak,
      });
      saveHistory({ query: text, answer: mathResult.speak, type: 'math' });
      return;
    }

    // Step 2: Not math → ask AI (Groq)
    showLoading('Asking AI…');
    const aiAnswer = await askGroq(text);

    // Step 3: Find a video for this topic (optional)
    const videoId = findVideo(text);

    // Step 4: Fetch a Wikipedia image for this topic (optional)
    showLoading('Fetching image…');
    const imageData = await fetchWikiImage(text);

    // Step 5: Detect if this is a science/general topic
    const type = detectType(text);

    displayResult({
      type,
      answer:       aiAnswer,
      speak:        aiAnswer,
      imageUrl:     imageData?.url  || null,
      imageCaption: imageData?.caption || '',
      videoId:      videoId || null,
    });

    saveHistory({ query: text, answer: aiAnswer, type });

  } catch (err) {
    displayResult({
      type:   'general',
      answer: `Sorry, something went wrong: ${err.message}. Check your Groq API key in app.js.`,
      speak:  'Sorry, something went wrong.',
    });
  }
}


// ════════════════════════════════════════════════════════════════
// SECTION 7 — MATH DETECTOR & CALCULATOR
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   To add a new math operation, go to SECTION 3 (MATH_OPS above)

function tryMath(text) {
  let t = text.toLowerCase();

  // Replace word numbers with digits
  Object.entries(WORD_NUMBERS).forEach(([word, num]) => {
    t = t.replace(new RegExp(`\\b${word}\\b`, 'g'), num);
  });

  // Extract all numbers (including negatives & decimals)
  const nums = [...t.matchAll(/-?\d+(\.\d+)?/g)].map(m => parseFloat(m[0]));

  // Try each operation
  for (const [, op] of Object.entries(MATH_OPS)) {
    const matched = op.keywords.some(kw => t.includes(kw));
    if (!matched) continue;

    if (op.single && nums.length >= 1) {
      const result = round(op.fn(nums[0]));
      return {
        display: `${op.name} of ${nums[0]} = ${result}`,
        speak:   `${op.name} of ${nums[0]} is ${result}`
      };
    }

    if (!op.single && nums.length >= 2) {
      let result;
      try {
        result = round(op.fn(nums[0], nums[1]));
      } catch (e) {
        return { display: `❌ ${e.message}`, speak: e.message };
      }
      return {
        display: `${nums[0]}  ${opSymbol(op.name)}  ${nums[1]}  =  ${result}`,
        speak:   `The answer is ${result}`
      };
    }
  }

  return null; // Not a math query
}

function opSymbol(name) {
  const map = {
    'Addition':'+', 'Subtraction':'-', 'Multiplication':'×',
    'Division':'÷', 'Modulo (Remainder)':'mod', 'Power':'^'
  };
  return map[name] || '=';
}

function round(n) {
  return Math.round(n * 100000) / 100000;
}


// ════════════════════════════════════════════════════════════════
// SECTION 8 — AI RESPONSE (Groq API)
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   - Change the SYSTEM_PROMPT in SECTION 1 for different behaviour
//   - Change MAX_TOKENS in SECTION 1 for longer/shorter answers
//   - Change GROQ_MODEL to try different free models

async function askGroq(question) {
  if (CONFIG.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    // Fallback if no API key set — use built-in knowledge base
    return localFallback(question);
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CONFIG.GROQ_MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      messages: [
        { role: 'system', content: CONFIG.SYSTEM_PROMPT },
        { role: 'user',   content: question }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `API Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}


// ════════════════════════════════════════════════════════════════
// SECTION 9 — LOCAL FALLBACK KNOWLEDGE BASE
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   This is used when no Groq API key is set.
//   Add entries: 'keyword': 'Full answer text'
//   The keyword just needs to APPEAR in the user's question.

const LOCAL_KB = {
  'newton first law':
    "Newton's First Law of Motion (Law of Inertia): An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force. Example: a book on a table stays still until you push it.",

  'newton second law':
    "Newton's Second Law: Force equals mass times acceleration (F = ma). The greater the force applied to an object, the greater its acceleration. Example: pushing a heavy box requires more force than pushing a light one.",

  'newton third law':
    "Newton's Third Law: For every action, there is an equal and opposite reaction. Example: when you jump, you push the ground down, and the ground pushes you up.",

  'photosynthesis':
    "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of glucose. The formula is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. It occurs in the chloroplasts of plant cells.",

  'gravity':
    "Gravity is a fundamental force of nature that attracts objects with mass toward each other. On Earth, gravity pulls objects downward at 9.8 m/s². Isaac Newton described gravity, and Einstein later explained it as the curvature of spacetime in his General Theory of Relativity.",

  'ohm law':
    "Ohm's Law states that the current through a conductor between two points is directly proportional to the voltage. Formula: V = IR, where V is voltage (volts), I is current (amperes), and R is resistance (ohms).",

  'einstein':
    "Albert Einstein (1879–1955) was a German-born physicist famous for his theory of relativity. His special relativity equation E = mc² shows that mass and energy are equivalent. He won the Nobel Prize in Physics in 1921 for discovering the law of the photoelectric effect.",

  'pythagorean theorem':
    "The Pythagorean Theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c². Example: a triangle with sides 3 and 4 has a hypotenuse of 5.",

  'water cycle':
    "The water cycle (hydrological cycle) is the continuous movement of water on Earth. It involves evaporation (water turns to vapour from heat), condensation (vapour forms clouds), precipitation (rain/snow falls), and collection (water gathers in rivers, oceans, and groundwater).",

  'dna':
    "DNA (Deoxyribonucleic Acid) is the molecule that carries the genetic instructions for all living organisms. It is a double helix structure made of four bases: Adenine, Thymine, Guanine, and Cytosine. DNA is found in the nucleus of every cell and determines inherited traits.",

  'black hole':
    "A black hole is a region of space where gravity is so strong that nothing, not even light, can escape from it. They form when massive stars collapse at the end of their life. The boundary around a black hole is called the event horizon.",

  'big bang':
    "The Big Bang Theory states that the universe began about 13.8 billion years ago from an extremely hot, dense point and has been expanding ever since. It is supported by evidence like cosmic microwave background radiation and the redshift of distant galaxies.",

  // ➕ ADD YOUR OWN:
  // 'keyword': 'Your full answer here',
};

function localFallback(question) {
  const q = question.toLowerCase();
  for (const [key, answer] of Object.entries(LOCAL_KB)) {
    if (q.includes(key)) return answer;
  }
  return "I don't have an answer for that yet.";
}


// ════════════════════════════════════════════════════════════════
// SECTION 10 — WIKIPEDIA IMAGE FETCHER
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   Add new topics in IMAGE_TOPICS (Section 4 above).
//   This uses Wikipedia's free API — no key needed.

async function fetchWikiImage(query) {
  try {
    const q = query.toLowerCase();
    let wikiTitle = null;

    // Find matching image topic keyword
    for (const [keyword, title] of Object.entries(IMAGE_TOPICS)) {
      if (q.includes(keyword)) {
        wikiTitle = title;
        break;
      }
    }

    if (!wikiTitle) return null;

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.thumbnail?.source) return null;

    return {
      url:     data.thumbnail.source.replace(/\/\d+px-/, '/400px-'),
      caption: data.title + ' — Wikipedia'
    };
  } catch {
    return null; // Silently fail — image is optional
  }
}


// ════════════════════════════════════════════════════════════════
// SECTION 11 — VIDEO FINDER
// ════════════════════════════════════════════════════════════════

function findVideo(query) {
  const q = query.toLowerCase();
  for (const [keyword, videoId] of Object.entries(VIDEO_DB)) {
    if (q.includes(keyword)) return videoId;
  }
  return null;
}


// ════════════════════════════════════════════════════════════════
// SECTION 12 — INTENT TYPE DETECTOR
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   Add more keywords to science/history arrays to improve detection

function detectType(text) {
  const t = text.toLowerCase();
  const scienceWords = [
    'law','theorem','theory','force','energy','atom','cell','dna','gravity',
    'physics','chemistry','biology','science','formula','equation','light',
    'wave','magnetic','electric','photon','quantum','relativity','evolution',
    'solar','planet','space','orbit','nucleus','enzyme','protein','gene'
  ];
  const historyWords = [
    'who is','who was','when did','history','war','revolution','president',
    'king','queen','emperor','century','ancient','medieval','discovery'
  ];

  if (scienceWords.some(w => t.includes(w))) return 'science';
  if (historyWords.some(w => t.includes(w))) return 'general';
  return 'general';
}


// ════════════════════════════════════════════════════════════════
// SECTION 13 — DISPLAY RESULT
// ════════════════════════════════════════════════════════════════

function displayResult({ type, answer, speak, imageUrl, imageCaption, videoId }) {
  hideLoading();

  el.emptyState.classList.add('hidden');
  el.outputContent.classList.remove('hidden');

  lastAnswerText = speak || answer;

  // Intent tag
  const tagLabels = { math: '🔢 MATH', science: '🔬 SCIENCE', general: '💬 ANSWER' };
  el.intentTag.textContent  = tagLabels[type] || '💬 ANSWER';
  el.intentTag.className    = `label-tag ${type}`;

  // Text answer
  el.textOutput.textContent = answer;
  el.textOutput.className   = type === 'math' ? 'text-output math-result' : 'text-output';

  // Image
  if (imageUrl) {
    el.outputImage.src       = imageUrl;
    el.imageCaption.textContent = imageCaption;
    el.imageOutput.classList.remove('hidden');
  } else {
    el.imageOutput.classList.add('hidden');
  }

  // Video
  if (videoId) {
    el.outputVideo.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
    el.videoOutput.classList.remove('hidden');
  } else {
    el.videoOutput.classList.add('hidden');
    el.outputVideo.src = ''; // Stop any playing video
  }

  // Auto-speak the answer
  speakText(lastAnswerText);

  // Reset status dot
  el.statusDot.classList.remove('thinking');
}


// ════════════════════════════════════════════════════════════════
// SECTION 14 — VOICE INPUT (Speech Recognition)
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   Change CONFIG.SPEECH_LANG to recognize a different language
//   Example: 'ta-IN' for Tamil, 'hi-IN' for Hindi

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang       = CONFIG.SPEECH_LANG;
  recognition.continuous = false;

  el.micBtn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    isListening = true;
    el.micBtn.classList.add('active');
    el.micIcon.textContent = '⏹';
    el.micStatus.classList.remove('hidden');
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    el.textInput.value = transcript;
    stopMic();
    handleInput(transcript);
  };

  recognition.onerror = () => {
    stopMic();
    alert('Microphone error. Make sure you are using Chrome or Edge browser and have allowed microphone access.');
  };

  recognition.onend = () => stopMic();

  function stopMic() {
    isListening = false;
    el.micBtn.classList.remove('active');
    el.micIcon.textContent = '🎤';
    el.micStatus.classList.add('hidden');
  }

} else {
  el.micBtn.disabled        = true;
  el.micBtn.title           = 'Voice input not supported in this browser. Use Chrome.';
  el.micIcon.textContent    = '🚫';
}


// ════════════════════════════════════════════════════════════════
// SECTION 15 — VOICE OUTPUT (Text to Speech)
// ════════════════════════════════════════════════════════════════
// ✏️ HOW TO MODIFY:
//   Change utterance.rate (0.5 slow → 1.5 fast)
//   Change utterance.pitch (0 deep → 2 high)
//   Change utterance.lang for a different language

function speakText(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // Stop previous speech
  const u    = new SpeechSynthesisUtterance(text);
  u.lang     = CONFIG.SPEECH_LANG;
  u.rate     = 0.92;
  u.pitch    = 1;
  u.volume   = 1;
  window.speechSynthesis.speak(u);
}

el.speakBtn.addEventListener('click', () => speakText(lastAnswerText));


// ════════════════════════════════════════════════════════════════
// SECTION 16 — HISTORY
// ════════════════════════════════════════════════════════════════

function saveHistory(item) {
  const time   = new Date().toLocaleTimeString();
  const stored = getHistory();
  stored.unshift({ ...item, time });
  if (stored.length > CONFIG.MAX_HISTORY) stored.pop();
  localStorage.setItem('novaHistory', JSON.stringify(stored));
  renderHistory(stored);
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('novaHistory') || '[]'); }
  catch { return []; }
}

function renderHistory(items) {
  el.historyList.innerHTML = '';

  if (!items.length) {
    el.emptyHistory.classList.remove('hidden');
    return;
  }

  el.emptyHistory.classList.add('hidden');

  const icons = { math: '🔢', science: '🔬', general: '💬' };

  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <span class="history-type">${icons[item.type] || '💬'}</span>
      <div class="history-text">
        <div class="history-query">${escapeHtml(item.query)}</div>
        <div class="history-answer">${escapeHtml(item.answer.substring(0, 80))}…</div>
      </div>
      <span class="history-time">${item.time}</span>
    `;
    // Click a history item to replay it
    li.addEventListener('click', () => {
      el.textInput.value = item.query;
      handleInput(item.query);
    });
    el.historyList.appendChild(li);
  });
}

el.clearBtn.addEventListener('click', () => {
  localStorage.removeItem('novaHistory');
  renderHistory([]);
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


// ════════════════════════════════════════════════════════════════
// SECTION 17 — LOADING STATE HELPERS
// ════════════════════════════════════════════════════════════════

function showLoading(msg = 'Processing…') {
  el.loaderText.textContent = msg;
  el.loader.classList.remove('hidden');
  el.emptyState.classList.add('hidden');
  el.outputContent.classList.add('hidden');
  el.statusDot.classList.add('thinking');
}

function hideLoading() {
  el.loader.classList.add('hidden');
}


// ════════════════════════════════════════════════════════════════
// SECTION 18 — EVENT LISTENERS
// ════════════════════════════════════════════════════════════════

// Send button
el.sendBtn.addEventListener('click', () => {
  if (el.textInput.value.trim()) handleInput(el.textInput.value);
});

// Enter key
el.textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && el.textInput.value.trim()) handleInput(el.textInput.value);
});

// Copy answer
el.copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(lastAnswerText).then(() => {
    el.copyBtn.textContent = '✅ Copied!';
    setTimeout(() => el.copyBtn.textContent = '📋 Copy', 2000);
  });
});

// Example chips (called from HTML onclick)
function tryExample(chipEl) {
  el.textInput.value = chipEl.textContent;
  handleInput(chipEl.textContent);
}


// ════════════════════════════════════════════════════════════════
// SECTION 19 — INIT (runs on page load)
// ════════════════════════════════════════════════════════════════

(function init() {
  renderHistory(getHistory());
  el.textInput.focus();

  // Warn if no API key set
  if (CONFIG.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    console.warn('[NOVA AI] No Groq API key set. Using local knowledge base only. Get a free key at console.groq.com');
  }
})();