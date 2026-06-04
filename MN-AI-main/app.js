// ════════════════════════════════════════════════════════════════
// MN AI — app.js  | Powered by Groq Cloud API (llama-3.3-70b)
// ════════════════════════════════════════════════════════════════

// ── CONFIG ───────────────────────────────────────────────────────
const CONFIG = {
  SPEECH_LANG: 'en-US',
  MAX_HISTORY: 60,
  // We now point to our own backend proxy server instead of Groq directly
  BACKEND_URL: 'http://localhost:3000/api/chat',
};

// ── VIDEO DATABASE ────────────────────────────────────────────────
// YouTube embeds often fail on local file:// with Error 153.
// We exclusively use Dailymotion API dynamically for all queries.

// ── MATH OPERATIONS ───────────────────────────────────────────────
const MATH_OPS = {
  add: { name: 'Addition', keywords: ['add', 'plus', 'sum', 'total', 'and', '+'], fn: (a, b) => a + b },
  subtract: { name: 'Subtraction', keywords: ['subtract', 'minus', 'difference', 'take away', '-'], fn: (a, b) => a - b },
  multiply: { name: 'Multiplication', keywords: ['multiply', 'times', 'product', 'into', '×', '*'], fn: (a, b) => a * b },
  divide: {
    name: 'Division', keywords: ['divide', 'divided by', 'quotient', 'over', '/'],
    fn: (a, b) => { if (b === 0) throw new Error('Cannot divide by zero'); return a / b; }
  },
  modulo: { name: 'Modulo (Remainder)', keywords: ['modulo', 'mod', 'remainder', '%'], fn: (a, b) => a % b },
  power: { name: 'Power', keywords: ['power', 'pow', 'exponent', 'raised to', '^'], fn: (a, b) => Math.pow(a, b) },
  sqrt: { name: 'Square Root', keywords: ['square root', 'sqrt', '√'], single: true, fn: (a) => Math.sqrt(a) },
};

const WORD_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000
};

// ── IMAGE TOPICS (Wikipedia) ──────────────────────────────────────
const IMAGE_TOPICS = {
  'newton': 'Isaac Newton',
  'einstein': 'Albert Einstein',
  'gravity': 'Gravity',
  'photosynthesis': 'Photosynthesis',
  'dna': 'DNA',
  'solar system': 'Solar System',
  'black hole': 'Black hole',
  'water cycle': 'Water cycle',
  'mitosis': 'Mitosis',
  'darwin': 'Charles Darwin',
  'pythagoras': 'Pythagoras',
  'archimedes': 'Archimedes',
  'moon': 'Moon',
  'sun': 'Sun',
  'earth': 'Earth',
  'mars': 'Mars',
  'atom': 'Atom',
  'cell': 'Cell biology',
  'evolution': 'Evolution',
  'dinosaur': 'Dinosaur',
  'volcano': 'Volcano',
  'earthquake': 'Earthquake',
  'ocean': 'Ocean',
  'climate': 'Climate change',
  'artificial intelligence': 'Artificial intelligence',
  'eiffel tower': 'Eiffel Tower',
  'taj mahal': 'Taj Mahal',
  'pyramid': 'Egyptian pyramids',
  'tesla': 'Nikola Tesla',
  'edison': 'Thomas Edison',
  'shakespeare': 'William Shakespeare',
  'napoleon': 'Napoleon',
  'lincoln': 'Abraham Lincoln',
  'gandhi': 'Mahatma Gandhi',
  'python': 'Python (programming language)',
  'robot': 'Robot',
  'computer': 'Computer',
  'internet': 'Internet',
  'covid': 'COVID-19',
  'vaccine': 'Vaccine',
  'brain': 'Human brain',
  'heart': 'Human heart',
  'tiger': 'Tiger',
  'elephant': 'Elephant',
  'amazon': 'Amazon River',
  'himalayas': 'Himalayas',
};

