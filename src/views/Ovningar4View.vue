<template>
  <div class="view-container">
    <h1 class="main-title">Budgetering</h1>

    <div v-if="!currentExercise" class="exercise-grid">
      <div class="menu-card" @click="selectExercise('resultat')">
        <h2 class="card-title">Resultatbudget</h2>
      </div>
      <div class="menu-card" @click="selectExercise('likviditet')">
        <h2 class="card-title">Likviditetsbudget</h2>
      </div>
      <div class="menu-card" @click="selectExercise('balans')">
        <h2 class="card-title">Budgeterad balansräkning</h2>
      </div>
    </div>

    <div v-else class="exercise-card" :class="{ 'shake-error': status.isShaking }">
      <h2 class="exercise-title">{{ currentTitle }}</h2>
      
      <div class="scenario-header">
        <p class="context-text">Företaget SOLAR AB planerar nästkommande år enligt följande värden (kr):</p>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>Beskrivning</th>
              <th>Belopp</th>
              <th>Övrig info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Planerad försäljning</td>
              <td>{{ scenario.forsaljning.toLocaleString() }}</td>
              <td>Varukostnad: {{ scenario.varukostnad.toLocaleString() }}</td>
            </tr>
            <tr>
              <td>Kundinbetalningar</td>
              <td>{{ scenario.kundInbet.toLocaleString() }}</td>
              <td>Under året</td>
            </tr>
            <tr>
              <td>Varuinköp (kontant)</td>
              <td>{{ scenario.varuinkop.toLocaleString() }}</td>
              <td>Betalas direkt</td>
            </tr>
            <tr>
              <td>Inköp datorer</td>
              <td>{{ scenario.datorer.toLocaleString() }}</td>
              <td>Livslängd: {{ scenario.datorLiv }} år</td>
            </tr>
            <tr>
              <td>Personalkostnader</td>
              <td>{{ scenario.persKost.toLocaleString() }}</td>
              <td>Utbetalas: {{ scenario.persUtbet.toLocaleString() }}</td>
            </tr>
            <tr>
              <td>Nytt lån (juni)</td>
              <td>{{ scenario.lan.toLocaleString() }}</td>
              <td>Likviditetsförstärkning</td>
            </tr>
            <tr>
              <td>Ränta på lån</td>
              <td>{{ scenario.ranta.toLocaleString() }}</td>
              <td>Betalas vid årets slut</td>
            </tr>
            <tr>
              <td>Amortering</td>
              <td>{{ scenario.amortering.toLocaleString() }}</td>
              <td>Betalas vid årets slut</td>
            </tr>
            <tr>
              <td>Övriga rörelsekostnader</td>
              <td>{{ (scenario.marknad + scenario.ovrigt).toLocaleString() }}</td>
              <td>Marknadsföring & Övrigt</td>
            </tr>
            <tr>
              <td>Likvida medel (vid årets början)</td>
              <td>{{ scenario.ibLikvid.toLocaleString() }}</td>
              <td>Ingående balans (IB)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="input-area" v-if="!status.showSolution">
        <p class="instruction-text">{{ currentInstruction }}</p>
        <input 
          type="number" 
          v-model="userAnswer" 
          placeholder="Svar" 
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
const status = reactive({ showSolution: false, isShaking: false, hasError: false });

const scenario = reactive({
  forsaljning: 0,
  varukostnad: 0,
  kundInbet: 0,
  varuinkop: 0,
  datorer: 0,
  datorLiv: 3,
  persKost: 0,
  persUtbet: 0,
  lan: 0,
  amortering: 0,
  ranta: 0,
  marknad: 0,
  ovrigt: 0,
  ibLikvid: 0
});

const generateNewValues = () => {
  // Slumpmässig generering av värden för SOLAR AB
  const base = Math.floor(Math.random() * 5) + 15; // 15-20 miljoner
  scenario.forsaljning = base * 1000000;
  scenario.varukostnad = Math.floor(scenario.forsaljning * 0.35);
  scenario.kundInbet = scenario.forsaljning - (Math.floor(Math.random() * 3) * 1000000);
  scenario.varuinkop = Math.floor(scenario.varukostnad * 0.75);
  scenario.datorer = (Math.floor(Math.random() * 5) + 10) * 10000; // 100k - 150k
  scenario.datorLiv = 3;
  scenario.persKost = Math.floor(scenario.forsaljning * 0.5);
  scenario.persUtbet = scenario.persKost - 400000;
  scenario.lan = 1000000;
  scenario.amortering = 80000;
  scenario.ranta = 20000;
  scenario.marknad = 600000;
  scenario.ovrigt = 600000;
  scenario.ibLikvid = 2500000;
};

const selectExercise = (type) => {
  currentExercise.value = type;
  status.showSolution = false;
  status.hasError = false;
  userAnswer.value = null;
  generateNewValues();
};

const currentTitle = computed(() => {
  const titles = { resultat: 'Resultatbudget', likviditet: 'Likviditetsbudget', balans: 'Budgeterad balansräkning' };
  return titles[currentExercise.value];
});

const currentInstruction = computed(() => {
  if (currentExercise.value === 'resultat') return "Vilket resultat förväntas företaget göra?";
  if (currentExercise.value === 'likviditet') return "Ange storleken på likvida medel vid periodens slut (UB Likvid):";
  return "Vad blir summan av tillgångarna (Balansomslutningen)?";
});

const calcResultat = () => {
  const avskrivning = scenario.datorer / scenario.datorLiv;
  return scenario.forsaljning - scenario.varukostnad - avskrivning - scenario.persKost - scenario.ranta - scenario.marknad - scenario.ovrigt;
};

