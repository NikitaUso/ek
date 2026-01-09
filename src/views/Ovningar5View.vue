<template>
  <div class="view-container">
    <h1 class="main-title">Pålägg & TB</h1>

    <!-- MENYVY -->
    <div v-if="!currentExercise" class="exercise-grid">
      <div class="menu-card" @click="selectExercise('order')">
        <h2 class="card-title">Självkostnad: Order</h2>
        <p class="card-desc">Beräkna kostnad för en kundorder (Påläggsmetoden)</p>
      </div>
      <div class="menu-card" @click="selectExercise('produkt')">
        <h2 class="card-title">Självkostnad: Produkt</h2>
        <p class="card-desc">Fördelning av TO och AFFO på produkter</p>
      </div>
      <div class="menu-card" @click="selectExercise('nollpunkt')">
        <h2 class="card-title">Nollpunkt (TB)</h2>
        <p class="card-desc">Beräkna kritisk volym via täckningsbidrag</p>
      </div>
      <div class="menu-card" @click="selectExercise('alternativ')">
        <h2 class="card-title">Välja alternativ</h2>
        <p class="card-desc">Jämför täckningsbidrag vid ledig kapacitet</p>
      </div>
      <div class="menu-card full-width" @click="selectExercise('mix')">
        <h2 class="card-title">Produktionsmix</h2>
        <p class="card-desc">Optimera mix vid trång sektion (flaskhals)</p>
      </div>
    </div>

    <!-- ÖVNINGSVY -->
    <div v-else class="exercise-card" :class="{ 'shake-error': status.isShaking }">
      <h2 class="exercise-title">{{ currentTitle }}</h2>
      
      <div class="scenario-header">
        <div class="question-content" v-html="currentQuestionText"></div>
      </div>

      <!-- INMATNINGSOMRÅDE -->
      <div class="input-area" v-if="!status.showSolution">
        
        <!-- Specialinmatning: Välja alternativ -->
        <div v-if="currentExercise === 'alternativ'" class="mix-inputs">
          <p class="instruction">Vilket alternativ ger högst täckningsbidrag?</p>
          <div class="button-group">
            <button 
              :class="{ 'selected-btn': userAnswer === 'Alt 1' }"
              @click="userAnswer = 'Alt 1'"
            >Alternativ 1</button>
            <button 
              :class="{ 'selected-btn': userAnswer === 'Alt 2' }"
              @click="userAnswer = 'Alt 2'"
            >Alternativ 2</button>
          </div>
          <button class="main-check-btn" @click="checkAnswer">Rätta</button>
        </div>

        <!-- Standard inmatning för tal -->
        <div v-else class="standard-input">
          <input 
            type="number" 
            v-model="userAnswer" 
            :placeholder="currentPlaceholder"
            step="0.01"
            :class="{ 'input-error': status.hasError }"
            @keyup.enter="checkAnswer" 
          />
          <button class="main-check-btn" @click="checkAnswer">Rätta</button>
        </div>
      </div>

      <!-- LÖSNING -->
      <div v-else class="solution-area" :class="{ 'correct-bg': isCorrect, 'wrong-bg': !isCorrect }">
        <p class="status-msg">{{ isCorrect ? 'Rätt svar!' : 'Rätt svar och lösning:' }}</p>
        <div class="logic-text" v-html="currentSolution"></div>
      </div>

      <div class="action-footer">
        <button @click="handleSkipAction" class="btn-skip-main">Skippa</button>
        <button @click="currentExercise = null" class="btn-back">Tillbaka till menyn</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const currentExercise = ref(null);
const userAnswer = ref(null);
const isCorrect = ref(false);
const status = reactive({ 
  showSolution: false, 
  hasError: false,
  isShaking: false 
});

