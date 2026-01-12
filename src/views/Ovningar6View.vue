<template>
  <div class="view-container">
    <h1 class="main-title">Avvikelseanalys</h1>

    <!-- MENYVY -->
    <div v-if="!currentExercise" class="exercise-grid">
      <div class="menu-card" @click="selectExercise('forbrukning')">
        <h2 class="card-title">Förbrukningsavvikelse</h2>

      </div>
      <div class="menu-card" @click="selectExercise('omkostnad')">
        <h2 class="card-title">Analys av Omkostnader</h2>
        
      </div>
      <div class="menu-card" @click="selectExercise('resultat')">
        <h2 class="card-title">Resultatavvikelse</h2>
        
      </div>
    </div>

    <!-- ÖVNINGSVY -->
    <div v-else class="exercise-card" :class="{ 'shake-error': status.isShaking }">
      <h2 class="exercise-title">{{ currentTitle }}</h2>
      
      <!-- SCENARIO -->
      <div class="scenario-header">
        <div class="question-content" v-html="currentQuestionText"></div>
      </div>

      <!-- INMATNING -->
      <div class="input-area" v-if="!status.showSolution">
        <p class="instruction">{{ questionLabel }}</p>
        <div class="input-wrapper">
          <input 
            type="number" 
            v-model="userAnswer" 
            placeholder="Svar..." 
            @keyup.enter="checkAnswer"
          />
          <button class="action-btn" @click="checkAnswer">Rätta</button>
        </div>
      </div>

      <!-- LÖSNING / FACIT -->
      <div v-else class="solution-area" :class="{ 'correct-bg': status.isCorrect, 'wrong-bg': !status.isCorrect }">
        <h3 class="status-msg">{{ status.isCorrect ? 'Rätt svar!' : 'Här är lösningen:' }}</h3>
        
        <div class="logic-text" v-html="solutionText"></div>
        
        <div class="footer-actions">
          <button class="action-btn" @click="nextExercise">Nästa övning</button>
          <button class="secondary-btn" @click="currentExercise = null">Tillbaka till menyn</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ovningar6View',
  data() {
    return {
      currentExercise: null, // 'forbrukning', 'omkostnad', 'resultat'
      userAnswer: '',
      correctValue: 0,
      
      // Håller data för nuvarande scenario
      s: {}, 
      
      status: {
        isShaking: false,
        showSolution: false,
        isCorrect: false
      }
    };
  },
  computed: {
    currentTitle() {
      switch (this.currentExercise) {
        case 'forbrukning': return 'Förbrukningsavvikelse (Direkta kostnader)';
        case 'omkostnad': return 'Analys av Omkostnader';
        case 'resultat': return 'Resultatavvikelse';
        default: return '';
      }
    },
    questionLabel() {
      // Bestämmer vad användaren ska räkna ut baserat på slumpad fråga
      if (!this.s.qType) return 'Svar:';
      return this.s.qLabel;
    },
    currentQuestionText() {
      if (!this.currentExercise) return '';
      const fmt = (num) => num ? num.toLocaleString('sv-SE') : 0;

      // 1. FÖRBRUKNINGSAVVIKELSE SCENARIO
      if (this.currentExercise === 'forbrukning') {
        return `
          <p><strong>Företaget X</strong> producerar en produkt. Standard och utfall:</p>
          <table class="data-table">
            <tr><th>Post</th><th>Standard (Budget)</th><th>Utfall (Verkligt)</th></tr>
            <tr><td>Pris per enhet (kg/tim)</td><td>${fmt(this.s.SP)} kr (SP)</td><td>${fmt(this.s.VP)} kr (VP)</td></tr>
            <tr><td>Kvantitet per produkt</td><td>${fmt(this.s.SK_st)} st (SK/st)</td><td>-</td></tr>
            <tr><td>Producerad volym</td><td>-</td><td>${fmt(this.s.Vv)} st</td></tr>
            <tr><td>Total förbrukad kvantitet</td><td>-</td><td>${fmt(this.s.VK_tot)} st (VK)</td></tr>
          </table>
          <p><em>(Total standardkvantitet (SK) för volymen är ${fmt(this.s.SK_tot)} st)</em></p>
        `;
      }

      // 2. OMKSTNADSANALYS SCENARIO
      if (this.currentExercise === 'omkostnad') {
        return `
          <p><strong>Företaget Y</strong> analyserar sina omkostnader.</p>
          <div class="info-grid">
            <div>
              <strong>Budget/Standard:</strong><br>
              Normal volym: ${fmt(this.s.normVolym)} timmar<br>
              Budgeterad volym: ${fmt(this.s.budgVolym)} timmar<br>
              Budgeterade Fasta kostnader: ${fmt(this.s.budgFK)} kr<br>
              Budgeterade Rörliga kostnader: ${fmt(this.s.budgRK)} kr
            </div>
            <div>
              <strong>Utfall:</strong><br>
              Verklig volym (Produktion): ${fmt(this.s.aktProd)} st<br>
              Verklig tid (VK): ${fmt(this.s.VK_tim)} timmar<br>
              Verkliga omkostnader (Utfall): ${fmt(this.s.utfall)} kr
            </div>
          </div>
          <p>Standardtid per styck: ${this.s.stdTid} timmar.<br>
          (Standardkvantitet timmar = ${fmt(this.s.SK_tim)} h)</p>
        `;
      }

      // 3. RESULTATAVVIKELSE SCENARIO
      if (this.currentExercise === 'resultat') {
        return `
          <p><strong>Företaget Z</strong> följer upp sin försäljning.</p>
          <table class="data-table">
            <tr><th></th><th>Budget</th><th>Utfall</th></tr>
            <tr><td>Volym</td><td>${fmt(this.s.bVolym)} st</td><td>${fmt(this.s.vVolym)} st</td></tr>
            <tr><td>Pris</td><td>${fmt(this.s.bPris)} kr/st</td><td>${fmt(this.s.vPris)} kr/st</td></tr>
            <tr><td>Standardkostnad</td><td>${fmt(this.s.stdKost)} kr/st</td><td>${fmt(this.s.stdKost)} kr/st</td></tr>
          </table>
        `;
      }
    },
    solutionText() {
      const fmt = (num) => num ? num.toLocaleString('sv-SE') : 0;
      
      // LÖSNING FÖRBRUKNING
      if (this.currentExercise === 'forbrukning') {
        const prisAvv = (this.s.VP - this.s.SP) * this.s.VK_tot;
        const kvantAvv = (this.s.VK_tot - this.s.SK_tot) * this.s.SP;
        const totAvv = prisAvv + kvantAvv;

        return `
          <p><strong>Formler:</strong></p>
          <ul class="formula-list">
            <li>Prisavvikelse = (VP – SP) x VK</li>
            <li>Kvantitetsavvikelse = (VK – SK) x SP</li>
            <li>Hela avvikelsen = Prisavvikelse + Kvantitetsavvikelse</li>
          </ul>
          <hr>
          <p><strong>Beräkning:</strong></p>
          <p>SP = ${this.s.SP}, VP = ${this.s.VP}, VK = ${fmt(this.s.VK_tot)}, SK = ${fmt(this.s.SK_tot)}</p>
          <p>Prisavvikelse: (${this.s.VP} - ${this.s.SP}) * ${fmt(this.s.VK_tot)} = <strong>${fmt(prisAvv)} kr</strong></p>
          <p>Kvantitetsavvikelse: (${fmt(this.s.VK_tot)} - ${fmt(this.s.SK_tot)}) * ${this.s.SP} = <strong>${fmt(kvantAvv)} kr</strong></p>
          <p>Total avvikelse: ${fmt(totAvv)} kr</p>
        `;
      }

      // LÖSNING OMKSTNAD
      if (this.currentExercise === 'omkostnad') {
        return `
          <p><strong>Påläggssatser:</strong></p>
          <ul class="formula-list">
            <li>Rörlig påläggssats = Budget RK / Budget Volym = ${fmt(this.s.budgRK)} / ${fmt(this.s.budgVolym)} = ${this.s.rorligP} kr/h</li>
            <li>Fast påläggssats = Budget FK / Normal Volym = ${fmt(this.s.budgFK)} / ${fmt(this.s.normVolym)} = ${this.s.fastP} kr/h</li>
            <li>Total påläggssats = ${this.s.rorligP} + ${this.s.fastP} = ${this.s.totalP} kr/h</li>
          </ul>
          <p><strong>Mellanresultat:</strong></p>
          <ul class="formula-list">
            <li>Utfördelade pålägg (VK x Total pålägg) = ${fmt(this.s.VK_tim)} * ${this.s.totalP} = ${fmt(this.s.utfordelad)} kr</li>
            <li>Flexibel budget (FK + VK x Rörlig pålägg) = ${fmt(this.s.budgFK)} + (${fmt(this.s.VK_tim)} * ${this.s.rorligP}) = ${fmt(this.s.flexibel)} kr</li>
            <li>Standard pålägg (SK x Total pålägg) = ${fmt(this.s.SK_tim)} * ${this.s.totalP} = ${fmt(this.s.standard)} kr</li>
          </ul>
          <hr>
          <p><strong>Svar på frågan (${this.s.qLabel}):</strong></p>
          <p class="final-answer">${fmt(this.correctValue)} kr</p>
        `;
      }

      // LÖSNING RESULTAT
      if (this.currentExercise === 'resultat') {
        const vResPerSt = this.s.vPris - this.s.stdKost;
        const bResPerSt = this.s.bPris - this.s.stdKost;
        
        return `
          <p><strong>Formler:</strong></p>
          <ul class="formula-list">
            <li>Resultatavvikelse = Verkligt resultat - Budgeterat resultat</li>
            <li>Volymavvikelse = (Verklig volym – Budgeterad volym) x Budgeterat resultat per styck</li>
            <li>Prisavvikelse = (Verkligt pris – Budgeterat pris) x Verklig volym</li>
          </ul>
          <hr>
          <p>Budgeterat resultat/st: ${this.s.bPris} - ${this.s.stdKost} = ${bResPerSt} kr</p>
          <p><strong>Svar på frågan (${this.s.qLabel}):</strong></p>
          <p class="final-answer">${fmt(this.correctValue)} kr</p>
        `;
      }
    }
  },
  methods: {
    selectExercise(type) {
      this.currentExercise = type;
      this.generateValues(type);
    },
    generateValues(type) {
      this.status.showSolution = false;
      this.status.isShaking = false;
      this.status.isCorrect = false;
      this.userAnswer = '';
      this.s = {};

      const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

      // --- 1. FÖRBRUKNING ---
      if (type === 'forbrukning') {
        this.s.SP = rnd(10, 200); // Standardpris
        this.s.VP = this.s.SP + rnd(-5, 10); // Verkligt pris
        this.s.SK_st = rnd(2, 10); // Standardkvantitet per styck
        this.s.Vv = rnd(100, 1000); // Producerad volym
        this.s.SK_tot = this.s.SK_st * this.s.Vv; // Total Standardkvantitet
        this.s.VK_tot = this.s.SK_tot + rnd(-200, 300); // Total Verklig kvantitet

        // Slumpa vad vi ska fråga efter
        const q = rnd(1, 3);
        if (q === 1) {
          this.s.qLabel = 'Beräkna Prisavvikelsen (kr)';
          this.correctValue = (this.s.VP - this.s.SP) * this.s.VK_tot;
        } else if (q === 2) {
          this.s.qLabel = 'Beräkna Kvantitetsavvikelsen (kr)';
          this.correctValue = (this.s.VK_tot - this.s.SK_tot) * this.s.SP;
        } else {
          this.s.qLabel = 'Beräkna Hela avvikelsen (kr)';
          this.correctValue = ((this.s.VP - this.s.SP) * this.s.VK_tot) + ((this.s.VK_tot - this.s.SK_tot) * this.s.SP);
        }
      }

      // --- 2. OMKSTNAD ---
      if (type === 'omkostnad') {
        this.s.normVolym = rnd(2000, 5000);
        this.s.budgVolym = this.s.normVolym; // Förenkling: ofta samma i dessa uppgifter
        
        // Påläggssatser
        this.s.rorligP = rnd(20, 100);
        this.s.fastP = rnd(50, 150);
        this.s.totalP = this.s.rorligP + this.s.fastP;
        
        // Budget
        this.s.budgRK = this.s.budgVolym * this.s.rorligP;
        this.s.budgFK = this.s.normVolym * this.s.fastP;
        
        // Utfall
        this.s.aktProd = rnd(100, 500); // Antal producerade produkter
        this.s.stdTid = rnd(2, 10); // Timmar per produkt
        this.s.SK_tim = this.s.aktProd * this.s.stdTid; // Standardtimmar
        this.s.VK_tim = this.s.SK_tim + rnd(-100, 200); // Verkliga timmar
        
        // Beräkna "Utfall" (Verklig kostnad) - Slumpa en differens mot flexibel
        this.s.flexibel = this.s.budgFK + (this.s.VK_tim * this.s.rorligP);
        this.s.utfall = this.s.flexibel + rnd(-5000, 5000);
        
        this.s.utfordelad = this.s.VK_tim * this.s.totalP;
        this.s.standard = this.s.SK_tim * this.s.totalP;

        // Slumpa fråga
        const q = rnd(1, 4);
        if (q === 1) {
          this.s.qLabel = 'Beräkna Förbrukningsavvikelsen (Flexibel - Utfall)';
          this.correctValue = this.s.flexibel - this.s.utfall;
        } else if (q === 2) {
          this.s.qLabel = 'Beräkna Sysselsättningsavvikelsen (Utfördelad - Flexibel)';
          this.correctValue = this.s.utfordelad - this.s.flexibel;
        } else if (q === 3) {
          this.s.qLabel = 'Beräkna Prestationsavvikelsen (Standard - Utfördelad)';
          this.correctValue = this.s.standard - this.s.utfordelad;
        } else {
          this.s.qLabel = 'Beräkna Hela avvikelsen (Standard - Utfall)';
          this.correctValue = this.s.standard - this.s.utfall;
        }
      }

      // --- 3. RESULTAT ---
      if (type === 'resultat') {
        this.s.bVolym = rnd(1000, 5000);
        this.s.vVolym = this.s.bVolym + rnd(-500, 1000);
        this.s.bPris = rnd(200, 1000);
        this.s.vPris = this.s.bPris + rnd(-50, 100);
        this.s.stdKost = Math.floor(this.s.bPris * 0.6); // 60% av priset
        
        const bRes = this.s.bVolym * (this.s.bPris - this.s.stdKost);
        const vRes = this.s.vVolym * (this.s.vPris - this.s.stdKost);
        const bResPerSt = this.s.bPris - this.s.stdKost;

        const q = rnd(1, 3);
        if (q === 1) {
          this.s.qLabel = 'Beräkna Resultatavvikelsen (Verkligt - Budgeterat)';
          this.correctValue = vRes - bRes;
        } else if (q === 2) {
          this.s.qLabel = 'Beräkna Volymavvikelsen';
          this.correctValue = (this.s.vVolym - this.s.bVolym) * bResPerSt;
        } else {
          this.s.qLabel = 'Beräkna Försäljningsprisavvikelsen';
          this.correctValue = (this.s.vPris - this.s.bPris) * this.s.vVolym;
        }
      }
      
      this.s.qType = true; // Flagga att vi har genererat
    },
    checkAnswer() {
      // Tolerans för avrundningsfel
      if (Math.abs(Number(this.userAnswer) - this.correctValue) < 2) {
        this.status.isCorrect = true;
      } else {
        this.status.isCorrect = false;
        this.status.isShaking = true;
        setTimeout(() => this.status.isShaking = false, 500);
      }
      this.status.showSolution = true;
    },
    nextExercise() {
      this.generateValues(this.currentExercise);
    }
  }
};
</script>

