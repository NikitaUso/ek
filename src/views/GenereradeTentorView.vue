<template>
  <div class="view-container">
    <h1 class="main-title">Tentamen: Räkneuppgifter</h1>

    <!-- 1. START-LÄGE -->
    <div v-if="gameState === 'start'" class="start-card">
      <h2 class="card-title">Inställningar</h2>
      <p class="card-desc">
        Här simuleras en tenta med <strong>varierade frågor</strong> och <strong>slumpmässiga siffror</strong>.
        Precis som på riktigt kan frågan gälla allt från resultat till säkerhetsmarginal.
      </p>
      
      <div class="settings-grid">
        <!-- Omfattning -->
        <div class="setting-group">
          <label class="setting-label">Antal frågor:</label>
          <select v-model="examLength" class="styled-select">
            <option :value="3">Kort (3 st)</option>
            <option :value="5">Medel (5 st)</option>
            <option :value="10">Lång (10 st)</option>
            <option :value="99">Alla varianter</option>
          </select>
        </div>

        <!-- Timer -->
        <div class="setting-group">
          <label class="setting-label">Tidspress:</label>
          <div class="toggle-group">
            <button 
              class="toggle-btn" 
              :class="{ active: enableTimer }" 
              @click="enableTimer = true"
            >På</button>
            <button 
              class="toggle-btn" 
              :class="{ active: !enableTimer }" 
              @click="enableTimer = false"
            >Av</button>
          </div>
          <p class="setting-info" v-if="enableTimer">
            {{ timeDescription }}
          </p>
        </div>

        <!-- Rättningsläge -->
        <div class="setting-group">
          <label class="setting-label">Rättning:</label>
          <div class="toggle-group">
            <button 
              class="toggle-btn" 
              :class="{ active: feedbackMode === 'end' }" 
              @click="feedbackMode = 'end'"
            >I slutet</button>
            <button 
              class="toggle-btn" 
              :class="{ active: feedbackMode === 'instant' }" 
              @click="feedbackMode = 'instant'"
            >Direkt</button>
          </div>
          <p class="setting-info">
            {{ feedbackMode === 'end' ? 'Lämna in allt när du är klar.' : 'Se facit efter varje fråga.' }}
          </p>
        </div>
      </div>

      <button class="main-btn" @click="startExam">Starta Tenta</button>
    </div>

    <!-- 2. TENTA-LÄGE -->
    <div v-else-if="gameState === 'active'" class="exam-container">
      
      <!-- Timer & Progress -->
      <div class="exam-header">
        <div v-if="enableTimer" class="timer" :class="{ 'urgent': timeLeft < 300 }">
          ⏳ Tid kvar: {{ formattedTime }}
        </div>
        <div v-else class="timer disabled">
          ∞ Ingen tidspress
        </div>
        <div class="progress">
          Uppgift {{ currentQuestionIndex + 1 }} av {{ questions.length }}
        </div>
      </div>

      <!-- Frågekort -->
      <div class="question-card">
        <span class="category-tag">{{ currentQuestion.category }}</span>
        
        <!-- SCENARIO / BAKGRUNDSTEXT -->
        <div class="scenario-box" v-if="currentQuestion.scenario">
          <div class="scenario-label">Förutsättningar</div>
          <div class="scenario-content" v-html="currentQuestion.scenario"></div>
        </div>

        <!-- SJÄLVA FRÅGAN -->
        <h3 class="question-text">{{ currentQuestion.text }}</h3>

        <!-- Svarsfält -->
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="answers[currentQuestion.id]" 
            :placeholder="currentQuestion.placeholder || 'Ditt svar...'"
            class="text-input"
            @keyup.enter="handleEnterKey"
            ref="answerInput"
            :disabled="isInstantChecked"
          />
          <p class="hint-text" v-if="!isInstantChecked">
            {{ currentQuestion.hint || 'Svara med siffror.' }}
          </p>
        </div>

        <!-- INSTANT FEEDBACK BOX -->
        <div v-if="isInstantChecked" class="instant-feedback-box" :class="isInstantCorrect ? 'is-correct' : 'is-wrong'">
          <div class="feedback-header">
            <strong>{{ isInstantCorrect ? 'Rätt svar!' : 'Tyvärr, fel svar.' }}</strong>
          </div>
          <p v-if="!isInstantCorrect">
            Rätt svar var: <strong>{{ currentQuestion.displayAnswer || currentQuestion.correctAnswer }}</strong>
          </p>
          <div class="explanation-content" v-html="currentQuestion.explanation"></div>
        </div>

        <!-- Navigering -->
        <div class="nav-buttons">
          <button 
            v-if="feedbackMode === 'instant' && !isInstantChecked"
            class="check-btn"
            @click="checkCurrentQuestion"
          >
            Rätta frågan
          </button>

          <template v-else>
            <button 
              v-if="currentQuestionIndex > 0 && feedbackMode === 'end'" 
              class="nav-btn secondary" 
              @click="prevQuestion"
            >
              ← Föregående
            </button>
            
            <button 
              v-if="currentQuestionIndex < questions.length - 1" 
              class="nav-btn primary" 
              @click="nextQuestion"
            >
              Nästa uppgift →
            </button>

            <button 
              v-if="currentQuestionIndex === questions.length - 1" 
              class="submit-btn" 
              @click="submitExam"
            >
              {{ feedbackMode === 'instant' ? 'Avsluta och se resultat' : 'Lämna in Tenta' }}
            </button>
          </template>
        </div>
      </div>
      
      <!-- Översiktsmeny -->
      <div class="overview-grid">
        <div 
          v-for="(q, index) in questions" 
          :key="q.id"
          class="overview-dot"
          :class="{ 
            'active': index === currentQuestionIndex, 
            'answered': answers[q.id] && feedbackMode === 'end',
            'instant-correct': feedbackMode === 'instant' && instantStatus[q.id] === 'correct',
            'instant-wrong': feedbackMode === 'instant' && instantStatus[q.id] === 'wrong'
          }"
          @click="canNavigateTo(index) ? currentQuestionIndex = index : null"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>

    <!-- 3. RESULTAT-LÄGE -->
    <div v-else-if="gameState === 'result'" class="result-container">
      <div class="score-card">
        <h2>Resultat</h2>
        <!-- Betygsraden är borttagen här -->
        <div class="result-circle">
          <span class="result-number">{{ score }}</span>
          <span class="result-total">/ {{ questions.length }}</span>
        </div>
        <p class="score-text">Du fick {{ score }} av {{ questions.length }} rätt ({{ percentage }}%)</p>
        
        <button class="main-btn" @click="resetGame">Gör en ny tenta</button>
      </div>

      <!-- Genomgång -->
      <div class="review-list">
        <h3>Sammanfattning</h3>
        <div 
          v-for="(q, index) in questions" 
          :key="q.id" 
          class="review-item"
          :class="{ 'correct': isCorrect(q), 'wrong': !isCorrect(q) }"
        >
          <div class="review-header">
            <strong>Uppgift {{ index + 1 }}</strong>
            <span class="icon">{{ isCorrect(q) ? '✅ Rätt' : '❌ Fel' }}</span>
          </div>
          
          <div class="mini-scenario" v-html="q.scenario"></div>
          <p class="review-q"><strong>Fråga:</strong> {{ q.text }}</p>
          
          <div class="review-answer">
            <p><strong>Ditt svar:</strong> {{ formatAnswer(answers[q.id]) }}</p>
            <p v-if="!isCorrect(q)" class="correct-answer">
              <strong>Rätt svar:</strong> {{ q.displayAnswer || q.correctAnswer }}
            </p>
            
            <div class="explanation-box" v-if="q.explanation && feedbackMode === 'end'">
              <strong>Lösning:</strong>
              <div v-html="q.explanation"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from 'vue';