// Scenario-objekt
const s = reactive({
  // Order (Pålägg)
  tko: 20, mko: 10, ao: 2, fo: 5,
  dlon: 5000, dmat: 10000, antal: 200,
  
  // Produkt (Reko AB Style)
  midi: { dm: 70, dl: 40, pris: 175, volym: 4000 },
  maxi: { dm: 140, dl: 60, pris: 300, volym: 2000 },
  totalTO: 280000,
  totalAFFO: 60000,
  targetProduct: 'Midi', 

  // Nollpunkt
  pris: 200, rk: 120, fk: 160000,
  
  // Alternativ
  alt1: { pris: 1000, rk: 800 },
  alt2: { pris: 1500, rk: 1250 },

  // Mix (Trång sektion)
  prodA: { name: 'Midi', pris: 300, rk: 150, tid: 0.5, demand: 1000 },
  prodB: { name: 'Maxi', pris: 500, rk: 200, tid: 1.0, demand: 800 },
  prodC: { name: 'Mega', pris: 400, rk: 100, tid: 0.8, demand: 1200 },
  kapacitet: 2000,
  mixTarget: 'Midi', // Vilken produkt vi frågar om (om frågetypen är kvantitet/timmar)
  mixQuestionType: 'quantity' // 'quantity', 'total_tb', 'hours'
});

const selectExercise = (type) => {
  currentExercise.value = type;
  generateValues();
};

const generateValues = () => {
  status.showSolution = false;
  status.hasError = false;
  status.isShaking = false;
  userAnswer.value = null;
  isCorrect.value = false;

  // 1. ORDER
  if (currentExercise.value === 'order') {
    s.tko = (Math.floor(Math.random() * 4) + 2) * 10;
    s.mko = (Math.floor(Math.random() * 3) + 1) * 5;
    s.ao = (Math.floor(Math.random() * 5) + 1) * 2;
    s.fo = (Math.floor(Math.random() * 5) + 1) * 2;
    s.dlon = (Math.floor(Math.random() * 50) + 10) * 100;
    s.dmat = (Math.floor(Math.random() * 80) + 20) * 100;
    s.antal = (Math.floor(Math.random() * 10) + 1) * 50;
  }
  
  // 2. PRODUKT
  else if (currentExercise.value === 'produkt') {
    s.midi.dm = (Math.floor(Math.random() * 5) + 5) * 10; 
    s.midi.dl = (Math.floor(Math.random() * 4) + 3) * 10; 
    s.midi.volym = (Math.floor(Math.random() * 5) + 2) * 1000; 

    s.maxi.dm = s.midi.dm * 2;
    s.maxi.dl = Math.floor(s.midi.dl * 1.5);
    s.maxi.volym = Math.floor(s.midi.volym / 2);

    const totalDL = (s.midi.dl * s.midi.volym) + (s.maxi.dl * s.maxi.volym);
    s.totalTO = Math.round(totalDL * (Math.random() * 0.5 + 0.5) / 1000) * 1000; 
    s.totalAFFO = (Math.floor(Math.random() * 10) + 5) * 10000;

    s.targetProduct = Math.random() > 0.5 ? 'Midi' : 'Maxi';
  }
  
  // 3. NOLLPUNKT
  else if (currentExercise.value === 'nollpunkt') {
    s.pris = (Math.floor(Math.random() * 40) + 20) * 10;
    s.rk = Math.floor(s.pris * (Math.random() * 0.3 + 0.4));
    s.fk = (Math.floor(Math.random() * 20) + 10) * 10000;
  }

  // 4. ALTERNATIV
  else if (currentExercise.value === 'alternativ') {
    s.alt1.pris = (Math.floor(Math.random() * 20) + 10) * 100;
    s.alt1.rk = Math.floor(s.alt1.pris * (Math.random() * 0.2 + 0.5));
    s.alt2.pris = s.alt1.pris + (Math.floor(Math.random() * 10) - 5) * 100;
    s.alt2.rk = Math.floor(s.alt2.pris * (Math.random() * 0.2 + 0.5));
  }

  // 5. MIX (Ny logik med variation)
  else if (currentExercise.value === 'mix') {
    // Slumpa priser & rk
    s.prodA.pris = 300 + Math.floor(Math.random()*200);
    s.prodA.rk = 100 + Math.floor(Math.random()*100);
    s.prodA.demand = (Math.floor(Math.random()*5)+5)*100; 
    
    s.prodB.pris = 400 + Math.floor(Math.random()*200);
    s.prodB.rk = 200 + Math.floor(Math.random()*100);
    s.prodB.demand = (Math.floor(Math.random()*5)+5)*100;

    s.prodC.pris = 500 + Math.floor(Math.random()*300);
    s.prodC.rk = 200 + Math.floor(Math.random()*200);
    s.prodC.demand = (Math.floor(Math.random()*5)+5)*100;
    
    const times = [0.5, 1.0, 1.5, 2.0];
    s.prodA.tid = times[Math.floor(Math.random() * times.length)];
    s.prodB.tid = times[Math.floor(Math.random() * times.length)];
    s.prodC.tid = times[Math.floor(Math.random() * times.length)];
    
    // Beräkna total tid som behövs
    const totalTimeNeeded = (s.prodA.tid * s.prodA.demand) + (s.prodB.tid * s.prodB.demand) + (s.prodC.tid * s.prodC.demand);
    s.kapacitet = Math.floor(totalTimeNeeded * (Math.random() * 0.3 + 0.4)); // Trång sektion
    
    // Välj fråga och produkt
    const prods = ['Midi', 'Maxi', 'Mega'];
    s.mixTarget = prods[Math.floor(Math.random() * prods.length)];
    
    // Slumpa typ av fråga: 0=Antal, 1=Totalt TB, 2=Timmar
    const types = ['quantity', 'quantity', 'total_tb', 'hours'];
    s.mixQuestionType = types[Math.floor(Math.random() * types.length)];
  }
};

