/* ── LOCALSTORAGE ── */
const LS_KEY = 'quizmaster_history';
// YE result ko save kerta hai phele purani history uthao or naya result sabhse upar dalo
function saveResult(data) {
  const h = getHistory();
  h.unshift(data);
  if (h.length > 50) h.pop();
  localStorage.setItem(LS_KEY, JSON.stringify(h));
}

// yeh function purana data uthata hai browser se data nikalo or agar kuch nahi hai toh khali list do
//or agar koi problem aaye toh crash mat karo,bas khali list do
function getHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

// yeh saari history deleat ker deti hai
function clearHistory() {
  localStorage.removeItem(LS_KEY);
}
// ye clear Button ka kaam hai pehele ek popup aata hai ki pakka deleat kerna hai agar ok kiya to history delete,phir screen update
function clearHistoryUI() {
  if (confirm('Clear all quiz history?')) {
    clearHistory();
    renderHistory();
  }
}

// final score nikalta hai -score ka 70% + accuracy ka 30%=combined score
function calcCombined(score, total, accuracy) {
  return Math.round((score / total) * 70 + accuracy * 0.30);
}

// 10 global players ke scores hai -phele se set kiye hai
// .map(...) har player ka combined score calculate karo
// .sort(...)bade se chhote order mein lagao
const GLOBAL_BASELINES = [
  { score:10, total:10, accuracy:96 },
  { score:10, total:10, accuracy:92 },
  { score:9,  total:10, accuracy:89 },
  { score:9,  total:10, accuracy:84 },
  { score:8,  total:10, accuracy:91 },
  { score:8,  total:10, accuracy:80 },
  { score:7,  total:10, accuracy:82 },
  { score:7,  total:10, accuracy:78 },
  { score:6,  total:10, accuracy:75 },
  { score:6,  total:10, accuracy:71 },
].map(p => calcCombined(p.score, p.total, p.accuracy))
 .sort((a, b) => b - a);

 // user ki rank batata hai ki kitne global players ka score user se zyada hai unki ginti +1=user ki rank
function getGlobalRank(cs) {
  return GLOBAL_BASELINES.filter(g => g > cs).length + 1;
}

