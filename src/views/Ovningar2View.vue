<template>
  <div class="view-container">
    <h1 class="main-title">Diskontering</h1>

    <div v-if="!currentExercise" class="exercise-grid">
      <div class="menu-card" @click="selectExercise('slutvärde')">
        <h2 class="card-title">Beräkning av slutvärde</h2>
      </div>
      <div class="menu-card" @click="selectExercise('nuvärde')">
        <h2 class="card-title">Beräkning av nuvärde</h2>
      </div>
      <div class="menu-card" @click="selectExercise('summanuvärde')">
        <h2 class="card-title">Beräkning av summa nuvärde</h2>
      </div>
      <div class="menu-card" @click="selectExercise('annuitet')">
        <h2 class="card-title">Beräkning av annuitet</h2>
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
          placeholder="Svar (heltal)" 
          step="1"
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
const scenario = reactive({ belopp: 0, ar: 0, ranta: 0 });

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

  scenario.ar = Math.floor(Math.random() * 5) + 3;
  scenario.ranta = Math.floor(Math.random() * 6) + 3;

  if (currentExercise.value === 'slutvärde') {
    scenario.belopp = 100 * (Math.floor(Math.random() * 10) + 1);
  } else if (currentExercise.value === 'nuvärde') {
    scenario.belopp = 100 * (Math.floor(Math.random() * 20) + 5);
  } else if (currentExercise.value === 'summanuvärde') {
    scenario.belopp = 500 * (Math.floor(Math.random() * 5) + 2);
  } else {
    scenario.belopp = 1000 * (Math.floor(Math.random() * 50) + 10);
  }
};

const currentTitle = computed(() => {
  const titles = {
    slutvärde: 'Beräkning av slutvärde',
    nuvärde: 'Beräkning av nuvärde',
    summanuvärde: 'Beräkning av summa nuvärde',
    annuitet: 'Beräkning av annuitet'
  };
  return titles[currentExercise.value];
});

const currentQuestionText = computed(() => {
  if (currentExercise.value === 'slutvärde') return `Belopp idag: <strong>${scenario.belopp} kr</strong>. Ränta: <strong>${scenario.ranta}%</strong>. Tid: <strong>${scenario.ar} år</strong>. Vad är slutvärdet?`;
  if (currentExercise.value === 'nuvärde') return `Framtida belopp: <strong>${scenario.belopp} kr</strong> om <strong>${scenario.ar} år</strong>. Ränta: <strong>${scenario.ranta}%</strong>. Vad är nuvärdet?`;
  if (currentExercise.value === 'summanuvärde') return `Årligt belopp: <strong>${scenario.belopp} kr</strong> i <strong>${scenario.ar} år</strong>. Ränta: <strong>${scenario.ranta}%</strong>. Vad är nuvärdet av summan?`;
  return `Lån: <strong>${scenario.belopp} kr</strong>. Tid: <strong>${scenario.ar} år</strong>. Ränta: <strong>${scenario.ranta}%</strong>. Vad blir den årliga annuiteten?`;
});

const correctValue = computed(() => {
  const r = scenario.ranta / 100;
  const n = scenario.ar;
  if (currentExercise.value === 'slutvärde') return Math.round(scenario.belopp * Math.pow(1 + r, n));
  if (currentExercise.value === 'nuvärde') return Math.round(scenario.belopp / Math.pow(1 + r, n));
  if (currentExercise.value === 'summanuvärde') return Math.round(scenario.belopp * ((1 - Math.pow(1 + r, -n)) / r));
  return Math.round(scenario.belopp * (r / (1 - Math.pow(1 + r, -n))));
});

const currentSolution = computed(() => {
  const r = scenario.ranta / 100;
  const n = scenario.ar;
  
  if (currentExercise.value === 'slutvärde') {
    return `
      <div class="calculation-steps">
        <div class="formula">FV = PV × (1 + r)<sup>${n}</sup></div>
        <div class="substitution">FV = ${scenario.belopp} × (1 + ${r})<sup>${n}</sup></div>
        <div class="result">FV = <strong>${correctValue.value} kr</strong></div>
      </div>
    `;
  }
  
  if (currentExercise.value === 'nuvärde') {
    return `
      <div class="calculation-steps">
        <div class="formula">PV = FV / (1 + r)<sup>${n}</sup></div>
        <div class="substitution">PV = ${scenario.belopp} / (1 + ${r})<sup>${n}</sup></div>
        <div class="result">PV = <strong>${correctValue.value} kr</strong></div>
      </div>
    `;
  }
  
  if (currentExercise.value === 'summanuvärde') {
    return `
      <div class="calculation-steps">
        <div class="formula">PV = A × [(1 - (1 + r)<sup>-${n}</sup>) / r]</div>
        <div class="substitution">PV = ${scenario.belopp} × [(1 - (1 + ${r})<sup>-${n}</sup>) / ${r}]</div>
        <div class="result">PV = <strong>${correctValue.value} kr</strong></div>
      </div>
    `;
  }
  
  // annuitet
  return `
    <div class="calculation-steps">
      <div class="formula">A = PV × [r / (1 - (1 + r)<sup>-${n}</sup>)]</div>
      <div class="substitution">A = ${scenario.belopp} × [${r} / (1 - (1 + ${r})<sup>-${n}</sup>)]</div>
      <div class="result">A = <strong>${correctValue.value} kr</strong></div>
    </div>
  `;
});

const checkAnswer = () => {
  const userAnswerInt = Math.round(Number(userAnswer.value));
  if (userAnswerInt === correctValue.value) {
    isCorrect.value = true;
    status.showSolution = true;
    status.hasError = false;
  } else {
    // Triggar skak-effekt och röd färg
    status.hasError = true;
    status.isShaking = true;
    // Ta bort skakningen efter 0.5s så den kan köras igen
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

/* Skak-animation */
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
  width: 120px; 
  text-align: center;
  transition: border-color 0.3s, background-color 0.3s;
}

/* Röd färg vid fel */
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
</style>