const currentTitle = computed(() => {
  const map = {
    'order': 'Självkostnad för order',
    'produkt': 'Självkostnad för produkt',
    'nollpunkt': 'Nollpunkt utifrån TB',
    'alternativ': 'Välja mellan alternativ',
    'mix': 'Optimal Produktionsmix'
  };
  return map[currentExercise.value];
});

const currentQuestionText = computed(() => {
  // ... (Samma logik för Order, Produkt, Nollpunkt, Alternativ som tidigare) ...
  if (currentExercise.value === 'order') {
    return `
      <p><strong>Företaget X</strong> tillverkar trädgårdsmöbler. Pålägg:</p>
      <ul class="styled-list">
        <li><strong>TO:</strong> ${s.tko}% av direkt lön</li>
        <li><strong>MO:</strong> ${s.mko}% av direkt material</li>
        <li><strong>AO:</strong> ${s.ao}% av tillverkningskostnaden</li>
        <li><strong>FO:</strong> ${s.fo}% av tillverkningskostnaden</li>
      </ul>
      <p>För ordern (antal: ${s.antal} st) gäller:</p>
      <div class="info-box">
        Direkt lön: ${s.dlon.toLocaleString()} kr<br>
        Direkt material: ${s.dmat.toLocaleString()} kr
      </div>
      <p>Vad blir <strong>självkostnaden för hela ordern</strong>?</p>
    `;
  }
  if (currentExercise.value === 'produkt') {
    return `
      <p><strong>Företaget X</strong> har två produkter. Kalkylinformation:</p>
      <table class="data-table">
        <thead><tr><th></th><th>Midi</th><th>Maxi</th></tr></thead>
        <tbody>
          <tr><td>DM/st</td><td>${s.midi.dm} kr</td><td>${s.maxi.dm} kr</td></tr>
          <tr><td>DL/st</td><td>${s.midi.dl} kr</td><td>${s.maxi.dl} kr</td></tr>
          <tr><td>Volym</td><td>${s.midi.volym} st</td><td>${s.maxi.volym} st</td></tr>
        </tbody>
      </table>
      <div class="info-box">
        <strong>TO:</strong> ${s.totalTO.toLocaleString()} kr (Fördelas via DL)<br>
        <strong>AFFO:</strong> ${s.totalAFFO.toLocaleString()} kr (Fördelas via Volym)
      </div>
      <p>Beräkna självkostnaden per styck för <strong>${s.targetProduct}</strong>.</p>
    `;
  }
  if (currentExercise.value === 'nollpunkt') {
    return `
      <p><strong>Företaget X</strong> säljer en produkt:</p>
      <div class="info-box">
        Pris: ${s.pris} kr/st<br>
        Rörlig kostnad: ${s.rk} kr/st<br>
        Fasta kostnader: ${(s.fk/1000).toLocaleString()} tkr
      </div>
      <p>Räkna ut <strong>nollpunktsvolymen</strong> (kritisk volym).</p>
    `;
  }
  if (currentExercise.value === 'alternativ') {
    return `
      <p><strong>Företaget X</strong> har ledig kapacitet. Välj alternativ:</p>
      <table class="data-table">
        <thead><tr><th></th><th>Alt 1</th><th>Alt 2</th></tr></thead>
        <tbody>
          <tr><td>Pris</td><td>${s.alt1.pris} kr</td><td>${s.alt2.pris} kr</td></tr>
          <tr><td>RK</td><td>${s.alt1.rk} kr</td><td>${s.alt2.rk} kr</td></tr>
        </tbody>
      </table>
      <p>Vilket alternativ ger högst täckningsbidrag?</p>
    `;
  }

  // --- 5. MIX (Varierad fråga) ---
  if (currentExercise.value === 'mix') {
    let question = '';
    if (s.mixQuestionType === 'quantity') {
      question = `Hur många <strong>${s.mixTarget}</strong> ska tillverkas för att maximera vinsten?`;
    } else if (s.mixQuestionType === 'total_tb') {
      question = `Vad blir det <strong>totala täckningsbidraget (TB)</strong> för hela produktionen vid optimal mix?`;
    } else if (s.mixQuestionType === 'hours') {
      question = `Hur många <strong>timmar</strong> kommer läggas på att tillverka <strong>${s.mixTarget}</strong> i den optimala mixen?`;
    }

    return `
      <p><strong>Företaget X</strong> har begränsad kapacitet i sin maskin.</p>
      <p>Tillgänglig tid: <strong>${s.kapacitet} timmar</strong>.</p>
      <table class="data-table large-table">
        <thead>
          <tr>
            <th></th>
            <th>Midi</th>
            <th>Maxi</th>
            <th>Mega</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pris/st</td>
            <td>${s.prodA.pris} kr</td>
            <td>${s.prodB.pris} kr</td>
            <td>${s.prodC.pris} kr</td>
          </tr>
          <tr>
            <td>RK/st</td>
            <td>${s.prodA.rk} kr</td>
            <td>${s.prodB.rk} kr</td>
            <td>${s.prodC.rk} kr</td>
          </tr>
          <tr>
            <td>Tid/st</td>
            <td>${s.prodA.tid} h</td>
            <td>${s.prodB.tid} h</td>
            <td>${s.prodC.tid} h</td>
          </tr>
          <tr>
            <td>Max efterfrågan</td>
            <td>${s.prodA.demand} st</td>
            <td>${s.prodB.demand} st</td>
            <td>${s.prodC.demand} st</td>
          </tr>
        </tbody>
      </table>
      <p>${question}</p>
    `;
  }
});

