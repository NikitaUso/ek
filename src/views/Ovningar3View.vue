<template>
  <div class="view-container">
    <h1 class="main-title">Investeringskalkylering</h1>

    <div v-if="!currentExercise" class="exercise-grid">
      <div class="menu-card" @click="selectExercise('payback')">
        <h2 class="card-title">Payback-metoden</h2>
      </div>
      <div class="menu-card" @click="selectExercise('nuvärde')">
        <h2 class="card-title">Nuvärdesmetoden</h2>
      </div>
    </div>

    <div v-else class="exercise-card" :class="{ 'shake-error': status.isShaking }">
      <h2 class="exercise-title">{{ currentTitle }}</h2>
      
      <div class="scenario-header">
        <p class="context-text">Basic Design AB väljer mellan två maskiner med följande värden (tkr):</p>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>Variabel</th>
              <th>Alfa</th>
              <th>Beta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Grundinvestering</td>
              <td>{{ scenario.alfa.gi }}</td>
              <td>{{ scenario.beta.gi }}</td>
            </tr>
            <tr v-for="ar in 4" :key="ar">
              <td>Inbetalningsöverskott år {{ ar }}</td>
              <td>{{ scenario.alfa.io }}</td>
              <td>{{ scenario.beta.io[ar-1] }}</td>
            </tr>
            <tr>
              <td>Restvärde</td>
              <td>{{ scenario.alfa.rv }}</td>
              <td>{{ scenario.beta.rv }}</td>
            </tr>
            <tr>
              <td>Kalkylränta</td>
              <td>{{ scenario.ranta }}%</td>
              <td>{{ scenario.ranta }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="question-segment">
        <p class="question-text">1. Vilket alternativ är mest fördelaktigt?</p>
        <div v-if="!status.showSolution" class="input-row">
          <button 
            @click="userAnswers.best = 'Alfa'" 
            :class="{ 'selected': userAnswers.best === 'Alfa' }"
            class="choice-btn"
          >Alfa</button>
          <button 
            @click="userAnswers.best = 'Beta'" 
            :class="{ 'selected': userAnswers.best === 'Beta' }"
            class="choice-btn"
          >Beta</button>
          <button @click="checkAnswer" class="btn-check">Rätta</button>
        </div>
      </div>

      <div v-if="status.showSolution" class="solution-area" :class="{ 'correct-bg': isCorrect, 'wrong-bg': !isCorrect }">
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
import { ref, reactive, computed, onMounted } from 'vue';

const currentExercise = ref(null);
const userAnswers = reactive({ best: null });
const isCorrect = ref(false);
const status = reactive({ showSolution: false, isShaking: false, hasError: false });

const scenario = reactive({
  ranta: 10,
  alfa: { gi: 100, io: 40, rv: 10, liv: 4 },
  beta: { gi: 100, io: [], rv: 10, liv: 4 }
});

const selectExercise = (type) => {
  currentExercise.value = type;
  generateValues();
};

const generateValues = () => {
  status.showSolution = false;
  status.isShaking = false;
  userAnswers.best = null;
  
  scenario.ranta = 10;
  scenario.alfa.gi = (Math.floor(Math.random() * 5) + 8) * 10;
  scenario.alfa.io = Math.floor(Math.random() * 10) + 30;
  
  scenario.beta.gi = scenario.alfa.gi;
  scenario.beta.io = [
    scenario.alfa.io + 5,
    scenario.alfa.io + 5,
    scenario.alfa.io - 5,
    scenario.alfa.io - 5
  ];
};

const currentTitle = computed(() => currentExercise.value === 'payback' ? 'Payback-metoden' : 'Nuvärdesmetoden');

const results = computed(() => {
  if (currentExercise.value === 'payback') {
    const pAlfa = scenario.alfa.gi / scenario.alfa.io;
    let sum = 0; let pBeta = 0;
    for(let i=0; i<4; i++) {
      sum += scenario.beta.io[i];
      if(sum >= scenario.beta.gi) {
        pBeta = (i + 1) - (sum - scenario.beta.gi) / scenario.beta.io[i];
        break;
      }
    }
    return { winner: pAlfa < pBeta ? 'Alfa' : 'Beta', valAlfa: pAlfa.toFixed(2), valBeta: pBeta.toFixed(2) };
  } else {
    const r = scenario.ranta / 100;
    const fakC = (1 - Math.pow(1+r, -4)) / r;
    const nvAlfa = (scenario.alfa.io * fakC) + (scenario.alfa.rv * Math.pow(1+r, -4)) - scenario.alfa.gi;
    let nvBeta = -scenario.beta.gi;
    for(let i=0; i<4; i++) { nvBeta += scenario.beta.io[i] * Math.pow(1+r, -(i+1)); }
    nvBeta += scenario.beta.rv * Math.pow(1+r, -4);
    return { winner: nvAlfa > nvBeta ? 'Alfa' : 'Beta', valAlfa: Math.round(nvAlfa), valBeta: Math.round(nvBeta) };
  }
});

const currentSolution = computed(() => {
  if (currentExercise.value === 'payback') {
    return `Alfa: ${results.value.valAlfa} år. Beta: ${results.value.valBeta} år. Kortast tid vinner.`;
  }
  return `Alfa NV: ${results.value.valAlfa} tkr. Beta NV: ${results.value.valBeta} tkr. Högst värde vinner.`;
});

const checkAnswer = () => {
  if (userAnswers.best === results.value.winner) {
    isCorrect.value = true;
    status.showSolution = true;
  } else {
    status.isShaking = true;
    setTimeout(() => { status.isShaking = false; }, 500);
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

onMounted(generateValues);
</script>

<style scoped>
.view-container { padding: 0.5rem 2rem; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; }
.main-title { font-size: 1.8rem; margin-bottom: 1.5rem; }
.exercise-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; }
.menu-card { background: white; border: 1px solid #ddd; border-radius: 6px; padding: 2rem 1rem; cursor: pointer; text-align: center; }
.menu-card:hover { border-color: #FFCCFD; }
.exercise-card { background: white; border: 1px solid #ddd; border-radius: 6px; padding: 1.5rem; width: 100%; text-align: center; }
.data-table { width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { border: 1px solid #eee; padding: 6px; }
.input-row { display: flex; gap: 10px; justify-content: center; margin: 1rem 0; }
.choice-btn { background-color: #FFCCFD; border: 1px solid #ccc; padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; font-weight: 600; }
.selected { border: 2px solid #333 !important; }
.btn-check { background-color: #333; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; }
.shake-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; border: 1px solid #f56565 !important; }
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
.solution-area { padding: 1rem; border-radius: 4px; margin-top: 1rem; }
.correct-bg { background: #f0fff4; border: 1px solid #48bb78; }
.wrong-bg { background: #fff5f5; border: 1px solid #f56565; }
.btn-skip-main { background-color: #FFCCFD; width: 100%; margin-top: 1rem; border: none; padding: 0.7rem; font-weight: 600; cursor: pointer; }
.btn-back { background-color: #f0f0f0; width: 100%; margin-top: 0.5rem; border: none; padding: 0.7rem; cursor: pointer; }
</style>