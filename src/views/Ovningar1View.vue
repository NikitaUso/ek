<template>
  <div class="view-container">
    <h1 class="main-title">Resultatplanering & Nollpunkt</h1>

    <div class="exercise-card">
      <div class="scenario-header">
        <p class="context">Företaget AB köper och säljer en produkt med följande värden:</p>
        <div class="values-grid">
          <div class="value-row"><span>Pris / styck:</span> <strong>{{ scenario.pris }} kr</strong></div>
          <div class="value-row"><span>Rörlig kostnad / styck:</span> <strong>{{ scenario.rk }} kr</strong></div>
          <div class="value-row"><span>Totala fasta kostnader:</span> <strong>{{ scenario.fk.toLocaleString() }} kr</strong></div>
          <div class="value-row"><span>Budgeterad försäljning:</span> <strong>{{ scenario.budget.toLocaleString() }} st</strong></div>
        </div>
      </div>

      <div class="questions-wrapper">
        <div class="question-segment" :class="{ 'shake-error': status.q1.isShaking }">
          <p class="question-text">Vad är Nollpunktsvolymen (q)? Eller, med vilken volym är resultat = 0?</p>
          
          <div v-if="!status.q1.showSolution" class="input-row">
            <input 
              type="number" 
              v-model="userAnswers.q1" 
              placeholder="Svar (st)" 
              :class="{ 'input-error': status.q1.hasError }"
              @keyup.enter="checkQ1" 
            />
            <button @click="checkQ1">Rätta</button>
          </div>

          <div v-else class="solution-box" :class="{ 'correct-bg': status.q1.isCorrect, 'wrong-bg': !status.q1.isCorrect }">
            <p class="status-msg">{{ status.q1.isCorrect ? 'Rätt svar' : 'Rätt svar och lösning:' }}</p>
            <p class="logic-text">{{ scenario.fk }} / ({{ scenario.pris }} - {{ scenario.rk }}) = <strong>{{ correctAnswers.q1 }} st</strong></p>
          </div>
        </div>

        <div class="question-segment" :class="{ 'shake-error': status.q2.isShaking }">
          <p class="question-text">Vad är säkerhetsmarginalen i antal styck och i procent?</p>
          
          <div v-if="!status.q2.showSolution" class="input-row multi">
            <input 
              type="number" 
              v-model="userAnswers.q2a" 
              placeholder="Antal st" 
              :class="{ 'input-error': status.q2.hasError }"
            />
            <input 
              type="number" 
              v-model="userAnswers.q2b" 
              placeholder="Procent (%)" 
              :class="{ 'input-error': status.q2.hasError }"
            />
            <button @click="checkQ2">Rätta</button>
          </div>

          <div v-else class="solution-box" :class="{ 'correct-bg': status.q2.isCorrect, 'wrong-bg': !status.q2.isCorrect }">
            <p class="status-msg">{{ status.q2.isCorrect ? 'Rätt svar' : 'Rätt svar och lösning:' }}</p>
            <p class="logic-text">Antal: {{ scenario.budget }} - {{ correctAnswers.q1 }} = <strong>{{ correctAnswers.q2a }} st</strong></p>
            <p class="logic-text">Procent: {{ correctAnswers.q2a }} / {{ scenario.budget }} = <strong>{{ correctAnswers.q2b }}%</strong></p>
          </div>
        </div>

        <div class="question-segment" :class="{ 'shake-error': status.q3.isShaking }">
          <p class="question-text">Vilken volym måste säljas för att få en vinst på {{ scenario.vinstMal.toLocaleString() }} kr?</p>
          
          <div v-if="!status.q3.showSolution" class="input-row">
            <input 
              type="number" 
              v-model="userAnswers.q3" 
              placeholder="Volym (st)" 
              :class="{ 'input-error': status.q3.hasError }"
              @keyup.enter="checkQ3"
            />
            <button @click="checkQ3">Rätta</button>
          </div>

          <div v-else class="solution-box" :class="{ 'correct-bg': status.q3.isCorrect, 'wrong-bg': !status.q3.isCorrect }">
            <p class="status-msg">{{ status.q3.isCorrect ? 'Rätt svar' : 'Rätt svar och lösning:' }}</p>
            <p class="logic-text">({{ scenario.fk }} + {{ scenario.vinstMal }}) / ({{ scenario.pris }} - {{ scenario.rk }}) = <strong>{{ correctAnswers.q3 }} st</strong></p>
          </div>
        </div>

        <div class="action-footer">
          <button @click="handleSkipAction" class="btn-skip-main">Skippa</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';

