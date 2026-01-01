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
  // RÖRLIGA KOSTNADER
  { 
    question: "Vilken typ av rörlig kostnad har en konstant styckkostnad oavsett verksamhetsvolym?", 
    options: [
      { text: "Progressivt rörlig kostnad", isCorrect: false },
      { text: "Proportionellt rörlig kostnad", isCorrect: true },
      { text: "Degressivt rörlig kostnad", isCorrect: false },
      { text: "Helt fast kostnad", isCorrect: false }
    ] 
  },
  { 
    question: "Vad kännetecknar en degressivt rörlig kostnad?", 
    options: [
      { text: "Totalsumman ökar i snabbare takt än volymen", isCorrect: false },
      { text: "Styckkostnaden ökar när volymen ökar", isCorrect: false },
      { text: "Totalsumman ökar i långsammare takt än volymen (t.ex. mängdrabatt)", isCorrect: true },
      { text: "Totalsumman är oförändrad", isCorrect: false }
    ] 
  },

  // FASTA KOSTNADER
  { 
    question: "Vad händer med styckkostnaden för en helt fast kostnad när verksamhetsvolymen stiger?", 
    options: [
      { text: "Den stiger", isCorrect: false },
      { text: "Den sjunker", isCorrect: true },
      { text: "Den är oförändrad", isCorrect: false },
      { text: "Den blir proportionell", isCorrect: false }
    ] 
  },
  { 
    question: "Vad innebär 'det relevanta området' för fasta kostnader?", 
    options: [
      { text: "Det geografiska område där företaget säljer varor", isCorrect: false },
      { text: "Tidsperioden kalkylen gäller för", isCorrect: false },
      { text: "Det volymintervall där nuvarande kapacitet (lokaler/maskiner) räcker till", isCorrect: true },
      { text: "Skillnaden mellan intäkter och rörliga kostnader", isCorrect: false }
    ] 
  },
  { 
    question: "Vilken typ av halvfast kostnad minskar direkt när volymen sjunker under en kritisk gräns?", 
    options: [
      { text: "Irreversibel halvfast kostnad", isCorrect: false },
      { text: "Proportionell kostnad", isCorrect: false },
      { text: "Reversibel halvfast kostnad", isCorrect: true },
      { text: "Blandad kostnad", isCorrect: false }
    ] 
  },

  // RESULTATPLANERING & ANTAGANDEN
  { 
    question: "Vilket antagande görs oftast i den förenklade modellen för resultatplanering?", 
    options: [
      { text: "Att lagret förändras kontinuerligt", isCorrect: false },
      { text: "Att priser och rörliga styckkostnader är linjära (konstanta)", isCorrect: true },
      { text: "Att det finns flera olika kostnadsdrivare", isCorrect: false },
      { text: "Att fasta kostnader alltid är irreversibla", isCorrect: false }
    ] 
  },
  { 
    question: "Hur beräknas resultatet matematiskt i en totalanalys?", 
    options: [
      { text: "Totala intäkter + Totala kostnader", isCorrect: false },
      { text: "Pris/st x Volym – Rörlig kostnad/st x Volym – Fasta kostnader", isCorrect: true },
      { text: "Fasta kostnader / Täckningsgrad", isCorrect: false },
      { text: "Täckningsbidrag / Säkerhetsmarginal", isCorrect: false }
    ] 
  },

  // KRITISK PUNKT & SÄKERHETSMARGINAL
  { 
    question: "Vad definierar den kritiska punkten (nollpunkten)?", 
    options: [
      { text: "När vinsten är som störst", isCorrect: false },
      { text: "När de rörliga kostnaderna är noll", isCorrect: false },
      { text: "Där totala intäkter är lika stora som totala kostnader", isCorrect: true },
      { text: "När säkerhetsmarginalen är 100%", isCorrect: false }
    ] 
  },
  { 
    question: "Hur beräknas säkerhetsmarginalen uttryckt i volym (absoluttal)?", 
    options: [
      { text: "Faktisk volym – Kritisk volym", isCorrect: true },
      { text: "Faktisk volym / Kritisk volym", isCorrect: false },
      { text: "Kritisk volym – Faktisk volym", isCorrect: false },
      { text: "Fasta kostnader / Täckningsbidrag", isCorrect: false }
    ] 
  },

  // HÖG/LÅG-METODEN
  { 
    question: "Vilket är det första steget i Hög/låg-metoden för att separera fasta och rörliga kostnader?", 
    options: [
      { text: "Att gissa den fasta kostnaden", isCorrect: false },
      { text: "Att dividera skillnaden i kostnad med skillnaden i volym mellan två punkter", isCorrect: true },
      { text: "Att multiplicera högsta volym med lägsta kostnad", isCorrect: false },
      { text: "Att rita en bidragslinje i ett diagram", isCorrect: false }
    ] 
  },

  // BIDRAGSANALYS & TÄCKNINGSGRAD
  { 
    question: "Vad kallas skillnaden mellan totala intäkter och totala rörliga kostnader?", 
    options: [
      { text: "Säkerhetsmarginal", isCorrect: false },
      { text: "Täckningsbidrag", isCorrect: true },
      { text: "Nettoomsättning", isCorrect: false },
      { text: "Kritisk intäkt", isCorrect: false }
    ] 
  },
  { 
    question: "Vad visar täckningsgraden?", 
    options: [
      { text: "Hur många procent av de fasta kostnaderna som är betalda", isCorrect: false },
      { text: "Hur stor del av försäljningspriset som är rörlig kostnad", isCorrect: false },
      { text: "Det bidrag varje försäljningskrona ger i procent (TB / Pris)", isCorrect: true },
      { text: "Hur stor andel av marknaden företaget täcker", isCorrect: false }
    ] 
  },
  { 
    question: "Hur beräknas kritisk volym i en bidragsanalys?", 
    options: [
      { text: "Fasta kostnader / Täckningsbidrag per styck", isCorrect: true },
      { text: "Fasta kostnader / Täckningsgrad", isCorrect: false },
      { text: "Rörliga kostnader / Pris per styck", isCorrect: false },
      { text: "Totala intäkter – Fasta kostnader", isCorrect: false }
    ] 
  },
  { 
    question: "Vilken formel används för att få fram kritisk total intäkt direkt via täckningsgraden?", 
    options: [
      { text: "Fasta kostnader x Täckningsgrad", isCorrect: false },
      { text: "Fasta kostnader / Täckningsgrad", isCorrect: true },
      { text: "Täckningsbidrag / Fasta kostnader", isCorrect: false },
      { text: "Totala intäkter – Täckningsbidrag", isCorrect: false }
    ] 
  }
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