const calcLikviditet = () => {
  const inbet = scenario.kundInbet + scenario.lan;
  const utbet = scenario.varuinkop + scenario.datorer + scenario.persUtbet + scenario.amortering + scenario.ranta + scenario.marknad + scenario.ovrigt;
  return scenario.ibLikvid + inbet - utbet;
};

const calcTillgangar = () => {
  const kundfordringar = scenario.forsaljning - scenario.kundInbet;
  const lager = scenario.varuinkop - scenario.varukostnad;
  const datorerNetto = scenario.datorer - (scenario.datorer / scenario.datorLiv);
  const likvidaUB = calcLikviditet();
  return datorerNetto + (lager > 0 ? lager : 0) + kundfordringar + likvidaUB;
};

const correctValue = computed(() => {
  if (currentExercise.value === 'resultat') return calcResultat();
  if (currentExercise.value === 'likviditet') return calcLikviditet();
  return calcTillgangar();
});

const currentSolution = computed(() => {
  if (currentExercise.value === 'resultat') {
    return `<strong>Intäkter:</strong> ${scenario.forsaljning.toLocaleString()} <br>
            <strong>Kostnader:</strong> <br>
            - Varukostnad: ${scenario.varukostnad.toLocaleString()} <br>
            - Avskrivning datorer (${scenario.datorer}/${scenario.datorLiv}): ${(scenario.datorer/scenario.datorLiv).toLocaleString()} <br>
            - Personalkostnad: ${scenario.persKost.toLocaleString()} <br>
            - Ränta: ${scenario.ranta.toLocaleString()} <br>
            - Övrigt (Marknad+Rörelse): 1 200 000 <br>
            <hr>
            <strong>Resultat: ${calcResultat().toLocaleString()} kr</strong>`;
  }
  if (currentExercise.value === 'likviditet') {
    return `<strong>IB Likvida medel:</strong> ${scenario.ibLikvid.toLocaleString()} <br>
            <strong>Inbetalningar (+):</strong> Kund: ${scenario.kundInbet.toLocaleString()}, Lån: ${scenario.lan.toLocaleString()} <br>
            <strong>Utbetalningar (-):</strong> Varuinköp: ${scenario.varuinkop.toLocaleString()}, Datorer: ${scenario.datorer.toLocaleString()}, Personal: ${scenario.persUtbet.toLocaleString()}, Lånebetalning (Amort+Ränta): 100 000, Övrigt: 1 200 000 <br>
            <hr>
            <strong>UB Likvida medel: ${calcLikviditet().toLocaleString()} kr</strong>`;
  }
  return `<strong>Tillgångar vid årets slut:</strong> <br>
          - Datorer (Netto): ${(scenario.datorer - scenario.datorer/scenario.datorLiv).toLocaleString()} <br>
          - Kundfordringar (Sålt - Inbetalt): ${(scenario.forsaljning - scenario.kundInbet).toLocaleString()} <br>
          - Likvida medel (UB): ${calcLikviditet().toLocaleString()} <br>
          <hr>
          <strong>Summa Tillgångar: ${calcTillgangar().toLocaleString()} kr</strong>`;
});

const checkAnswer = () => {
  if (parseInt(userAnswer.value) === correctValue.value) {
    isCorrect.value = true;
    status.showSolution = true;
    status.hasError = false;
  } else {
    status.hasError = true;
    status.isShaking = true;
    setTimeout(() => { status.isShaking = false; }, 500);
  }
};

const handleSkipAction = () => {
  if (!status.showSolution) {
    status.showSolution = true;
    isCorrect.value = false;
  } else {
    status.showSolution = false;
    userAnswer.value = null;
    generateNewValues(); // Slumpar nya siffror vid andra klicket
  }
};
</script>

<style scoped>
.view-container { padding: 0.5rem 2rem; max-width: 850px; margin: 0 auto; font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; }
.main-title { font-size: 1.8rem; margin-bottom: 1rem; color: #333; }
.exercise-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; width: 100%; }
.menu-card { background: white; border: 1px solid #ddd; border-radius: 6px; padding: 1.5rem 0.5rem; cursor: pointer; text-align: center; }
.menu-card:hover { border-color: #FFCCFD; }
.card-title { font-size: 0.95rem; margin: 0; }

.exercise-card { background: white; border: 1px solid #ddd; border-radius: 6px; padding: 1.5rem; width: 100%; text-align: center; }

.data-table { width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.data-table th, .data-table td { border: 1px solid #eee; padding: 8px; }
.data-table th { background-color: #f9f9f9; }

.instruction-text { font-weight: bold; margin: 1rem 0; font-size: 1rem; }
.input-area { display: flex; flex-direction: column; align-items: center; gap: 0.8rem; }
input { padding: 0.6rem; border: 1px solid #ccc; border-radius: 4px; width: 200px; text-align: center; font-size: 1rem; }
.input-error { border-color: #f56565; background-color: #fff5f5; }

button { background-color: #FFCCFD; color: #333; border: none; padding: 0.7rem 1.5rem; border-radius: 4px; font-weight: 600; cursor: pointer; transition: 0.2s; }
button:hover { filter: brightness(0.95); }

.shake-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; border-color: #f56565 !important; }
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }

.solution-area { padding: 1rem; border-radius: 4px; margin-top: 1rem; text-align: left; font-size: 0.9rem; line-height: 1.6; }
.correct-bg { background: #f0fff4; border: 1px solid #48bb78; }
.wrong-bg { background: #fff5f5; border: 1px solid #f56565; }

.btn-skip-main { width: 100%; margin-top: 1rem; }
.btn-back { background-color: #f0f0f0; width: 100%; margin-top: 0.5rem; }

@media (max-width: 600px) { .exercise-grid { grid-template-columns: 1fr; } }
</style>