// --- STATE ---
const gameState = ref('start'); 
const examLength = ref(5);
const enableTimer = ref(true);
const feedbackMode = ref('end');

const questions = ref([]);
const answers = ref({});
const instantStatus = ref({}); 
const currentQuestionIndex = ref(0);
const timeLeft = ref(0);
const timerInterval = ref(null);
const answerInput = ref(null);

// --- HJÄLPFUNKTIONER FÖR SLUMP ---
const rnd = (min, max, step = 1) => {
  const range = (max - min) / step;
  return Math.floor(Math.random() * (range + 1)) * step + min;
};

const fmt = (num) => num.toLocaleString('sv-SE');

// --- GENERERA FRÅGOR MED VARIATION ---
const generateQuestions = () => {
  const bank = [];
  const numQuestions = examLength.value === 99 ? 15 : examLength.value;

  for (let i = 0; i < numQuestions; i++) {
    // Slumpa vilken typ av "block" vi ska generera
    // 0: Budget/CVP, 1: Investering, 2: Produktkalkyl
    const type = Math.floor(Math.random() * 3); 

    if (type === 0) {
      // --- BUDGET / CVP ---
      const volym = rnd(1000, 5000, 100);
      const pris = rnd(500, 2000, 50);
      const rk = Math.floor(pris * rnd(0.4, 0.6, 0.05)); // RK är 40-60% av pris
      const fk = rnd(500000, 2000000, 50000);
      
      const tb_st = pris - rk;
      const tg = tb_st / pris;
      const np_volym = Math.ceil(fk / tb_st);
      const np_oms = np_volym * pris;
      const resultat = (pris - rk) * volym - fk;
      const safety_margin = Math.round(((volym - np_volym) / volym) * 100);

      const scenarioText = `
        <p>Ett företag säljer en produkt med följande budgeterade data:</p>
        <ul>
          <li>Försäljningspris: ${fmt(pris)} kr/st</li>
          <li>Rörlig kostnad: ${fmt(rk)} kr/st</li>
          <li>Totala fasta kostnader: ${fmt(fk)} kr</li>
          <li>Budgeterad volym: ${fmt(volym)} st</li>
        </ul>
      `;

      // Slumpa vilken fråga vi ställer om detta case
      const qType = Math.floor(Math.random() * 4); // 0, 1, 2, 3
      
      if (qType === 0) {
        bank.push({
          id: `bud_res_${i}`, category: 'Budgetering',
          scenario: scenarioText,
          text: 'Beräkna företagets budgeterade resultat. Svara i kr.',
          correctAnswer: resultat, displayAnswer: fmt(resultat) + ' kr',
          explanation: `TB/st = ${pris} - ${rk} = ${tb_st} kr.<br>Totalt TB = ${tb_st} * ${volym} = ${fmt(tb_st*volym)}.<br>Resultat = ${fmt(tb_st*volym)} - ${fmt(fk)} = <strong>${fmt(resultat)} kr</strong>.`
        });
      } else if (qType === 1) {
        bank.push({
          id: `bud_np_${i}`, category: 'Nollpunktsanalys',
          scenario: scenarioText,
          text: 'Beräkna kritisk volym (nollpunktsvolym). Svara i antal stycken (avrunda uppåt).',
          correctAnswer: np_volym, displayAnswer: fmt(np_volym) + ' st',
          explanation: `TB/st = ${pris} - ${rk} = ${tb_st} kr.<br>Nollpunkt = FK / TB = ${fk} / ${tb_st} ≈ <strong>${fmt(np_volym)} st</strong>.`
        });
      } else if (qType === 2) {
        bank.push({
          id: `bud_oms_${i}`, category: 'Nollpunktsanalys',
          scenario: scenarioText,
          text: 'Beräkna kritisk omsättning. Svara i kr.',
          correctAnswer: np_oms, displayAnswer: fmt(np_oms) + ' kr',
          tolerance: pris, // Tolerera +/- ett styckepris diff pga avrundning
          explanation: `Nollpunktsvolym = ${fmt(np_volym)} st.<br>Kritisk omsättning = ${fmt(np_volym)} * ${pris} = <strong>${fmt(np_oms)} kr</strong>.`
        });
      } else {
        bank.push({
          id: `bud_saf_${i}`, category: 'Nollpunktsanalys',
          scenario: scenarioText,
          text: 'Beräkna säkerhetsmarginalen i procent. Svara med heltal.',
          correctAnswer: safety_margin, displayAnswer: safety_margin + '%',
          hint: 'Svara i procent (t.ex. 25).',
          explanation: `Nollpunktsvolym = ${fmt(np_volym)} st.<br>Säkerhetsmarginal = ((${volym} - ${np_volym}) / ${volym}) * 100 ≈ <strong>${safety_margin}%</strong>.`
        });
      }
    } 
    
    else if (type === 1) {
      // --- INVESTERING ---
      const grundinv = rnd(2000, 10000, 500) * 1000; // 2M - 10M
      const livslangd = rnd(3, 5);
      const inbet = Math.floor((grundinv / livslangd) * rnd(1.3, 1.6, 0.1)); // Payback runt 2.5 - 3.5 år
      const kalkylranta = rnd(8, 15);
      
      // Tabell för nuvärdesfaktor (enkel formel)
      const nvf = (r, n) => 1 / Math.pow(1 + r/100, n);
      let sumNuvarde = 0;
      for(let y=1; y<=livslangd; y++) sumNuvarde += inbet * nvf(kalkylranta, y);
      sumNuvarde = Math.round(sumNuvarde);
      
      const nnv = sumNuvarde - grundinv;
      const payback = Math.round((grundinv / inbet) * 10) / 10;
      const nnv_kvot = Math.round((nnv / grundinv) * 100) / 100;

      const scenarioText = `
        <p>Ett företag överväger en investering:</p>
        <ul>
          <li>Grundinvestering: ${fmt(grundinv)} kr</li>
          <li>Ekonomisk livslängd: ${livslangd} år</li>
          <li>Årligt inbetalningsöverskott: ${fmt(inbet)} kr</li>
          <li>Kalkylränta: ${kalkylranta}%</li>
          <li>Inga restvärden.</li>
        </ul>
      `;

      const qType = Math.floor(Math.random() * 3); // 0, 1, 2
      
      if (qType === 0) {
        bank.push({
          id: `inv_pay_${i}`, category: 'Investering',
          scenario: scenarioText,
          text: 'Beräkna återbetalningstiden (Payback). Svara i år med 1 decimal.',
          correctAnswer: payback, displayAnswer: payback.toLocaleString('sv-SE') + ' år',
          tolerance: 0.1,
          explanation: `Återbetalningstid = Grundinvestering / Årligt överskott = ${fmt(grundinv)} / ${fmt(inbet)} ≈ <strong>${payback.toLocaleString('sv-SE')} år</strong>.`
        });
      } else if (qType === 1) {
        bank.push({
          id: `inv_nnv_${i}`, category: 'Investering',
          scenario: scenarioText,
          text: 'Beräkna Nettonuvärdet (NNV). Svara i kr.',
          correctAnswer: nnv, displayAnswer: fmt(nnv) + ' kr',
          tolerance: 1000, // Tolerera lite avrundning
          explanation: `Summa nuvärde av inbetalningar ≈ ${fmt(sumNuvarde)} kr.<br>NNV = ${fmt(sumNuvarde)} - ${fmt(grundinv)} = <strong>${fmt(nnv)} kr</strong>.`
        });
      } else {
         bank.push({
          id: `inv_kvot_${i}`, category: 'Investering',
          scenario: scenarioText,
          text: 'Beräkna Nettonuvärdeskvoten (NNV-kvot). Svara med 2 decimaler.',
          correctAnswer: nnv_kvot, displayAnswer: nnv_kvot.toLocaleString('sv-SE'),
          tolerance: 0.05,
          explanation: `NNV = ${fmt(nnv)} kr.<br>NNV-kvot = NNV / Grundinvestering = ${fmt(nnv)} / ${fmt(grundinv)} ≈ <strong>${nnv_kvot.toLocaleString('sv-SE')}</strong>.`
        });
      }
    } 
    
    else {
      // --- PRODUKTKALKYL ---
      const dm = rnd(200, 800, 50);
      const dl = rnd(300, 900, 50);
      const mo_proc = rnd(10, 50, 5);
      const to_proc = rnd(20, 80, 5);
      const affo_st = rnd(100, 300, 10);
      const vinst_proc = rnd(10, 25, 5);

      const mo = dm * (mo_proc/100);
      const to = dl * (to_proc/100);
      const tvk = dm + dl + mo + to;
      const sjk = tvk + affo_st;
      const pris = Math.round(sjk * (1 + vinst_proc/100));

      const scenarioText = `
        <p>Kalkylera kostnaderna för produkten "X":</p>
        <ul>
          <li>Direkt material (DM): ${dm} kr/st</li>
          <li>Direkt lön (DL): ${dl} kr/st</li>
          <li>MO-pålägg: ${mo_proc}% (på DM)</li>
          <li>TO-pålägg: ${to_proc}% (på DL)</li>
          <li>AFFO-tillägg: ${affo_st} kr/st</li>
          <li>Vinstpålägg: ${vinst_proc}% (på självkostnaden)</li>
        </ul>
      `;

      const qType = Math.floor(Math.random() * 3); // 0, 1, 2
      
      if (qType === 0) {
        bank.push({
          id: `kalk_tvk_${i}`, category: 'Produktkalkyl',
          scenario: scenarioText,
          text: 'Beräkna Tillverkningskostnaden (TVK) per styck.',
          correctAnswer: tvk, displayAnswer: fmt(tvk) + ' kr',
          explanation: `MO = ${dm} * ${mo_proc/100} = ${mo} kr.<br>TO = ${dl} * ${to_proc/100} = ${to} kr.<br>TVK = DM + MO + DL + TO = ${dm} + ${mo} + ${dl} + ${to} = <strong>${fmt(tvk)} kr</strong>.`
        });
      } else if (qType === 1) {
        bank.push({
          id: `kalk_sjk_${i}`, category: 'Produktkalkyl',
          scenario: scenarioText,
          text: 'Beräkna Självkostnaden per styck.',
          correctAnswer: sjk, displayAnswer: fmt(sjk) + ' kr',
          explanation: `TVK = ${fmt(tvk)} kr.<br>Självkostnad = TVK + AFFO = ${tvk} + ${affo_st} = <strong>${fmt(sjk)} kr</strong>.`
        });
      } else {
        bank.push({
          id: `kalk_pris_${i}`, category: 'Produktkalkyl',
          scenario: scenarioText,
          text: 'Beräkna försäljningspriset (inkl vinstpålägg).',
          correctAnswer: pris, displayAnswer: fmt(pris) + ' kr',
          explanation: `Självkostnad = ${fmt(sjk)} kr.<br>Vinst = ${sjk} * ${vinst_proc/100} = ${sjk * vinst_proc/100} kr.<br>Pris = ${sjk} + vinst = <strong>${fmt(pris)} kr</strong>.`
        });
      }
    }
  }
  
  return bank;
};