// ── DOM ELEMENTS ──────────────────────────────────────────────────
const el = {
  textInput: document.getElementById('textInput'),
  sendBtn: document.getElementById('sendBtn'),
  micBtn: document.getElementById('micBtn'),
  micIcon: document.getElementById('micIcon'),
  micStatus: document.getElementById('micStatus'),
  statusDot: document.getElementById('statusDot'),
  loader: document.getElementById('loader'),
  loaderText: document.getElementById('loaderText'),
  emptyState: document.getElementById('emptyState'),
  outputContent: document.getElementById('outputContent'),
  recognizedText: document.getElementById('recognizedText'),
  intentTag: document.getElementById('intentTag'),
  textOutput: document.getElementById('textOutput'),
  imageOutput: document.getElementById('imageOutput'),
  outputImage: document.getElementById('outputImage'),
  imageCaption: document.getElementById('imageCaption'),
  videoOutput: document.getElementById('videoOutput'),
  outputVideo: document.getElementById('outputVideo'),
  speakBtn: document.getElementById('speakBtn'),
  stopBtn: document.getElementById('stopBtn'),
  copyBtn: document.getElementById('copyBtn'),
  historyList: document.getElementById('historyList'),
  emptyHistory: document.getElementById('emptyHistory'),
  clearBtn: document.getElementById('clearBtn'),
};

let lastAnswerText = '';
let isListening = false;

// ── GROQ API CALL ─────────────────────────────────────────────────
async function askGroq(question) {
  const systemPrompt = `You are MN AI, a smart, friendly, and concise AI assistant.
Answer ANY question the user asks — science, history, math explanations, general knowledge, current events, coding, sports, culture, geography, or anything else.
Rules:
- Give clear, accurate, and helpful answers.
- Keep answers concise but complete (3–6 sentences for simple questions, longer if needed for complex ones).
- If it's a math question that needs calculation, show the calculation step by step.
- Use simple language. Avoid markdown formatting like ** or ## — plain text only.
- Never say you cannot answer.`;

  const res = await fetch(CONFIG.BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ── MAIN HANDLER ──────────────────────────────────────────────────
async function handleInput(rawText) {
  const text = rawText.trim();
  if (!text) return;

  el.textInput.value = '';
  el.recognizedText.textContent = text;
  showLoading('Thinking…');

  try {
    // 1. Try math first (instant, no API needed)
    const mathResult = tryMath(text);
    if (mathResult) {
      displayResult({ type: 'math', answer: mathResult.display, speak: mathResult.speak });
      saveHistory({ query: text, answer: mathResult.speak, type: 'math' });
      return;
    }

    // 2. Run all async tasks in parallel for speed
    showLoading('Asking Groq AI…');

    const [aiAnswer, imageData, videoData] = await Promise.all([
      askGroq(text),
      fetchWikiImage(text),
      findVideo(text)
    ]);

    // 3. Detect intent type for the tag label
    const type = detectType(text);

    displayResult({
      type,
      answer: aiAnswer,
      speak: aiAnswer,
      imageUrl: imageData?.url || null,
      imageCaption: imageData?.caption || '',
      videoData: videoData || null,
    });

    saveHistory({ query: text, answer: aiAnswer, type });

  } catch (err) {
    console.error('handleInput error:', err);
    displayResult({
      type: 'general',
      answer: `⚠️ Could not get a response: ${err.message}`,
      speak: 'Sorry, something went wrong. Please try again.',
    });
  }
}

// ── MATH DETECTOR & CALCULATOR ────────────────────────────────────
function tryMath(text) {
  let t = text.toLowerCase();

  Object.entries(WORD_NUMBERS).forEach(([word, num]) => {
    t = t.replace(new RegExp(`\\b${word}\\b`, 'g'), num);
  });

  const nums = [...t.matchAll(/-?\d+(\.\d+)?/g)].map(m => parseFloat(m[0]));

  for (const [, op] of Object.entries(MATH_OPS)) {
    if (!op.keywords.some(kw => t.includes(kw))) continue;

    if (op.single && nums.length >= 1) {
      const result = round(op.fn(nums[0]));
      return {
        display: `${op.name} of ${nums[0]} = ${result}`,
        speak: `${op.name} of ${nums[0]} is ${result}`,
      };
    }

    if (!op.single && nums.length >= 2) {
      let result;
      try { result = round(op.fn(nums[0], nums[1])); }
      catch (e) { return { display: `❌ ${e.message}`, speak: e.message }; }
      return {
        display: `${nums[0]}  ${opSymbol(op.name)}  ${nums[1]}  =  ${result}`,
        speak: `The answer is ${result}`,
      };
    }
  }
  return null;
}

function opSymbol(name) {
  return { 'Addition': '+', 'Subtraction': '-', 'Multiplication': '×', 'Division': '÷', 'Modulo (Remainder)': 'mod', 'Power': '^' }[name] || '=';
}

function round(n) { return Math.round(n * 100000) / 100000; }

// ── WIKIPEDIA IMAGE FETCHER ───────────────────────────────────────
async function fetchWikiImage(query) {
  try {
    const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`);
    const searchData = await searchRes.json();
    if (!searchData.query?.search?.length) return null;

    for (const item of searchData.query.search) {
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`);
      if (!summaryRes.ok) continue;
      const data = await summaryRes.json();
      if (data.thumbnail?.source) {
        return {
          url: data.thumbnail.source.replace(/\/\d+px-/, '/500px-'),
          caption: `${data.title} — Wikipedia`,
        };
      }
    }
    return null;
  } catch (e) {
    console.warn('Image fetch failed:', e);
    return null;
  }
}

