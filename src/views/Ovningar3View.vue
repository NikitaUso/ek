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
        </div>
      </div>

      <div class="question-segment" v-if="!status.showSolution">
        <p class="question-text">{{ extraQuestion.text }}</p>
        <div class="input-row">
          <input 
            type="number" 
            v-model="userAnswers.extraAnswer" 
            :placeholder="currentExercise === 'payback' ? 'År (2 decimaler)' : 'tkr (heltal)'" 
            :step="currentExercise === 'payback' ? '0.01' : '1'"
            :class="{ 'input-error': status.hasError }"
            @keyup.enter="checkAnswer"
            class="answer-input"
          />
          <button @click="checkAnswer" class="btn-check">Rätta</button>
        </div>
      </div>

      <div v-if="status.showSolution" class="solution-area" :class="{ 'correct-bg': isCorrect, 'wrong-bg': !isCorrect }">
        <p class="status-msg">{{ isCorrect ? 'Rätt svar!' : 'Rätt svar och lösning:' }}</p>
        <div class="logic-text" v-html="currentSolution"></div>
        <div class="extra-answer">
          <p><strong>Fråga 2:</strong> {{ extraQuestion.text }}</p>
          <p><strong>Svar:</strong> {{ extraQuestion.correctAnswer }} {{ currentExercise === 'payback' ? 'år' : 'tkr' }}</p>
        </div>
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
const userAnswers = reactive({ best: null, extraAnswer: null });
const isCorrect = ref(false);
const status = reactive({ showSolution: false, isShaking: false, hasError: false });
const extraQuestion = reactive({ text: '', correctAnswer: 0, machine: '' });

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
  userAnswers.extraAnswer = null;
  
  // Variera räntan mellan 8-12%
  scenario.ranta = Math.floor(Math.random() * 5) + 8;
  
  scenario.alfa.gi = (Math.floor(Math.random() * 5) + 8) * 10;
  scenario.alfa.io = Math.floor(Math.random() * 10) + 30;
  scenario.alfa.rv = Math.floor(Math.random() * 10) + 5;
  
  scenario.beta.gi = scenario.alfa.gi;
  scenario.beta.rv = Math.floor(Math.random() * 10) + 5;
  
  // Variera Beta's inbetalningsöverskott mer för att få olika vinnare
  const variation = Math.random() > 0.5 ? 1 : -1;
  const diff1 = Math.floor(Math.random() * 8) + 3;
  const diff2 = Math.floor(Math.random() * 8) + 3;
  
  scenario.beta.io = [
    scenario.alfa.io + (diff1 * variation),
    scenario.alfa.io + (diff2 * variation),
    scenario.alfa.io - (diff1 * variation),
    scenario.alfa.io - (diff2 * variation)
  ];
  
  // Generera slumpmässig extra fråga
  generateExtraQuestion();
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
    const pAlfa = scenario.alfa.gi / scenario.alfa.io;
    let sum = 0;
    let betaCalc = '';
    for(let i=0; i<4; i++) {
      sum += scenario.beta.io[i];
      betaCalc += `${i > 0 ? ' + ' : ''}${scenario.beta.io[i]}`;
      if(sum >= scenario.beta.gi) {
        const fraction = (sum - scenario.beta.gi) / scenario.beta.io[i];
        betaCalc += ` = ${sum} tkr (når ${scenario.beta.gi} tkr)`;
        break;
      }
    }
    
    return `
      <div class="calculation-steps">
        <div class="machine-calc">
          <h4>Alfa:</h4>
          <div class="formula">Payback = Grundinvestering / Årligt inbetalningsöverskott</div>
          <div class="substitution">Payback = ${scenario.alfa.gi} / ${scenario.alfa.io} = <strong>${results.value.valAlfa} år</strong></div>
        </div>
        <div class="machine-calc">
          <h4>Beta:</h4>
          <div class="formula">Ackumulerade inbetalningar: ${betaCalc}</div>
          <div class="substitution">Payback = <strong>${results.value.valBeta} år</strong></div>
        </div>
        <div class="result">Svar: <strong>${results.value.winner}</strong> (kortast återbetalningstid vinner)</div>
      </div>
    `;
  }
  
  // Nuvärdesmetoden
  const r = scenario.ranta / 100;
  const fakC = (1 - Math.pow(1+r, -4)) / r;
  
  let alfaCalc = `${scenario.alfa.io} × ${fakC.toFixed(4)} + ${scenario.alfa.rv} × ${Math.pow(1+r, -4).toFixed(4)} - ${scenario.alfa.gi}`;
  
  let betaCalc = '-' + scenario.beta.gi;
  for(let i=0; i<4; i++) {
    const factor = Math.pow(1+r, -(i+1));
    betaCalc += ` + ${scenario.beta.io[i]} × ${factor.toFixed(4)}`;
  }
  betaCalc += ` + ${scenario.beta.rv} × ${Math.pow(1+r, -4).toFixed(4)}`;
  
  return `
    <div class="calculation-steps">
      <div class="machine-calc">
        <h4>Alfa:</h4>
        <div class="formula">NV = (IO × annuitetsfaktor) + (RV × diskonteringsfaktor) - GI</div>
        <div class="substitution">${alfaCalc}</div>
        <div class="substitution">NV = <strong>${results.value.valAlfa} tkr</strong></div>
      </div>
      <div class="machine-calc">
        <h4>Beta:</h4>
        <div class="formula">NV = Σ(IO<sub>t</sub> × (1+r)<sup>-t</sup>) + RV × (1+r)<sup>-4</sup> - GI</div>
        <div class="substitution-small">${betaCalc}</div>
        <div class="substitution">NV = <strong>${results.value.valBeta} tkr</strong></div>
      </div>
      <div class="result">Svar: <strong>${results.value.winner}</strong> (högst nuvärde vinner)</div>
    </div>
  `;
});

