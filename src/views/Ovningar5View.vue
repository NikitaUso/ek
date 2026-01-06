<template>
  <div class="view-container">
    <h1 class="main-title">Pålägg</h1>

    <div v-if="!currentExercise" class="exercise-grid">
      <div class="menu-card" @click="selectExercise('paslag-pris')">
        <h2 class="card-title">Pris med påslag</h2>
      </div>
      <div class="menu-card" @click="selectExercise('paslag-procent')">
        <h2 class="card-title">Påslagsprocent</h2>
      </div>
      <div class="menu-card" @click="selectExercise('sjalvkostnadspris')">
        <h2 class="card-title">Självkostnadspris</h2>
      </div>
      <div class="menu-card" @click="selectExercise('sjalvkostnad2')">
        <h2 class="card-title">Självkostnad typ II</h2>
      </div>
    </div>

    <div v-else class="exercise-card" :class="{ 'shake-error': status.isShaking }">
      <h2 class="exercise-title">{{ currentTitle }}</h2>
      
      <div class="scenario-header">
        <p class="question-text" v-html="currentQuestionText"></p>
      </div>

      <div class="input-area" v-if="!status.showSolution">
        <input 
          type="number" 
          v-model="userAnswer" 
          :placeholder="currentPlaceholder"
          step="0.01"
          :class="{ 'input-error': status.hasError }"
          @keyup.enter="checkAnswer" 
        />
        <button @click="checkAnswer">Rätta</button>
      </div>

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
const scenario = reactive({ 
  sjalvkostnadspris: 0, 
  paslag: 0,
  pris: 0,
  antal: 0,
  dlon: 0,
  dmat: 0,
  tko: 0.2, // 20% av direkt lön
  mko: 0.1, // 10% av direkt material
  ao: 0.02, // 2% av tillverkningskostnad
  fo: 0.05 // 5% av tillverkningskostnad
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

  if (currentExercise.value === 'paslag-pris') {
    scenario.sjalvkostnadspris = Math.floor(Math.random() * 100) + 50;
    scenario.paslag = Math.floor(Math.random() * 40) + 20;
  } else if (currentExercise.value === 'paslag-procent') {
    scenario.sjalvkostnadspris = Math.floor(Math.random() * 100) + 50;
    scenario.paslag = Math.floor(Math.random() * 40) + 20;
    scenario.pris = scenario.sjalvkostnadspris * (1 + scenario.paslag / 100);
  } else if (currentExercise.value === 'sjalvkostnadspris') {
    scenario.paslag = Math.floor(Math.random() * 40) + 20;
    scenario.sjalvkostnadspris = Math.floor(Math.random() * 100) + 50;
    scenario.pris = scenario.sjalvkostnadspris * (1 + scenario.paslag / 100);
  } else if (currentExercise.value === 'sjalvkostnad2') {
    // Slumpa antal, direkt lön och direkt material
    scenario.antal = Math.floor(Math.random() * 200) + 50; // 50-250 st
    scenario.dlon = (Math.floor(Math.random() * 40) + 10) * 100; // 1000-5000 kr
    scenario.dmat = (Math.floor(Math.random() * 80) + 20) * 100; // 2000-10000 kr
  }
};

const currentTitle = computed(() => {
  const titles = {
    'paslag-pris': 'Pris med påslag',
    'paslag-procent': 'Påslagsprocent',
    'sjalvkostnadspris': 'Självkostnadspris',
    'sjalvkostnad2': 'Självkostnad typ II'
  };
  return titles[currentExercise.value];
});

const currentQuestionText = computed(() => {
  if (currentExercise.value === 'paslag-pris') {
    return `Självkostnadspris: <strong>${scenario.sjalvkostnadspris} kr</strong>. Påslag: <strong>${scenario.paslag}%</strong>. Vad blir priset?`;
  }
  if (currentExercise.value === 'paslag-procent') {
    return `Självkostnadspris: <strong>${scenario.sjalvkostnadspris} kr</strong>. Pris: <strong>${scenario.pris.toFixed(2)} kr</strong>. Vad är påslagsprocenten?`;
  }
  if (currentExercise.value === 'sjalvkostnad2') {
    return `Företaget X tillverkar och säljer trädgårdsmöbler.<br><br>
    För ett visst budgetår gäller följande omkostnadspålägg:<br>
    Tillverkningsomkostnader: <strong>20%</strong> av direkt lön<br>
    Materialomkostnader: <strong>10%</strong> av direkt material<br>
    Administrationsomkostnader: <strong>2%</strong> av tillverkningskostnaden<br>
    Försäljningsomkostnader: <strong>5%</strong> av tillverkningskostnaden<br><br>
    Till en aktuell kundorder om <strong>${scenario.antal} solstolar</strong> har följande gått åt:<br>
    Direkt lön: <strong>${scenario.dlon} kr</strong><br>
    Direkt material: <strong>${scenario.dmat} kr</strong><br><br>
    Vad blir självkostnaden för ordern?`;
  }
  return `Pris: <strong>${scenario.pris.toFixed(2)} kr</strong>. Påslag: <strong>${scenario.paslag}%</strong>. Vad är självkostnadspriset?`;
});

const currentPlaceholder = computed(() => {
  if (currentExercise.value === 'paslag-procent') {
    return 'Procent (%)';
  }
  return 'Svar (kr)';
});

const correctValue = computed(() => {
  if (currentExercise.value === 'paslag-pris') {
    return parseFloat((scenario.sjalvkostnadspris * (1 + scenario.paslag / 100)).toFixed(2));
  }
  if (currentExercise.value === 'paslag-procent') {
    return parseFloat((((scenario.pris - scenario.sjalvkostnadspris) / scenario.sjalvkostnadspris) * 100).toFixed(2));
  }
  if (currentExercise.value === 'sjalvkostnad2') {
    // Beräkna självkostnad steg för steg
    const tko = scenario.dlon * scenario.tko;
    const mko = scenario.dmat * scenario.mko;
    const tk = scenario.dlon + scenario.dmat + tko + mko;
    const ao = tk * scenario.ao;
    const fo = tk * scenario.fo;
    const sjk = tk + ao + fo;
    return Math.round(sjk);
  }
  return parseFloat((scenario.pris / (1 + scenario.paslag / 100)).toFixed(2));
});

const currentSolution = computed(() => {
  if (currentExercise.value === 'paslag-pris') {
    return `
      <div class="calculation-steps">
        <div class="formula">Pris = Självkostnadspris × (1 + Påslag%/100)</div>
        <div class="substitution">Pris = ${scenario.sjalvkostnadspris} × (1 + ${scenario.paslag}/100)</div>
        <div class="substitution">Pris = ${scenario.sjalvkostnadspris} × ${(1 + scenario.paslag / 100).toFixed(2)}</div>
        <div class="result">Pris = <strong>${correctValue.value} kr</strong></div>
      </div>
    `;
  }
  if (currentExercise.value === 'paslag-procent') {
    return `
      <div class="calculation-steps">
        <div class="formula">Påslag% = ((Pris - Självkostnadspris) / Självkostnadspris) × 100</div>
        <div class="substitution">Påslag% = ((${scenario.pris.toFixed(2)} - ${scenario.sjalvkostnadspris}) / ${scenario.sjalvkostnadspris}) × 100</div>
        <div class="substitution">Påslag% = (${(scenario.pris - scenario.sjalvkostnadspris).toFixed(2)} / ${scenario.sjalvkostnadspris}) × 100</div>
        <div class="result">Påslag% = <strong>${correctValue.value}%</strong></div>
      </div>
    `;
  }
  if (currentExercise.value === 'sjalvkostnad2') {
    const tko = scenario.dlon * scenario.tko;
    const mko = scenario.dmat * scenario.mko;
    const tk = scenario.dlon + scenario.dmat + tko + mko;
    const ao = tk * scenario.ao;
    const fo = tk * scenario.fo;
    const sjk = tk + ao + fo;
    return `
      <div class="calculation-steps">
        <div class="formula">Tillverkningsomkostnad = Direkt lön × 20% = ${scenario.dlon} × 0.20 = ${tko} kr</div>
        <div class="formula">Materialomkostnad = Direkt material × 10% = ${scenario.dmat} × 0.10 = ${mko} kr</div>
        <div class="formula">Tillverkningskostnad = Direkt lön + Direkt material + TKO + MKO = ${scenario.dlon} + ${scenario.dmat} + ${tko} + ${mko} = ${tk} kr</div>
        <div class="formula">Administrationsomkostnad = Tillverkningskostnad × 2% = ${tk} × 0.02 = ${ao} kr</div>
        <div class="formula">Försäljningsomkostnad = Tillverkningskostnad × 5% = ${tk} × 0.05 = ${fo} kr</div>
        <div class="result">Självkostnad = ${tk} + ${ao} + ${fo} = <strong>${Math.round(sjk)} kr</strong></div>
      </div>
    `;
  }
  return `
    <div class="calculation-steps">
      <div class="formula">Självkostnadspris = Pris / (1 + Påslag%/100)</div>
      <div class="substitution">Självkostnadspris = ${scenario.pris.toFixed(2)} / (1 + ${scenario.paslag}/100)</div>
      <div class="substitution">Självkostnadspris = ${scenario.pris.toFixed(2)} / ${(1 + scenario.paslag / 100).toFixed(2)}</div>
      <div class="result">Självkostnadspris = <strong>${correctValue.value} kr</strong></div>
    </div>
  `;
});

const checkAnswer = () => {
  const userAnswerNum = parseFloat(Number(userAnswer.value).toFixed(2));
  if (Math.abs(userAnswerNum - correctValue.value) < 0.01) {
    isCorrect.value = true;
    status.showSolution = true;
    status.hasError = false;
  } else {
    status.hasError = true;
    status.isShaking = true;
    setTimeout(() => {
      status.isShaking = false;
    }, 500);
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
.view-container { 
  padding: 0.5rem 2rem; 
  max-width: 800px; 
  margin: 0 auto; 
  font-family: Arial, sans-serif; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title { font-size: 1.8rem; margin-bottom: 1.5rem; }

.exercise-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}

.menu-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 2rem 1rem;
  cursor: pointer;
  text-align: center;
}

.menu-card:hover { border-color: #FFCCFD; }
.card-title { font-size: 1rem; margin: 0; }

.exercise-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  text-align: center;
  transition: border-color 0.3s;
}

.shake-error {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  border-color: #f56565;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.question-text { font-size: 1rem; margin-bottom: 1.5rem; }

.input-area { display: flex; gap: 0.5rem; justify-content: center; }

input { 
  padding: 0.5rem; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  width: 140px; 
  text-align: center;
  transition: border-color 0.3s, background-color 0.3s;
}

.input-error {
  border-color: #f56565;
  background-color: #fff5f5;
}

button { 
  background-color: #FFCCFD; 
  color: #333; 
  border: none; 
  padding: 0.6rem 1.2rem; 
  border-radius: 4px; 
  font-weight: 600; 
  cursor: pointer;
}

.btn-skip-main { width: 100%; margin-top: 1rem; }
.btn-back { background-color: #f0f0f0; width: 100%; margin-top: 0.5rem; }

.solution-area { padding: 1rem; border-radius: 4px; margin-top: 1rem; }
.correct-bg { background: #f0fff4; border: 1px solid #48bb78; }
.wrong-bg { background: #fff5f5; border: 1px solid #f56565; }

.status-msg { font-weight: bold; margin-bottom: 0.8rem; }
.logic-text { font-size: 0.95rem; }

.calculation-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
  padding: 0.5rem;
}

.calculation-steps .formula {
  font-style: italic;
  color: #555;
  font-size: 0.9rem;
}

.calculation-steps .substitution {
  font-family: monospace;
  color: #333;
}

.calculation-steps .result {
  font-size: 1.1rem;
  margin-top: 0.3rem;
  padding-top: 0.5rem;
  border-top: 1px solid #ddd;
}

.action-footer { 
  margin-top: 1.5rem; 
  width: 100%;
}
</style>