// --- DYNAMISK PLACEHOLDER ---
const currentPlaceholder = computed(() => {
  if (currentExercise.value === 'nollpunkt') return 'Volym (st)';
  if (currentExercise.value === 'mix') {
    if (s.mixQuestionType === 'quantity') return 'Antal (st)';
    if (s.mixQuestionType === 'hours') return 'Tid (timmar)';
    if (s.mixQuestionType === 'total_tb') return 'Belopp (kr)';
  }
  return 'Kostnad (kr)';
});

// --- RÄTTNINGSLOGIK ---
const calculateMix = () => {
  const prods = [
    { name: 'Midi', ...s.prodA },
    { name: 'Maxi', ...s.prodB },
    { name: 'Mega', ...s.prodC }
  ].map(p => ({
    ...p,
    tb: p.pris - p.rk,
    tbh: (p.pris - p.rk) / p.tid
  }));

  // Sortera efter TB/h (högst först)
  prods.sort((a, b) => b.tbh - a.tbh);

  let capacityLeft = s.kapacitet;
  let production = { Midi: 0, Maxi: 0, Mega: 0 };
  let hoursUsed = { Midi: 0, Maxi: 0, Mega: 0 };
  let totalTB = 0;
  let steps = [];

  for (const p of prods) {
    const maxPossible = Math.floor(capacityLeft / p.tid);
    const produce = Math.min(p.demand, maxPossible);
    
    production[p.name] = produce;
    hoursUsed[p.name] = produce * p.tid;
    totalTB += produce * p.tb;
    
    capacityLeft -= produce * p.tid;

    steps.push({
      name: p.name,
      tbh: Math.round(p.tbh),
      produce: produce,
      demand: p.demand,
      hours: produce * p.tid,
      left: Math.max(0, capacityLeft)
    });
  }

  return { production, hoursUsed, totalTB, steps, prods };
};