// --- LOGIK ---

const startExam = () => {
  questions.value = generateQuestions();
  answers.value = {};
  instantStatus.value = {};
  currentQuestionIndex.value = 0;
  gameState.value = 'active';
  
  if (enableTimer.value) {
    // 5 min per fråga som bas
    timeLeft.value = questions.value.length * 300;
    startTimer();
  } else {
    stopTimer();
  }
};

const startTimer = () => {
  stopTimer();
  timerInterval.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      submitExam(); 
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
};

// Navigering och hantering av Enter/Input
const handleEnterKey = () => {
  if (feedbackMode.value === 'instant' && !isInstantChecked.value) {
    checkCurrentQuestion();
  } else if (feedbackMode.value === 'end') {
    nextQuestion();
  }
};

const canNavigateTo = (index) => true;

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
    focusInput();
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    focusInput();
  }
};

const focusInput = () => {
  nextTick(() => {
    if(answerInput.value && !answerInput.value.disabled) {
      answerInput.value.focus();
    }
  });
};

const checkCurrentQuestion = () => {
  const q = currentQuestion.value;
  const correct = isCorrect(q);
  instantStatus.value[q.id] = correct ? 'correct' : 'wrong';
};

const isCorrect = (q) => {
  const userStr = answers.value[q.id];
  if (!userStr) return false;
  
  let cleanUser = String(userStr)
    .toLowerCase()
    .replace(/kr|tkr|%|st|år|timmar|\s/g, '') 
    .replace(',', '.'); 
  
  const userVal = parseFloat(cleanUser);
  const correctVal = q.correctAnswer;
  
  if (isNaN(userVal)) return false;

  const tol = q.tolerance !== undefined ? q.tolerance : 0.5;
  return Math.abs(userVal - correctVal) <= tol;
};