const scenario = reactive({ pris: 0, rk: 0, fk: 0, budget: 0, vinstMal: 100000 });
const userAnswers = reactive({ q1: null, q2a: null, q2b: null, q3: null });
const correctAnswers = reactive({ q1: 0, q2a: 0, q2b: 0, q3: 0 });
const status = reactive({
  q1: { showSolution: false, isCorrect: false, hasError: false, isShaking: false },
  q2: { showSolution: false, isCorrect: false, hasError: false, isShaking: false },
  q3: { showSolution: false, isCorrect: false, hasError: false, isShaking: false }
});

const generateNewExercise = () => {
  Object.keys(status).forEach(k => { 
    status[k].showSolution = false; 
    status[k].isCorrect = false; 
    status[k].hasError = false;
    status[k].isShaking = false;
  });
  Object.keys(userAnswers).forEach(k => userAnswers[k] = null);

  scenario.pris = Math.floor(Math.random() * 150) + 200; 
  scenario.rk = Math.floor(Math.random() * 50) + 80;
  scenario.fk = (Math.floor(Math.random() * 10) + 12) * 10000;
  scenario.budget = Math.floor(Math.random() * 1000) + 2500;

  const tb = scenario.pris - scenario.rk;
  correctAnswers.q1 = Math.round(scenario.fk / tb);
  correctAnswers.q2a = scenario.budget - correctAnswers.q1;
  correctAnswers.q2b = Math.round((correctAnswers.q2a / scenario.budget) * 100);
  correctAnswers.q3 = Math.round((scenario.fk + scenario.vinstMal) / tb);
};

const triggerError = (q) => {
  status[q].hasError = true;
  status[q].isShaking = true;
  setTimeout(() => { status[q].isShaking = false; }, 500);
};

const checkQ1 = () => {
  if (parseInt(userAnswers.q1) === correctAnswers.q1) {
    status.q1.isCorrect = true;
    status.q1.showSolution = true;
  } else {
    triggerError('q1');
  }
};

const checkQ2 = () => {
  if (parseInt(userAnswers.q2a) === correctAnswers.q2a && parseInt(userAnswers.q2b) === correctAnswers.q2b) {
    status.q2.isCorrect = true;
    status.q2.showSolution = true;
  } else {
    triggerError('q2');
  }
};

const checkQ3 = () => {
  if (parseInt(userAnswers.q3) === correctAnswers.q3) {
    status.q3.isCorrect = true;
    status.q3.showSolution = true;
  } else {
    triggerError('q3');
  }
};

const handleSkipAction = () => {
  if (!status.q1.showSolution || !status.q2.showSolution || !status.q3.showSolution) {
    status.q1.showSolution = true;
    status.q2.showSolution = true;
    status.q3.showSolution = true;
  } else {
    generateNewExercise();
  }
};

onMounted(generateNewExercise);
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
  text-align: center;
}

.main-title { 
  font-size: 1.8rem; 
  color: #333; 
  margin-bottom: 1rem; 
  margin-top: 0;
}

.exercise-card { 
  background: white; 
  border-radius: 8px; 
  border: 1px solid #e0e0e0; 
  padding: 1.5rem 2rem; 
  width: 100%;
}

.values-grid { 
  background: #f9f9f9; 
  padding: 1rem; 
  border-radius: 4px; 
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.value-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.question-segment { 
  margin: 1.5rem 0; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Skak-animation */
.shake-error {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.question-text { 
  font-weight: 600; 
  margin-bottom: 1rem; 
  font-size: 1.1rem; 
  color: #333; 
  line-height: 1.4; 
  max-width: 90%;
}

.input-row { 
  display: flex; 
  gap: 0.8rem; 
  justify-content: center;
  align-items: center;
}

input { 
  padding: 0.6rem; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  width: 130px; 
  text-align: center;
  transition: border-color 0.3s, background-color 0.3s;
}

.input-error {
  border-color: #f56565;
  background-color: #fff5f5;
}

button { 
  padding: 0.6rem 1.4rem; 
  border-radius: 4px; 
  cursor: pointer; 
  border: none; 
  font-weight: 600; 
  transition: 0.2s; 
  background-color: #FFCCFD;
  color: #2c3e50;
}

button:hover {
  filter: brightness(0.95);
}

.btn-skip-main { 
  width: 100%; 
  margin-top: 0.5rem; 
  font-size: 1.1rem; 
}

.solution-box { 
  padding: 1rem; 
  border-radius: 4px; 
  margin-top: 0.8rem; 
  width: 100%;
  max-width: 450px;
}

.correct-bg { background: #f0fff4; border: 1px solid #48bb78; }
.wrong-bg { background: #fff5f5; border: 1px solid #f56565; }

.status-msg { font-weight: bold; margin-bottom: 0.3rem; }
.logic-text { font-family: monospace; font-size: 1rem; }

.action-footer { 
  margin-top: 1.5rem; 
  border-top: 1px solid #eee; 
  padding-top: 1rem; 
  width: 100%;
}
</style>