// ── VIDEO FINDER ──────────────────────────────────────────────────
async function findVideo(query) {
  // Use Dailymotion API exclusively for all topics to avoid YouTube restrictions
  try {
    const res = await fetch(`https://api.dailymotion.com/videos?search=${encodeURIComponent(query + ' explained')}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.list && data.list.length > 0) {
        return { source: 'dailymotion', id: data.list[0].id };
      }
    }
  } catch (e) { console.warn('Video fetch failed:', e); }

  return null;
}

// ── INTENT TYPE DETECTOR ──────────────────────────────────────────
function detectType(text) {
  const t = text.toLowerCase();
  const scienceWords = [
    'law', 'theorem', 'theory', 'force', 'energy', 'atom', 'cell', 'dna', 'gravity',
    'physics', 'chemistry', 'biology', 'science', 'formula', 'equation', 'light',
    'wave', 'magnetic', 'electric', 'photon', 'quantum', 'relativity', 'evolution',
    'solar', 'planet', 'space', 'orbit', 'nucleus', 'enzyme', 'protein', 'gene',
    'voltage', 'current', 'resistance', 'temperature', 'pressure', 'radiation',
  ];
  if (scienceWords.some(w => t.includes(w))) return 'science';
  return 'general';
}

// ── DISPLAY RESULT ────────────────────────────────────────────────
function displayResult({ type, answer, speak, imageUrl, imageCaption, videoData }) {
  hideLoading();
  el.emptyState.classList.add('hidden');
  el.outputContent.classList.remove('hidden');

  lastAnswerText = speak || answer;

  const tagLabels = { math: '🔢 MATH', science: '🔬 SCIENCE', general: '💬 ANSWER' };
  el.intentTag.textContent = tagLabels[type] || '💬 ANSWER';
  el.intentTag.className = `label-tag ${type}`;

  el.textOutput.textContent = answer;
  el.textOutput.className = type === 'math' ? 'text-output math-result' : 'text-output';

  // ── Image ──
  if (imageUrl) {
    el.outputImage.src = '';                  // reset first to force reload
    el.outputImage.alt = imageCaption || 'Topic image';
    el.imageCaption.textContent = imageCaption;
    el.imageOutput.classList.remove('hidden');

    // Load image; hide if it errors
    el.outputImage.onload = () => el.imageOutput.classList.remove('hidden');
    el.outputImage.onerror = () => el.imageOutput.classList.add('hidden');
    el.outputImage.src = imageUrl;
  } else {
    el.imageOutput.classList.add('hidden');
  }

  // ── Video ──
  if (videoData) {
    if (videoData.source === 'youtube') {
      el.outputVideo.src = `https://www.youtube-nocookie.com/embed/${videoData.id}?rel=0&modestbranding=1&autoplay=0`;
    } else if (videoData.source === 'dailymotion') {
      el.outputVideo.src = `https://www.dailymotion.com/embed/video/${videoData.id}?ui-logo=false`;
    }
    el.videoOutput.classList.remove('hidden');
  } else {
    el.videoOutput.classList.add('hidden');
    el.outputVideo.src = '';
  }

  speakText(lastAnswerText);
  el.statusDot.classList.remove('thinking');
}