const submitExam = () => {
  stopTimer();
  gameState.value = 'result';
};

const formatAnswer = (val) => val ? val : '(Inget svar)';

const score = computed(() => questions.value.filter(q => isCorrect(q)).length);
const percentage = computed(() => questions.value.length === 0 ? 0 : Math.round((score.value / questions.value.length) * 100));

const resetGame = () => {
  gameState.value = 'start';
  stopTimer();
};

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {});
const isInstantChecked = computed(() => !!instantStatus.value[currentQuestion.value.id]);
const isInstantCorrect = computed(() => instantStatus.value[currentQuestion.value.id] === 'correct');
const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}m ${s < 10 ? '0' + s : s}s`;
});
const timeDescription = computed(() => {
  const q = examLength.value === 99 ? 15 : examLength.value;
  return `${q * 5} minuter totalt.`;
});

onUnmounted(() => stopTimer());
</script>

<style scoped>
.view-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 85vh;
  color: #333;
}

.main-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

/* START SETTINGS */
.start-card, .score-card {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  text-align: center;
  max-width: 600px; 
  width: 100%;
}

.result-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #FFCCFD;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  color: #333;
}

.result-number {
  font-size: 4rem;
  font-weight: bold;
  line-height: 1;
}

.result-total {
  font-size: 1.2rem;
  color: #666;
}

.score-text {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  text-align: left;
  margin: 2rem 0;
}

.setting-group {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #555;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.styled-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
}

.toggle-group {
  display: flex;
  background: #eee;
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: white;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.setting-info {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.5rem;
  font-style: italic;
}

/* EXAM UI */
.exam-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #666;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.timer.urgent { color: #e74c3c; animation: pulse 1s infinite; }
.timer.disabled { color: #aaa; }

.question-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  overflow: hidden;
  border: 1px solid #eee;
}

.category-tag {
  display: inline-block;
  background: #eef2f7;
  color: #555;
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 0 0 8px 0;
  font-weight: 600;
  text-transform: uppercase;
}

.scenario-box {
  background: #fdfdfd;
  border-bottom: 2px solid #f0f0f0;
  padding: 1.5rem 2rem;
  font-size: 0.95rem;
  color: #444;
}

.scenario-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.scenario-content :deep(th), .scenario-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.scenario-content :deep(th) { background-color: #f2f2f2; }

.question-text {
  padding: 2rem 2rem 1rem 2rem;
  font-size: 1.25rem;
  color: #222;
  margin: 0;
}

.input-wrapper {
  padding: 0 2rem 2rem 2rem;
}

.text-input {
  width: 100%;
  max-width: 300px;
  padding: 12px;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
}
.text-input:disabled { background: #f5f5f5; color: #888; }
.hint-text { margin-top: 8px; color: #777; font-size: 0.9rem; }

/* INSTANT FEEDBACK */
.instant-feedback-box {
  margin: 0 2rem 2rem 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 5px solid;
}
.is-correct { background: #f0fff4; border-color: #27ae60; color: #2f855a; }
.is-wrong { background: #fff5f5; border-color: #e74c3c; color: #c53030; }

.nav-buttons {
  padding: 1.5rem 2rem;
  background: #fcfcfc;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

/* BUTTONS */
.nav-btn, .submit-btn, .check-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  border: none;
  transition: all 0.2s;
  background-color: #FFCCFD; 
  color: #333;
}
.nav-btn.secondary { background: #e0e0e0; color: #555; }
.submit-btn { margin-left: auto; background-color: #333; color: #FFCCFD; }
.check-btn { width: 100%; background-color: #FFCCFD; color: #333; }
.nav-btn:hover, .submit-btn:hover { opacity: 0.9; }

.main-btn {
  background-color: #FFCCFD;
  color: #333;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* OVERVIEW DOTS */
.overview-grid {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.overview-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  color: #666;
}
.overview-dot.active { border: 2px solid #333; font-weight: bold; }
.overview-dot.answered { background: #FFCCFD; color: #333; }
.overview-dot.instant-correct { background: #27ae60; color: white; }
.overview-dot.instant-wrong { background: #e74c3c; color: white; }

/* Resultat & Review stilar */
.review-item { background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border-left: 6px solid #ddd; }
.review-item.correct { border-left-color: #27ae60; }
.review-item.wrong { border-left-color: #e74c3c; }

@media (max-width: 600px) {
  .settings-grid { grid-template-columns: 1fr; }
}

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
</style>