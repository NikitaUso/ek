<template>
  <div class="quiz-wrapper">
    <div class="quiz-container">
      <h1 class="quiz-title">Quiz Block 1</h1>
      <div v-if="showResult" class="result-card">
        <h2>Quiz Slutfört!</h2>
        <div class="score-display">
          <div class="percent-circle">{{ calculatePercent }}%</div>
          <p class="score-text">{{ correctAnswers }} av {{ questions.length }} rätt</p>
        </div>
        <div class="result-actions">
          <button @click="restartFullQuiz" class="action-btn main-btn">Gör om hela quizzet</button>
        </div>
      </div>

      <div v-else-if="currentQuestion" class="question-card">
        <div class="quiz-header">
          <span class="progress-text">Fråga {{ currentIndex + 1 }} / {{ questions.length }}</span>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: progressWidth }"></div>
          </div>
        </div>

        <h3 class="question-title">{{ currentQuestion.question }}</h3>

        <div class="options-container">
          <button 
            v-for="(opt, index) in currentQuestion.options" 
            :key="index"
            class="option-button"
            :class="{ 
              'shake': selectedWrong === index,
              'wrong': selectedWrong === index,
              'correct': (answered && opt.isCorrect)
            }"
            @click="handleAnswer(opt, index)"
            :disabled="answered && !opt.isCorrect && selectedWrong !== index"
          >
            {{ opt.text }}
          </button>
        </div>

        <div class="quiz-footer">
          <button class="nav-btn" :disabled="currentIndex === 0" @click="prevQuestion">Föregående</button>
          <button class="nav-btn" :disabled="!answered" @click="nextQuestion">
            {{ isLastQuestion ? 'Visa Resultat' : 'Nästa' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const rawData = [
  // EKONOMISTYRNINGENS UTGÅNGSPUNKTER
  { question: "Vilket begrepp beskriver vart företaget är på väg och hur man vill att kunderna ska uppfatta företaget?", options: [{ text: "Vision", isCorrect: true }, { text: "Affärsidé", isCorrect: false }, { text: "Strategi", isCorrect: false }, { text: "Verksamhetsplanering", isCorrect: false }] },
  { question: "Vilken funktion i en vision handlar om att skapa motivation och engagemang hos medarbetarna?", options: [{ text: "Legitimerande", isCorrect: false }, { text: "Identifikation & motivation", isCorrect: true }, { text: "Ambition & fokus", isCorrect: false }, { text: "Satisfiering", isCorrect: false }] },
  { question: "Vad beskriver vad företaget ska ägna sig åt, vilka kunder man riktar sig till och vad som skiljer en från konkurrenter?", options: [{ text: "Strategi", isCorrect: false }, { text: "Vision", isCorrect: false }, { text: "Affärsidé", isCorrect: true }, { text: "Målkostnadskalkylering", isCorrect: false }] },
  { question: "Vad kallas planen för hur företaget ska skapa konkurrensfördelar och förverkliga sin affärsidé?", options: [{ text: "Verksamhetsplanering", isCorrect: false }, { text: "Strategi", isCorrect: true }, { text: "Budgetering", isCorrect: false }, { text: "Resultatansvar", isCorrect: false }] },
  
  // MODELLER
  { question: "Vilken modell ser företaget som en 'svart låda' där analysen av resursomvandlingen utelämnas?", options: [{ text: "Intressentmodellen", isCorrect: false }, { text: "Vinstmaximeringsmodellen", isCorrect: true }, { text: "Satifisieringsmodellen", isCorrect: false }, { text: "Williamson-modellen", isCorrect: false }] },
  { question: "I Baumols modell för företagsledare, vad är det primära målet istället för vinstmaximering?", options: [{ text: "Nyttomaximering (prestige)", isCorrect: false }, { text: "Försäljningsmaximering och tillväxt", isCorrect: true }, { text: "Kostnadsminimering", isCorrect: false }, { text: "Kassaflödesmaximering", isCorrect: false }] },
  { question: "Vilket begrepp används i Satifisieringsmodellen för att beskriva att människor inte kan känna till alla alternativ?", options: [{ text: "Fullständig information", isCorrect: false }, { text: "Begränsad rationalitet", isCorrect: true }, { text: "Seriekoppling", isCorrect: false }, { text: "Anspråksnivå", isCorrect: false }] },
  { question: "Vilken modell ser företaget som en samlingsplats för bidrag och belöningar från olika grupper?", options: [{ text: "Intressentmodellen", isCorrect: true }, { text: "Vinstmaximeringsmodellen", isCorrect: false }, { text: "Kassaflödesmodellen", isCorrect: false }, { text: "Organisationsstruktur", isCorrect: false }] },
  { question: "Vad är målet i kassaflödesbaserade modeller?", options: [{ text: "Att maximera nästa månads vinst", isCorrect: false }, { text: "Att maximera aktieägarnas förmögenhet via nuvärde", isCorrect: true }, { text: "Att hålla alla intressenter nöjda", isCorrect: false }, { text: "Att minimera utgifterna", isCorrect: false }] },

  // EFFEKTIVITET & PRODUKTIVITET
  { question: "Hur definieras effektivitet i formelform?", options: [{ text: "Värdet av utflöde / Värdet av inflöde", isCorrect: true }, { text: "Kvantitet utflöde / Kvantitet inflöde", isCorrect: false }, { text: "Resultat / Kapital", isCorrect: false }, { text: "Intäkt - Kostnad", isCorrect: false }] },
  { question: "Vad innebär 'Inre effektivitet'?", options: [{ text: "Att göra rätt saker (kundvärde)", isCorrect: false }, { text: "Att göra saker rätt (ordning och reda/produktivitet)", isCorrect: true }, { text: "Att maximera kassaflödet", isCorrect: false }, { text: "Att sänka anspråksnivån", isCorrect: false }] },
  { question: "Vad är skillnaden mellan produktivitet och effektivitet?", options: [{ text: "Produktivitet mäter värde, effektivitet mäter kvantitet", isCorrect: false }, { text: "Produktivitet mäter fysiska kvantiteter, effektivitet mäter värde/måluppfyllelse", isCorrect: true }, { text: "Det är ingen skillnad", isCorrect: false }, { text: "Produktivitet handlar bara om personal", isCorrect: false }] },

  // BEGREPPSPAREN
  { question: "Vilket begrepp beskriver det faktiska inflödet av likvida medel (pengar på kontot)?", options: [{ text: "Inkomst", isCorrect: false }, { text: "Intäkt", isCorrect: false }, { text: "Inbetalning", isCorrect: true }, { text: "Utbetalning", isCorrect: false }] },
  { question: "Vad kallas värdet av de resurser som förbrukas för att skapa en viss periods intäkter?", options: [{ text: "Utgift", isCorrect: false }, { text: "Kostnad", isCorrect: true }, { text: "Utbetalning", isCorrect: false }, { text: "Amortering", isCorrect: false }] },
  { question: "När uppstår en 'Utgift'?", options: [{ text: "När man betalar fakturan", isCorrect: false }, { text: "När man anskaffar en resurs (fakturadatum)", isCorrect: true }, { text: "När maskinen går sönder", isCorrect: false }, { text: "När man gör en avskrivning", isCorrect: false }] },

  // ORGANISATION & STYRNING
  { question: "Vilket perspektiv ser företaget som en pyramid där order flödar uppifrån och ned?", options: [{ text: "Det horisontella perspektivet", isCorrect: false }, { text: "Det vertikala perspektivet", isCorrect: true }, { text: "Matrisorganisation", isCorrect: false }, { text: "Intressentmodellen", isCorrect: false }] },
  { question: "Vilken typ av ansvar innebär att man ansvarar för resultat i relation till kapital?", options: [{ text: "Kostnadsansvar", isCorrect: false }, { text: "Intäktsansvar", isCorrect: false }, { text: "Lönsamhetsansvar", isCorrect: true }, { text: "Resultatansvar", isCorrect: false }] },
  { question: "Vad ingår i 'Mindre formaliserade styrmedel'?", options: [{ text: "Budgetering och kalkylering", isCorrect: false }, { text: "Företagskultur, lärande och medarbetarskap", isCorrect: true }, { text: "Internprissättning", isCorrect: false }, { text: "Investeringskalkyler", isCorrect: false }] },
  { question: "Vad innebär 'Single-loop learning'?", options: [{ text: "Att man ifrågasätter orsaken till felet", isCorrect: false }, { text: "Att man rättar till ett fel utan att gå till botten med orsaken", isCorrect: true }, { text: "Att man lär sig av andra företag", isCorrect: false }, { text: "Att man byter ut ledningen", isCorrect: false }] }
];

const questions = ref([]);
const currentIndex = ref(0);
const showResult = ref(false);
const correctAnswers = ref(0);
const answered = ref(false);
const selectedWrong = ref(null);

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1);
const progressWidth = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100 + '%');
const calculatePercent = computed(() => Math.round((correctAnswers.value / questions.value.length) * 100));