const generateExtraQuestion = () => {
  const machine = Math.random() > 0.5 ? 'Alfa' : 'Beta';
  extraQuestion.machine = machine;
  
  if (currentExercise.value === 'payback') {
    extraQuestion.text = `2. Vad är återbetalningstiden för maskin ${machine}? (Svara med 2 decimaler, t.ex. 2.35)`;
    if (machine === 'Alfa') {
      extraQuestion.correctAnswer = parseFloat((scenario.alfa.gi / scenario.alfa.io).toFixed(2));
    } else {
      let sum = 0;
      for(let i=0; i<4; i++) {
        sum += scenario.beta.io[i];
        if(sum >= scenario.beta.gi) {
          extraQuestion.correctAnswer = parseFloat(((i + 1) - (sum - scenario.beta.gi) / scenario.beta.io[i]).toFixed(2));
          break;
        }
      }
    }
  } else {
    extraQuestion.text = `2. Vad är nuvärdet för maskin ${machine}? (Svara i tkr, heltal)`;
    const r = scenario.ranta / 100;
    if (machine === 'Alfa') {
      const fakC = (1 - Math.pow(1+r, -4)) / r;
      extraQuestion.correctAnswer = Math.round((scenario.alfa.io * fakC) + (scenario.alfa.rv * Math.pow(1+r, -4)) - scenario.alfa.gi);
    } else {
      let nv = -scenario.beta.gi;
      for(let i=0; i<4; i++) { nv += scenario.beta.io[i] * Math.pow(1+r, -(i+1)); }
      nv += scenario.beta.rv * Math.pow(1+r, -4);
      extraQuestion.correctAnswer = Math.round(nv);
    }
  }
};

const checkAnswer = () => {
  const isQ1Correct = userAnswers.best === results.value.winner;
  let isQ2Correct = false;
  
  if (currentExercise.value === 'payback') {
    isQ2Correct = Math.abs(parseFloat(userAnswers.extraAnswer) - extraQuestion.correctAnswer) < 0.01;
  } else {
    isQ2Correct = parseInt(userAnswers.extraAnswer) === extraQuestion.correctAnswer;
  }
  
  if (isQ1Correct && isQ2Correct) {
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

.calculation-steps { display: flex; flex-direction: column; gap: 1rem; text-align: left; padding: 0.5rem; }
.machine-calc { background: #f9f9f9; padding: 0.8rem; border-radius: 4px; border-left: 3px solid #FFCCFD; }
.machine-calc h4 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #333; }
.calculation-steps .formula { font-style: italic; color: #555; font-size: 0.85rem; margin-bottom: 0.3rem; }
.calculation-steps .substitution { font-family: monospace; color: #333; font-size: 0.85rem; margin: 0.2rem 0; }
.calculation-steps .substitution-small { font-family: monospace; color: #333; font-size: 0.75rem; margin: 0.2rem 0; word-break: break-word; }
.calculation-steps .result { font-size: 1.1rem; margin-top: 0.5rem; padding-top: 0.8rem; border-top: 2px solid #ddd; font-weight: 600; text-align: center; }
.answer-input { padding: 0.6rem; border: 1px solid #ccc; border-radius: 4px; width: 150px; text-align: center; transition: border-color 0.3s, background-color 0.3s; }
.input-error { border-color: #f56565; background-color: #fff5f5; }
.extra-answer { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ddd; text-align: left; }
.extra-answer p { margin: 0.3rem 0; }
.question-segment { margin: 1rem 0; }
.question-text { font-weight: 600; margin-bottom: 0.8rem; font-size: 1rem; }
</style>