const correctValue = computed(() => {
  if (currentExercise.value === 'order') {
    const tvk = s.dlon * (1 + s.tko/100) + s.dmat * (1 + s.mko/100);
    const affo = tvk * ((s.ao + s.fo)/100);
    return Math.round(tvk + affo);
  }
  if (currentExercise.value === 'produkt') {
    const totalDL = (s.midi.dl * s.midi.volym) + (s.maxi.dl * s.maxi.volym);
    const toProcent = s.totalTO / totalDL; 
    const affoPerSt = s.totalAFFO / (s.midi.volym + s.maxi.volym);
    const p = s.targetProduct === 'Midi' ? s.midi : s.maxi;
    const tvk = p.dm + p.dl + (p.dl * toProcent);
    return parseFloat((tvk + affoPerSt).toFixed(2));
  }
  if (currentExercise.value === 'nollpunkt') {
    return Math.round(s.fk / (s.pris - s.rk));
  }
  if (currentExercise.value === 'alternativ') {
    const tb1 = s.alt1.pris - s.alt1.rk;
    const tb2 = s.alt2.pris - s.alt2.rk;
    return tb1 > tb2 ? 'Alt 1' : 'Alt 2';
  }
  
  if (currentExercise.value === 'mix') {
    const res = calculateMix();
    if (s.mixQuestionType === 'quantity') return res.production[s.mixTarget];
    if (s.mixQuestionType === 'total_tb') return res.totalTB;
    if (s.mixQuestionType === 'hours') return res.hoursUsed[s.mixTarget];
  }
  return 0;
});

const currentSolution = computed(() => {
  if (currentExercise.value === 'mix') {
    const res = calculateMix();
    const listItems = res.steps.map(step => 
      `<li><strong>${step.name}</strong> (TB/h: ${step.tbh}): ` +
      `Gör ${step.produce} st. ` +
      `(Tid: ${step.hours.toFixed(1)} h). Kvar: ${step.left.toFixed(1)} h.</li>`
    ).join('');

    let finalAnswerText = '';
    if (s.mixQuestionType === 'quantity') finalAnswerText = `Antal ${s.mixTarget}: <strong>${res.production[s.mixTarget]} st</strong>`;
    if (s.mixQuestionType === 'total_tb') finalAnswerText = `Totalt TB: <strong>${res.totalTB.toLocaleString()} kr</strong>`;
    if (s.mixQuestionType === 'hours') finalAnswerText = `Timmar för ${s.mixTarget}: <strong>${res.hoursUsed[s.mixTarget].toFixed(1)} h</strong>`;

    return `
      <p><strong>Lösningsgång (Rangordna efter TB/timme):</strong></p>
      <ul>${listItems}</ul>
      <p>${finalAnswerText}</p>
    `;
  }

  // Övriga lösningstexter (Oförändrade)
  if (currentExercise.value === 'order') {
    return `<p>Rätt svar: <strong>${correctValue.value.toLocaleString()} kr</strong>. (TVK + AFFO)</p>`;
  }
  if (currentExercise.value === 'produkt') {
    return `<p>Rätt svar: <strong>${correctValue.value} kr</strong>. (DM + DL + TO + AFFO/st)</p>`;
  }
  if (currentExercise.value === 'nollpunkt') {
    return `<p>TB = ${s.pris - s.rk} kr. Nollpunkt = ${s.fk} / TB = <strong>${correctValue.value} st</strong></p>`;
  }
  if (currentExercise.value === 'alternativ') {
    return `<p>Välj alternativet med högst TB. Rätt svar: <strong>${correctValue.value}</strong></p>`;
  }
});

const checkAnswer = () => {
  if (typeof correctValue.value === 'string') {
    if (userAnswer.value === correctValue.value) {
      isCorrect.value = true;
      status.showSolution = true;
      status.hasError = false;
    } else {
      status.hasError = true;
      status.isShaking = true;
      setTimeout(() => status.isShaking = false, 500);
    }
    return;
  }

  const val = parseFloat(Number(userAnswer.value).toFixed(2));
  // Lite mer marginal för mix-timmar som kan ha decimaler
  if (Math.abs(val - correctValue.value) < 0.9) { 
    isCorrect.value = true;
    status.showSolution = true;
    status.hasError = false;
  } else {
    status.hasError = true;
    status.isShaking = true;
    setTimeout(() => status.isShaking = false, 500);
  }
};