// ── VOICE INPUT ───────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = CONFIG.SPEECH_LANG;
  recognition.continuous = false;

  el.micBtn.addEventListener('click', () => {
    if (isListening) { recognition.stop(); return; }
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
    alert('Microphone error. Make sure you are using Chrome or Edge and have allowed microphone access.');
  };

  recognition.onend = () => stopMic();

  function stopMic() {
    isListening = false;
    el.micBtn.classList.remove('active');
    el.micIcon.textContent = '🎤';
    el.micStatus.classList.add('hidden');
  }
} else {
  el.micBtn.disabled = true;
  el.micBtn.title = 'Voice input not supported. Use Chrome or Edge.';
  el.micIcon.textContent = '🚫';
}

// ── VOICE OUTPUT ──────────────────────────────────────────────────
let preferredVoice = null;
function setPreferredVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  
  // Prefer premium female/natural voices
  const preferredNames = [
    'Google UK English Female',
    'Google US English',
    'Samantha',
    'Microsoft Zira',
    'Microsoft Hazel'
  ];
  
  for (const name of preferredNames) {
    const found = voices.find(v => v.name.includes(name));
    if (found) { preferredVoice = found; break; }
  }
  
  // Fallback to any english voice that implies female
  if (!preferredVoice) {
    preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
  }
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = setPreferredVoice;
}

function speakText(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  if (!preferredVoice) setPreferredVoice();
  
  const u = new SpeechSynthesisUtterance(text);
  u.lang = CONFIG.SPEECH_LANG;
  if (preferredVoice) {
    u.voice = preferredVoice;
  }
  
  // Tweaked for a more natural, pleasant girl voice
  u.rate = 1.0; 
  u.pitch = 1.15; 
  u.volume = 1;
  
  if (el.stopBtn) {
    el.stopBtn.classList.remove('hidden');
    u.onend = () => el.stopBtn.classList.add('hidden');
    u.onerror = () => el.stopBtn.classList.add('hidden');
  }
  
  window.speechSynthesis.speak(u);
}

el.speakBtn.addEventListener('click', () => speakText(lastAnswerText));

if (el.stopBtn) {
  el.stopBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    el.stopBtn.classList.add('hidden');
  });
}

// ── HISTORY ───────────────────────────────────────────────────────
function saveHistory(item) {
  const time = new Date().toLocaleTimeString();
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
  if (!items.length) { el.emptyHistory.classList.remove('hidden'); return; }
  el.emptyHistory.classList.add('hidden');

  const icons = { math: '🔢', science: '🔬', general: '💬' };
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <span class="history-type">${icons[item.type] || '💬'}</span>
      <div class="history-text">
        <div class="history-query">${escapeHtml(item.query)}</div>
        <div class="history-answer">${escapeHtml((item.answer || '').substring(0, 80))}…</div>
      </div>
      <span class="history-time">${item.time}</span>
    `;
    li.addEventListener('click', () => { el.textInput.value = item.query; handleInput(item.query); });
    el.historyList.appendChild(li);
  });
}

el.clearBtn.addEventListener('click', () => { localStorage.removeItem('novaHistory'); renderHistory([]); });

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── LOADING HELPERS ───────────────────────────────────────────────
function showLoading(msg = 'Processing…') {
  el.loaderText.textContent = msg;
  el.loader.classList.remove('hidden');
  el.emptyState.classList.add('hidden');
  el.outputContent.classList.add('hidden');
  el.statusDot.classList.add('thinking');
}

function hideLoading() { el.loader.classList.add('hidden'); }

// ── EVENT LISTENERS ───────────────────────────────────────────────
el.sendBtn.addEventListener('click', () => {
  if (el.textInput.value.trim()) handleInput(el.textInput.value);
});

el.textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && el.textInput.value.trim()) handleInput(el.textInput.value);
});

el.copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(lastAnswerText).then(() => {
    el.copyBtn.textContent = '✅ Copied!';
    setTimeout(() => el.copyBtn.textContent = '📋 Copy', 2000);
  });
});

function tryExample(chipEl) {
  el.textInput.value = chipEl.textContent;
  handleInput(chipEl.textContent);
}

// ── INIT ──────────────────────────────────────────────────────────
(function init() {
  renderHistory(getHistory());
  el.textInput.focus();
})();