const shuffle = (array) => {
  let cur = array.length, rand;
  while (cur !== 0) {
    rand = Math.floor(Math.random() * cur);
    cur--;
    [array[cur], array[rand]] = [array[rand], array[cur]];
  }
  return array;
};

const initQuiz = () => {
  const shuffled = shuffle([...rawData]).map(q => ({
    ...q,
    options: shuffle([...q.options])
  }));
  questions.value = shuffled;
  currentIndex.value = 0;
  correctAnswers.value = 0;
  showResult.value = false;
  resetState();
};

const resetState = () => {
  answered.value = false;
  selectedWrong.value = null;
};

const handleAnswer = (opt, index) => {
  if (answered.value) return;
  if (opt.isCorrect) {
    correctAnswers.value++;
    answered.value = true;
  } else {
    selectedWrong.value = index;
    setTimeout(() => { selectedWrong.value = null; }, 400);
  }
};

const nextQuestion = () => {
  if (isLastQuestion.value) showResult.value = true;
  else { currentIndex.value++; resetState(); }
};

const prevQuestion = () => {
  if (currentIndex.value > 0) { currentIndex.value--; resetState(); answered.value = true; }
};

const restartFullQuiz = () => initQuiz();

onMounted(() => initQuiz());
</script>

<style scoped>
.quiz-wrapper { display: flex; justify-content: center; align-items: flex-start; width: 100%; min-height: 60vh; padding: 5px 0 0 0; box-sizing: border-box; }
.quiz-container { width: 100%; max-width: 900px; text-align: center; margin-top: 0; }
.quiz-title { font-size: 2.2rem; font-weight: bold; margin-bottom: 1rem; color: #2c3e50; letter-spacing: 1px; }
.question-card, .result-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); min-height: 340px; display: flex; flex-direction: column; justify-content: center; }
.quiz-header { margin-bottom: 20px; }
.progress-bar-bg { width: 100%; height: 8px; background: #eee; border-radius: 4px; margin-top: 8px; }
.progress-bar-fill { height: 100%; background: #FFCCFD; border-radius: 4px; transition: width 0.3s ease; }
.question-title { font-size: 1.2rem; margin-bottom: 25px; line-height: 1.4; }
.options-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
.option-button { padding: 15px; border: 2px solid #eee; border-radius: 10px; background: white; cursor: pointer; transition: all 0.2s; width: 100%; }
.option-button.correct { background-color: #d4edda !important; border-color: #c3e6cb !important; }
.option-button.wrong { background-color: #f8d7da !important; border-color: #f5c6cb !important; }
.quiz-footer { display: flex; justify-content: space-between; gap: 10px; }
.nav-btn { flex: 1; padding: 12px; border: none; border-radius: 8px; background: #FFCCFD; font-weight: bold; cursor: pointer; }
.nav-btn:disabled { background: #eee; color: #999; }
.percent-circle { font-size: 3rem; font-weight: bold; color: #FFCCFD; margin: 20px 0; }
.action-btn { width: 100%; padding: 15px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; background: #FFCCFD; }
.shake { animation: shake 0.4s; }
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }

@media (max-width: 900px) {
  .quiz-container { max-width: 98vw; }
}
@media (max-width: 600px) {
  .quiz-title { font-size: 1.3rem; margin-bottom: 0.5rem; }
  .quiz-container { max-width: 100vw; padding: 0; margin-top: 0; }
  .quiz-wrapper { padding-top: 0; }
  .question-card, .result-card { padding: 10px; min-height: 220px; }
}
</style>