<style scoped>
.view-container { 
  padding: 2rem; 
  max-width: 800px; 
  margin: 0 auto; 
  text-align: center;
  font-family: Arial, sans-serif;
}
.main-title { font-size: 2rem; margin-bottom: 2rem; color: #333; }

/* MENY KORT */
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
}
.menu-card:hover {
  background: linear-gradient(135deg, #f3eaff 0%, #e0f7fa 100%);
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 28px 0 rgba(80, 80, 120, 0.13), 0 2.5px 8px 0 rgba(120, 120, 160, 0.10);
  border-color: #d1c4e9;
}
.card-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #6c3483;
  margin-bottom: 0.7rem;
  text-align: center;
  letter-spacing: 0.01em;
}
.card-desc {
  font-size: 1.05rem;
  color: #444;
  text-align: center;
  margin-bottom: 0.2rem;
  opacity: 0.85;
}
.card-title { font-size: 1.2rem; margin-bottom: 0.5rem; color: #333; }
.card-desc { font-size: 0.9rem; color: #666; }

/* ÖVNING KORT */
.exercise-card { 
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  max-width: 600px;
  margin: 0 auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.95rem;
}
.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.data-table th { background-color: #f9f9f9; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  text-align: left;
  background: #fcfcfc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.input-area { margin-top: 2rem; }
.instruction { font-weight: bold; margin-bottom: 0.5rem; font-size: 1.1rem; }

.input-wrapper {
  display: flex;
  justify-content: center;
  gap: 10px;
}

input { 
  padding: 0.8rem; 
  border: 2px solid #ddd; 
  border-radius: 6px; 
  width: 150px; 
  text-align: center;
  font-size: 1.1rem;
}

/* KNAPPAR */
button {
  background-color: #FFCCFD; 
  color: #333; 
  border: none; 
  padding: 0.8rem 1.5rem; 
  border-radius: 6px; 
  font-weight: bold; 
  cursor: pointer;
  transition: opacity 0.2s;
}
button:hover { opacity: 0.9; }

.secondary-btn {
  background-color: #eee;
  color: #555;
}

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* LÖSNING */
.solution-area { 
  margin-top: 2rem; 
  padding: 1.5rem; 
  border-radius: 8px; 
  text-align: left;
}
.correct-bg { background-color: #f0fff4; border: 1px solid #c6f6d5; }
.wrong-bg { background-color: #fff5f5; border: 1px solid #fed7d7; }

.status-msg { margin-top: 0; }
.formula-list { padding-left: 1.2rem; font-style: italic; color: #555; }
.final-answer { font-size: 1.2rem; font-weight: bold; color: #2d3748; }

.shake-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
</style>