// history cards banata hai history-list naam ka box dhundho html mein agar box nahi mila toh band karo
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  // saved history uthao or agar kuch nahi hai toh "No History Yet" message dikhao
  const h = getHistory();

  if (h.length === 0) {
    list.innerHTML = `<div class="hist-empty">No quiz history yet. Complete a quiz to see it here!</div>`;
    return;
  }

  //har result ke liye ek card banao ."pct"-score kitne percent sahi tha
  list.innerHTML = h.map((r) => {
    const pct      = r.score / r.total;
    const col      = pct >= .7 ? '#4cde7f' : pct >= .4 ? '#e8ff47' : '#ff5c3a';
    const accCls   = pct >= .7 ? 'acc-high' : pct >= .4 ? 'acc-mid' : 'acc-low';
    // combined score nikalo-agar phele se saved hai toh use karo,warna calculate karo or us score se rank nikalo
    const cs       = r.combinedScore !== undefined ? r.combinedScore : calcCombined(r.score, r.total, r.accuracy);
    const rank     = getGlobalRank(cs);
    const rankText = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '#' + rank;
    const rankCls  = rank === 1 ? 'rb-gold' : rank === 2 ? 'rb-silver' : rank === 3 ? 'rb-bronze' : '';

    //card ka html banata hai jisme rank badge,category icon aur naam,data aur
    // time,score,accuracy,time,combined score
    return `
    <div class="hist-row">
      <div class="hist-left">
        <div class="hist-rank-badge ${rankCls}">${rankText}</div>
        <span class="hist-icon">${r.catIcon}</span>
        <div>
          <div class="hist-cat">${r.catName}</div>
          <div class="hist-date">${r.date} · ${r.time}</div>
        </div>
      </div>
      <div class="hist-right">
        <div class="hist-stat">
          <span class="hist-stat-val" style="color:${col}">${r.score}/${r.total}</span>
          <span class="hist-stat-lbl">Score</span>
        </div>
        <div class="hist-stat">
          <span class="hist-stat-val acc ${accCls}">${r.accuracy}%</span>
          <span class="hist-stat-lbl">Accuracy</span>
        </div>
        <div class="hist-stat">
          <span class="hist-stat-val" style="color:var(--muted)">⏱ ${r.timeUsed}s</span>
          <span class="hist-stat-lbl">Time</span>
        </div>
        <div class="hist-stat">
          <span class="hist-stat-val combined-score">${cs}pts</span>
          <span class="hist-stat-lbl">Combined</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// yeh poora quiz ka data hai id-pehchaan ke liye,name-science,history..,icon-emoji,color-card ka color,qs-questions ki list
// har questions mein q- question text,o-4options, a-sahi jawab ka number(0,1,2,3 mein se)
//a:1 matlab doosra option 'Au' sahi hai
const CATS = [
  {
    id: 'science', name: 'Science', icon: '⚗️', color: '#3a8fff',
    desc: 'Physics, Chemistry, Biology & Space',
    qs: [
      { q: 'What is the chemical symbol for Gold?',                           o: ['Go','Au','Ag','Gd'],                                                           a: 1 },
      { q: 'Which planet is known as the Red Planet?',                        o: ['Venus','Mars','Jupiter','Saturn'],                                              a: 1 },
      { q: 'What is the powerhouse of the cell?',                             o: ['Nucleus','Ribosome','Mitochondria','Golgi body'],                               a: 2 },
      { q: 'How many bones are in the adult human body?',                     o: ['196','206','216','226'],                                                        a: 1 },
      { q: 'What gas do plants absorb during photosynthesis?',                o: ['Oxygen','Nitrogen','Carbon Dioxide','Hydrogen'],                                a: 2 },
      { q: 'What is the atomic number of Carbon?',                            o: ['4','6','8','12'],                                                               a: 1 },
      { q: 'Which scientist proposed the theory of general relativity?',      o: ['Newton','Bohr','Faraday','Einstein'],                                           a: 3 },
      { q: 'What is the most abundant gas in Earth\'s atmosphere?',           o: ['Oxygen','Carbon Dioxide','Argon','Nitrogen'],                                   a: 3 },
      { q: 'DNA stands for?',                                                 o: ['Deoxyribonucleic Acid','Diribonucleic Acid','Dinucleic Acid','Double Nucleic Acid'], a: 0 },
      { q: 'Which organ in the human body produces insulin?',                 o: ['Liver','Kidney','Pancreas','Stomach'],                                          a: 2 },
    ]
  },
  {
    id: 'history', name: 'History', icon: '🏛️', color: '#ff5c3a',
    desc: 'Ancient civilisations to modern wars',
    qs: [
      { q: 'In which year did World War II end?',                             o: ['1943','1944','1945','1946'],                                                    a: 2 },
      { q: 'Who was the first President of the United States?',               o: ['Abraham Lincoln','Thomas Jefferson','George Washington','John Adams'],          a: 2 },
      { q: 'The Berlin Wall fell in which year?',                             o: ['1987','1988','1989','1991'],                                                    a: 2 },
      { q: 'Who was the first female Prime Minister of the United Kingdom?',  o: ['Queen Victoria','Margaret Thatcher','Theresa May','Angela Merkel'],             a: 1 },
      { q: 'The French Revolution began in which year?',                      o: ['1776','1783','1789','1799'],                                                    a: 2 },
      { q: 'Who discovered America in 1492?',                                 o: ['Vasco da Gama','Ferdinand Magellan','Christopher Columbus','Amerigo Vespucci'], a: 2 },
      { q: 'Which empire was ruled by Genghis Khan?',                         o: ['Ottoman Empire','Roman Empire','Mongol Empire','Persian Empire'],               a: 2 },
      { q: 'In which country did the Renaissance begin?',                     o: ['France','Spain','Germany','Italy'],                                             a: 3 },
      { q: 'Who wrote the Indian national anthem "Jana Gana Mana"?',          o: ['Mahatma Gandhi','Bankim Chandra','Rabindranath Tagore','Sardar Patel'],         a: 2 },
      { q: 'Which Indian leader is known as "Mahatma" meaning "Great Soul"?', o: ['Jawaharlal Nehru','B.R. Ambedkar','Mohandas Gandhi','Bal Gangadhar Tilak'],    a: 2 },
    ]
  },
  {
    id: 'geography', name: 'Geography', icon: '🌍', color: '#4cde7f',
    desc: 'Countries, capitals, rivers & maps',
    qs: [
      { q: 'What is the capital of Australia?',                               o: ['Sydney','Melbourne','Brisbane','Canberra'],                                     a: 3 },
      { q: 'Which is the longest river in the world?',                        o: ['Amazon','Nile','Yangtze','Mississippi'],                                        a: 1 },
      { q: 'Which country has the most natural lakes?',                       o: ['Russia','USA','Brazil','Canada'],                                               a: 3 },
      { q: 'Mount Everest lies on the border of which two countries?',        o: ['India & China','Nepal & China','Nepal & India','Bhutan & China'],               a: 1 },
      { q: 'Which is the smallest country in the world?',                     o: ['Monaco','Nauru','San Marino','Vatican City'],                                   a: 3 },
      { q: 'Which ocean is the largest?',                                     o: ['Atlantic','Indian','Arctic','Pacific'],                                         a: 3 },
      { q: 'What is the capital of Japan?',                                   o: ['Osaka','Kyoto','Tokyo','Hiroshima'],                                            a: 2 },
      { q: 'The Sahara Desert is located in which continent?',                o: ['Asia','South America','Africa','Australia'],                                    a: 2 },
      { q: 'Which country has the largest population in the world?',          o: ['USA','India','China','Russia'],                                                 a: 1 },
      { q: 'The Amazon rainforest is primarily in which country?',            o: ['Colombia','Peru','Venezuela','Brazil'],                                         a: 3 },
    ]
  },
  {
    id: 'technology', name: 'Technology', icon: '💻', color: '#e8ff47',
    desc: 'Coding, gadgets, AI & the internet',
    qs: [
      { q: 'Who is the co-founder of Apple Inc.?',                            o: ['Bill Gates','Elon Musk','Steve Jobs','Mark Zuckerberg'],                       a: 2 },
      { q: 'What does HTML stand for?',                                       o: ['Hyper Text Markup Language','High Tech Machine Language','Hyper Transfer Markup Language','Home Tool Markup Language'], a: 0 },
      { q: 'Which company developed the Android operating system?',           o: ['Apple','Microsoft','Samsung','Google'],                                         a: 3 },
      { q: 'What does CPU stand for?',                                        o: ['Central Processing Unit','Computer Power Unit','Core Processing Utility','Central Program Unit'], a: 0 },
      { q: 'Which language is known as the "language of the web"?',           o: ['Python','Java','JavaScript','C++'],                                             a: 2 },
      { q: 'What year was the first iPhone released?',                        o: ['2005','2006','2007','2008'],                                                    a: 2 },
      { q: 'What does AI stand for?',                                         o: ['Automated Intelligence','Artificial Intelligence','Advanced Integration','Analytical Interface'], a: 1 },
      { q: 'What does USB stand for?',                                        o: ['Universal Serial Bus','Unified System Bridge','Universal Storage Block','Ultra Speed Bus'], a: 0 },
      { q: 'Which search engine has the largest global market share?',        o: ['Bing','Yahoo','DuckDuckGo','Google'],                                           a: 3 },
      { q: 'What does CSS stand for?',                                        o: ['Computer Style Sheets','Creative Style Syntax','Cascading Style Sheets','Coded Style Sheets'], a: 2 },
    ]
  },
  {
    id: 'sports', name: 'Sports', icon: '⚽', color: '#ff3a7a',
    desc: 'Football, cricket, Olympics & more',
    qs: [
      { q: 'How many players are in a standard football (soccer) team?',      o: ['9','10','11','12'],                                                             a: 2 },
      { q: 'Which country has won the most FIFA World Cup titles?',           o: ['Germany','Argentina','Brazil','Italy'],                                         a: 2 },
      { q: 'In cricket, how many balls are in a standard over?',              o: ['4','5','6','8'],                                                                a: 2 },
      { q: 'Which sport is played at Wimbledon?',                             o: ['Badminton','Squash','Table Tennis','Tennis'],                                   a: 3 },
      { q: 'How many gold medals did Usain Bolt win in his Olympic career?',  o: ['6','7','8','9'],                                                                a: 2 },
      { q: 'The Olympic Games are held every how many years?',                o: ['2','3','4','5'],                                                                a: 2 },
      { q: 'Which country hosted the 2020 Summer Olympics (held in 2021)?',   o: ['China','France','Japan','USA'],                                                 a: 2 },
      { q: 'In basketball, how many points is a field goal worth?',           o: ['1','2','3','4'],                                                                a: 1 },
      { q: 'Which Indian cricketer is known as "The Wall"?',                  o: ['Sachin Tendulkar','Sourav Ganguly','Rahul Dravid','VVS Laxman'],                a: 2 },
      { q: 'How long is a standard marathon race?',                           o: ['40 km','41.1 km','42.195 km','43 km'],                                          a: 2 },
    ]
  },
  {
    id: 'popculture', name: 'Pop Culture', icon: '🎬', color: '#c03aff',
    desc: 'Movies, music, memes & celebrities',
    qs: [
      { q: 'Who sang "Thriller" (1982)?',                                     o: ['Prince','Elvis Presley','Michael Jackson','David Bowie'],                       a: 2 },
      { q: 'Which movie features the character "Jack Sparrow"?',              o: ['Pirates of the Caribbean','Treasure Island','Black Sails','Waterworld'],        a: 0 },
      { q: 'Which TV show features characters Ross, Rachel, and Chandler?',   o: ['Seinfeld','How I Met Your Mother','Friends','The Office'],                      a: 2 },
      { q: 'Who directed the movie "Inception" (2010)?',                      o: ['Steven Spielberg','James Cameron','Christopher Nolan','Ridley Scott'],          a: 2 },
      { q: 'What is the name of Iron Man\'s AI assistant in the Marvel movies?', o: ['Friday','Vision','Jarvis','Ultron'],                                         a: 2 },
      { q: 'Who wrote the Harry Potter series?',                              o: ['J.R.R. Tolkien','C.S. Lewis','J.K. Rowling','Suzanne Collins'],                 a: 2 },
      { q: 'Which band performed "Bohemian Rhapsody"?',                       o: ['The Beatles','Led Zeppelin','Queen','The Rolling Stones'],                      a: 2 },
      { q: 'What colour pill does Neo take in "The Matrix" to see the truth?', o: ['Blue','Green','Red','White'],                                                  a: 2 },
      { q: 'Which platform is known for short video "Reels" and "Stories"?',  o: ['Twitter','YouTube','TikTok','Instagram'],                                       a: 3 },
      { q: 'What is the best-selling video game of all time (as of 2024)?',   o: ['GTA V','Tetris','Minecraft','Wii Sports'],                                      a: 2 },
    ]
  },
];

// ye fixed numbers hain jo poore code mein use hote hain
// Q_SEC=har que ke liye 20 seconds
// TOT_SEC=poore quiz ke liye 200 second
// C_RING=CHHOTI TIMER RING KA size
// C_SCORE-badi result ring ka size
// LTRS-options ke letters A B C D
const Q_SEC   = 20;
const TOT_SEC = 200;
const C_RING  = 2 * Math.PI * 22;
const C_SCORE = 2 * Math.PI * 68;
const LTRS    = ['A','B','C','D'];

// isme poore quiz ke baare me likha hota hai
let S = {};

// naya quiz shuru karne ke liye diary saaf karta hai phele purane timers band karo
// phir sab reset kero 
function resetState(cat) {
  clearInterval(S.qT);
  clearInterval(S.totT);
  S = {
    cat, qs: [...cat.qs],// questions ki copy banata hai taki original safe rahe
    idx: 0, score: 0, results: [],
    qSec: Q_SEC, totSec: TOT_SEC,
    answered: false,
    qT: null, totT: null,
    t0: Date.now()
  };
}

// isse page upar scroll ho jaata hai smoothly
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Yeh 6 category cards banata hai screen pe. CATS.map(...) — har category ke liye ek card banao
// style="--cc:${c.color}" — har card ka apna color,onclick="startQuiz('${c.id}')" — click karo toh quiz shuru , .join('') — sab cards jod ke ek saath dikhao
function buildGrid() {
  document.getElementById('sel-grid').innerHTML = CATS.map(c => `
    <div class="sel-card" style="--cc:${c.color}" onclick="startQuiz('${c.id}')">
      <div class="sel-icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <div class="sel-meta">
        <span class="sel-badge sb-q">10 Questions</span>
        <span class="sel-badge sb-t">⏱ 20s / Q</span>
      </div>
      <div class="sel-arr">→</div>
    </div>`).join('');
}

// Jab category pe click karo toh yeh chalta hai.Clicked category ki details dhundho,State reset karo — naya quiz
// Upar category ka naam dikhao,Quiz screen on karo,Pehla question dikhao,Total timer shuru karo
function startQuiz(id) {
  const cat = CATS.find(c => c.id === id);
  resetState(cat);
  document.getElementById('qtb-name').textContent = `${cat.icon}  ${cat.name}`;
  show('screen-quiz');
  renderQ();
  startTotTimer();
}

//Yeh ek question screen pe dikhata hai.Purana timer band karo answered = false — abhi jawab nahi diya
// S.qs[S.idx] — current question uthao S.idx + 1 — question number (1 se shuru, 0 se nahi)
function renderQ() {
  killQ();
  S.answered = false;
  S.qSec = Q_SEC;

  const q   = S.qs[S.idx];
  const num = S.idx + 1;
  const tot = S.qs.length;

  document.getElementById('q-num').textContent    = `Question ${String(num).padStart(2,'0')} / ${tot}`;
  document.getElementById('q-text').textContent   = q.q;
  document.getElementById('qp-txt').textContent   = `Question ${num} of ${tot}`;
  document.getElementById('qp-score').textContent = `Score: ${S.score}`;
  document.getElementById('qp-bar').style.width   = `${((num - 1) / tot) * 100}%`;

  const fb = document.getElementById('q-fb');
  fb.className   = 'q-fb';
  fb.textContent = '';
  document.getElementById('next-wrap').className = 'next-wrap';

  // Yeh 4 option buttons banata hai.Har option ke liye ek button A, B, C, D letter lagao Click hone pe pick(0), pick(1) etc. chalega
  document.getElementById('q-opts').innerHTML = q.o.map((opt, i) => `
    <button class="opt" id="o${i}" onclick="pick(${i})">
      <span class="opt-ltr">${LTRS[i]}</span>
      <span>${opt}</span>
    </button>`).join('');

  const card = document.getElementById('q-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'fadeIn .35s ease';

  updateRing(Q_SEC, Q_SEC);
  startQTimer();
}

// Yeh 20 second ka countdown hai.Har 1000ms (1 second) mein chalata hai S.qSec-- — ek second minus karo Ring update karo Agar 0 ho gaya aur jawab nahi diya — timeout() call karo
function startQTimer() {
  S.qT = setInterval(() => {
    S.qSec--;
    updateRing(S.qSec, Q_SEC);
    if (S.qSec <= 0) { clearInterval(S.qT); if (!S.answered) timeout(); }
  }, 1000);
}

function startTotTimer() {
  S.totT = setInterval(() => {
    S.totSec--;
    updateTot(S.totSec);
    if (S.totSec <= 0) { clearInterval(S.totT); clearInterval(S.qT); showResult(); }
  }, 1000);
}

function killQ() { clearInterval(S.qT); }

// timer ring ka animation karta hai aada se zyada time -green ;quarter time bacha-yellow;khatam hone wala -red
function updateRing(cur, max) {
  const pct = Math.max(0, cur) / max;
  const fg  = document.getElementById('ring-fg');
  fg.style.strokeDashoffset = C_RING * (1 - pct);
  fg.style.stroke = pct > .5 ? '#4cde7f' : pct > .25 ? '#e8ff47' : '#ff5c3a';
  document.getElementById('ring-num').textContent = Math.max(0, cur);
}

// total timer dikhata hai jaise 3:20  Math.floor(sec/60) — minutes nikalo sec%60 — baaki seconds padStart(2,'0') — ek digit ho toh aage 0 lagao — 3:05 ;30 second bacha toh red ho jaata hai
function updateTot(sec) {
  const el = document.getElementById('tot-val');
  el.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  sec <= 30 ? el.classList.add('danger') : el.classList.remove('danger');
}

// Jab option pe click karo.Agar pehle se jawab diya toh kuch mat karo answered = true — mark karo jawab de diya Timer band karo
function pick(i) {
  if (S.answered) return;
  S.answered = true;
  killQ();

  const q  = S.qs[S.idx];
  const ok = i === q.a;
  if (ok) S.score++;

  // ye agar sahi answer answer ho to green button show kerta hai verna red
  document.querySelectorAll('.opt').forEach((b, j) => {
    b.disabled = true;
    if (j === i && ok)    b.classList.add('correct');
    if (j === i && !ok)   b.classList.add('wrong');
    if (j === q.a && !ok) b.classList.add('reveal');
  });

  const fb = document.getElementById('q-fb');
  fb.textContent = ok ? '✓ Correct!' : `✗ Wrong! Correct answer: ${q.o[q.a]}`;
  fb.className   = `q-fb show ${ok ? 'ok' : 'bad'}`;

  S.results.push({ q: q.q, o: q.o, a: q.a, c: i });
  document.getElementById('qp-score').textContent = `Score: ${S.score}`;
  document.getElementById('next-wrap').className  = 'next-wrap show';
}

// agar 20 second mein jawab nahi diya  to true answer ko mark kar do or times up message show kero or -1 save kero 
function timeout() {
  S.answered = true;
  const q = S.qs[S.idx];
  document.querySelectorAll('.opt').forEach((b, j) => {
    b.disabled = true;
    if (j === q.a) b.classList.add('reveal');
  });
  const fb = document.getElementById('q-fb');
  fb.textContent = `⏱ Time's up! Correct: ${q.o[q.a]}`;
  fb.className   = 'q-fb show tout';
  S.results.push({ q: q.q, o: q.o, a: q.a, c: -1 });
  document.getElementById('next-wrap').className = 'next-wrap show';
}


// next click kerne per agala question dikhao or sare ho giye ho to result dikhao
document.getElementById('btn-next').addEventListener('click', () => {
  S.idx++;
  if (S.idx >= S.qs.length) { clearInterval(S.totT); showResult(); }
  else renderQ();
});


// final numner calculate kerna cor-kitne sahi,wrg-kitne galat,skp-kitne skip,acc-percentage
// tim-quiz mein kitna time laga/millisecond ko second me badlo,cs-combined score
function showResult() {
  killQ();
  clearInterval(S.totT);

  const tot  = S.qs.length;
  const cor  = S.score;
  const wrg  = S.results.filter(r => r.c !== -1 && r.c !== r.a).length;
  const skp  = S.results.filter(r => r.c === -1).length;
  const acc  = Math.round((cor / tot) * 100);
  const tim  = Math.round((Date.now() - S.t0) / 1000);
  const pct  = cor / tot;
  const cs   = calcCombined(cor, tot, acc);

  const msgs = [
    { min: .9, t: 'Outstanding <em>Result!</em>', m: 'Incredible! A true master of this subject. 🏆' },
    { min: .7, t: 'Great <em>Job!</em>',          m: 'Impressive! You clearly know your stuff. 🎯'   },
    { min: .5, t: 'Good <em>Effort!</em>',        m: 'Solid attempt! Study a bit more and ace it. 📚' },
    { min: .3, t: 'Keep <em>Practicing!</em>',    m: 'Nice try! Review the answers and come back. 💪' },
    { min:  0, t: 'Don\'t <em>Give Up!</em>',     m: 'Every expert was once a beginner. Retry! 🌱'   },
  ];
  const m = msgs.find(x => pct >= x.min);

  document.getElementById('res-tag').textContent   = `// ${S.cat.name} — Result`;
  document.getElementById('res-title').innerHTML   = m.t;
  document.getElementById('sr-num').textContent    = cor;
  document.getElementById('sr-den').textContent    = `/ ${tot}`;
  document.getElementById('rs-cor').textContent    = cor;
  document.getElementById('rs-wrg').textContent    = wrg;
  document.getElementById('rs-skp').textContent    = skp;
  document.getElementById('rs-acc').textContent    = `${acc}%`;
  document.getElementById('rs-tim').textContent    = `${tim}s`;
  document.getElementById('res-msg').textContent   = m.m;

  const col = pct >= .7 ? '#4cde7f' : pct >= .4 ? '#e8ff47' : '#ff5c3a';
  
  // result ring animate 300ms ka wait karo-pehle screen aaye phir animation ,ring score ke hisab se fill ho jaati hai,color bhi score ke hisaab se green/yellow/red
  setTimeout(() => {
    const fg = document.getElementById('sr-fg');
    fg.style.strokeDashoffset = C_SCORE * (1 - pct);
    fg.style.stroke = col;
    document.getElementById('sr-num').style.color = col;
  }, 300);


  // result screen pe 2 buttons hain retry-same quiz dobara shuru ,pick another-category select screen pe wapas jao
  document.getElementById('review-list').innerHTML = S.results.map((r, i) => {
    const ok = r.c === r.a;
    const ua = r.c >= 0 ? r.o[r.c] : 'No answer';
    return `<div class="rev-item">
      <div class="rev-q">Q${i + 1}. ${r.q}</div>
      <div class="rev-ans">
        <span class="rev-a ${ok ? 'rev-cor' : 'rev-wrg'}">${ok ? '✓' : '✗'} Your answer: ${ua}</span>
        ${!ok ? `<span class="rev-a rev-ans-correct">✓ Correct: ${r.o[r.a]}</span>` : ''}
      </div>
    </div>`;
  }).join('');

  /* ── Save to localStorage ── */
  saveResult({
    id:            Date.now(),
    cat:           S.cat.id,
    catName:       S.cat.name,
    catIcon:       S.cat.icon,
    score:         cor,
    total:         tot,
    accuracy:      acc,
    timeUsed:      tim,
    combinedScore: cs,
    date:          new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time:          new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  });

  /* ── Render History ── */
  renderHistory();

  show('screen-result');
}

/* ── RESULT BUTTONS ── */
document.getElementById('btn-retry').addEventListener('click', () => startQuiz(S.cat.id));
document.getElementById('btn-pick').addEventListener('click',  () => show('screen-select'));

// Agar link mein ?cat=science likha ho toh seedha science quiz ho jata hai-select screen nahi aata
function checkURLParam() {
  const params = new URLSearchParams(window.location.search);
  const catId  = params.get('cat');
  if (catId && CATS.find(c => c.id === catId)) startQuiz(catId);
}

// ye sabse pehle chalte hain jab page khulta hai 
buildGrid(); // 6 category cards banao
checkURLParam(); // URL mein koi category hai toh seedha start karo