const handleSkipAction = () => {
  if (!status.showSolution) {
    status.showSolution = true;
    isCorrect.value = false;
  } else {
    generateValues();
  }
};
</script>

<style scoped>
/* Behåller exakt samma styling som du gillade */
.view-container { 
  padding: 0.5rem 2rem; 
  max-width: 800px; 
  margin: 0 auto; 
  font-family: Arial, sans-serif; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title { font-size: 1.8rem; margin-bottom: 1.5rem; color: #333; }


.exercise-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin-top: 2.5rem;
}

.menu-card {
  background: linear-gradient(135deg, #f8e8ff 0%, #e0f7fa 100%);
  border-radius: 18px;
  box-shadow: 0 4px 18px 0 rgba(80, 80, 120, 0.08), 0 1.5px 4px 0 rgba(120, 120, 160, 0.07);
  padding: 2.2rem 2.5rem 1.7rem 2.5rem;
  cursor: pointer;
  flex: 1 1 260px;
  min-width: 240px;
  max-width: 320px;
  transition: transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid #f3eaff;
  text-align: center;
}

.menu-card:hover {
  background: linear-gradient(135deg, #f3eaff 0%, #e0f7fa 100%);
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 28px 0 rgba(80, 80, 120, 0.13), 0 2.5px 8px 0 rgba(120, 120, 160, 0.10);
  border-color: #d1c4e9;
}

.full-width { grid-column: span 2; }

.card-title { font-size: 1.1rem; margin: 0 0 0.5rem 0; color: #333; }
.card-desc { font-size: 0.85rem; color: #666; margin: 0; }

.exercise-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.question-content { 
  font-size: 1rem; 
  line-height: 1.5; 
  margin-bottom: 1.5rem; 
  text-align: left;
}

.data-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 1.5rem 0; font-size: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.data-table th, .data-table td { padding: 16px 24px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.data-table th { background: #fafafa; font-weight: bold; color: #555; border-bottom: 2px solid #e0e0e0; }
.large-table { font-size: 0.95rem; }

.info-box {
  background: #f9f9f9;
  padding: 15px;
  border-left: 4px solid #FFCCFD;
  margin: 15px 0;
  font-family: monospace;
  font-size: 0.95rem;
  border-radius: 4px;
}

.styled-list { padding-left: 1.2rem; margin: 0.5rem 0; }
.styled-list li { margin-bottom: 0.5rem; }

.input-area { margin-bottom: 1.5rem; }

.standard-input {
  display: flex;
  justify-content: center;
  gap: 10px;
}

input { 
  padding: 0.7rem; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  width: 150px; 
  text-align: center;
  font-size: 1rem;
}

.input-error { border-color: #f56565; background-color: #fff5f5; }

.main-check-btn {
  background-color: #FFCCFD; 
  color: #333; 
  border: none; 
  padding: 0.7rem 1.5rem; 
  border-radius: 4px; 
  font-weight: 600; 
  cursor: pointer;
}

.mix-inputs { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.button-group { display: flex; gap: 10px; justify-content: center; }

.button-group button {
  background: white;
  border: 1px solid #ccc;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.selected-btn { background-color: #FFCCFD !important; border-color: #333 !important; font-weight: bold; }

.shake-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; border-color: #f56565; }
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }

.solution-area { 
  padding: 1.5rem; 
  border-radius: 6px; 
  margin-top: 1rem; 
  text-align: left;
  font-size: 0.95rem;
  background: #f9f9f9;
  border: 1px solid #eee;
}
.correct-bg { background: #f0fff4; border: 1px solid #48bb78; }
.wrong-bg { background: #fff5f5; border: 1px solid #f56565; }

.status-msg { font-weight: bold; margin-bottom: 0.8rem; font-size: 1rem; }

.btn-skip-main { width: 100%; margin-top: 1rem; padding: 0.8rem; background-color: #FFCCFD; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
.btn-back { width: 100%; margin-top: 0.5rem; padding: 0.8rem; background-color: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; }

@media (max-width: 600px) { .exercise-grid { grid-template-columns: 1fr; } .menu-card.full-width { grid-column: span 1; } }
</style>