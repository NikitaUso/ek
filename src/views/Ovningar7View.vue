<template>
  <div class="view-container">
    <h1 class="main-title">Prestationsmätning</h1>

    <!-- MENYVY -->
    <div v-if="!currentExercise" class="exercise-grid">
      <div class="menu-card" @click="selectExercise('havstang')">
        <h2 class="card-title">Hävstång</h2>
        <p class="card-desc">Beräkna R<sub>e</sub>, marginalförändringar och skuldsättningseffekter.</p>
      </div>
      <div class="menu-card" @click="selectExercise('dupont')">
        <h2 class="card-title">DuPont-modellen</h2>
        <p class="card-desc">Vinstmarginal och Kapitalomsättningshastighet.</p>
      </div>
      <div class="menu-card" @click="selectExercise('varde')">
        <h2 class="card-title">Värdeskapande Mått</h2>
        <p class="card-desc">Residualresultat och EVA™.</p>
      </div>
      <div class="menu-card" @click="selectExercise('verksamhet')">
        <h2 class="card-title">Verksamhetsmått</h2>
        <p class="card-desc">Ledtid, Kundmått och Personalnyckeltal.</p>
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
            step="0.01"
            @keyup.enter="checkAnswer"
          />
          <button class="action-btn" @click="checkAnswer">Rätta</button>
        </div>
        <button class="secondary-btn mt-4" @click="currentExercise = null">Avbryt / Tillbaka till menyn</button>
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
  name: 'Ovningar8View',
  data() {
    return {
      currentExercise: null, 
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
        case 'havstang': return 'Hävstångsanalys';
        case 'dupont': return 'DuPont-analys';
        case 'varde': return 'Värdeskapande Mått';
        case 'verksamhet': return 'Verksamhetsmått';
        default: return '';
      }
    },
    questionLabel() {
      return this.s.qLabel || 'Svar:';
    },
    currentQuestionText() {
      if (!this.currentExercise) return '';
      
      // Formatterings-helpers för visning
      const fmt = (num) => num ? Math.round(num).toLocaleString('sv-SE') : 0; // Heltal för kronor
      const pct = (num) => num ? (Math.round(num * 1000) / 10).toLocaleString('sv-SE') + '%' : '0%'; // 1 decimal för %
      const dec = (num) => num ? num.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '0'; // 1-2 decimaler för annat

      // --- 1. HÄVSTÅNG (De tre uppgiftstyperna) ---
      if (this.currentExercise === 'havstang') {
        
        // Uppgift 1: Grundläggande
        if (this.s.type === 'task1') {
          return `
            <p><strong>Uppgift 1: Grundläggande beräkning</strong></p>
            <p>Givna värden för ett företag:</p>
            <ul class="data-list">
              <li>R<sub>t</sub> = <strong>${pct(this.s.Rt)}</strong></li>
              <li>R<sub>s</sub> = <strong>${pct(this.s.Rs)}</strong></li>
              <li>S/E = <strong>${dec(this.s.SE)}</strong></li>
            </ul>
            <p><em>(Tips: Beräkna först förräntningsmarginalen)</em></p>
            <p>Fråga: Beräkna räntabiliteten på eget kapital (R<sub>e</sub>).</p>
          `;
        } 
        // Uppgift 2: Förändring i förräntningsmarginal
        else if (this.s.type === 'task2') {
          return `
            <p><strong>Uppgift 2: Förändring i förräntningsmarginal</strong></p>
            <p>Nuvarande värden:</p>
            <ul class="data-list">
              <li>R<sub>t</sub> = <strong>${pct(this.s.Rt)}</strong></li>
              <li>R<sub>s</sub> = <strong>${pct(this.s.Rs)}</strong></li>
              <li>S/E = <strong>${dec(this.s.SE)}</strong></li>
            </ul>
            <p><strong>Scenario:</strong> Förräntningsmarginalen minskar med <strong>${(this.s.deltaMargin * 100).toLocaleString('sv-SE')}</strong> procentenheter.</p>
            <p>Fråga: Hur stor är förändringen i R<sub>e</sub> i procentenheter?</p>
          `;
        } 
        // Uppgift 3: Förändring i skuldsättningsgrad
        else if (this.s.type === 'task3') {
          return `
            <p><strong>Uppgift 3: Förändring i skuldsättningsgrad</strong></p>
            <p>Givna värden:</p>
            <ul class="data-list">
              <li>R<sub>t</sub> = <strong>${pct(this.s.Rt)}</strong></li>
              <li>R<sub>s</sub> = <strong>${pct(this.s.Rs)}</strong></li>
              <li>Nuvarande S/E = <strong>${dec(this.s.SE_old)}</strong></li>
            </ul>
            <p><strong>Scenario:</strong> Skuldsättningsgraden ökar till <strong>${dec(this.s.SE_new)}</strong>.</p>
            <p>Fråga: Hur stor är förändringen i R<sub>e</sub> i procentenheter?</p>
          `;
        }
      }

      // --- 2. DUPONT ---
      if (this.currentExercise === 'dupont') {
        return `
          <p>Beräkna Räntabilitet på Totalt Kapital (R<sub>t</sub>) enligt DuPont:</p>
          <table class="data-table">
            <tr><td>Omsättning</td><td>${fmt(this.s.oms)} kr</td></tr>
            <tr><td>Rörelseresultat + Fin.int.</td><td>${fmt(this.s.res)} kr</td></tr>
            <tr><td>Totalt Kapital</td><td>${fmt(this.s.kap)} kr</td></tr>
          </table>
          <p><em>(Tips: Vinstmarginal x KOH)</em></p>
        `;
      }

      // --- 3. VÄRDESKAPANDE ---
      if (this.currentExercise === 'varde') {
        if (this.s.type === 'residual') {
          return `
            <p>Beräkna Residualresultatet:</p>
            <ul class="data-list">
              <li>Resultatmått (Rörelseres + Fin.int): <strong>${fmt(this.s.res)} kr</strong></li>
              <li>Totalt kapital: <strong>${fmt(this.s.kap)} kr</strong></li>
              <li>Kalkylränta: <strong>${pct(this.s.krav)}</strong></li>
            </ul>
          `;
        } else if (this.s.type === 'eva') {
          return `
            <p>Beräkna EVA™ (Economic Value Added):</p>
            <ul class="data-list">
              <li>Resultat efter fin. poster + räntekost: <strong>${fmt(this.s.res_for_skatt)} kr</strong></li>
              <li>Sysselsatt kapital: <strong>${fmt(this.s.syss_kap)} kr</strong></li>
              <li>EVA™-ränta (WACC): <strong>${pct(this.s.wacc)}</strong></li>
              <li>Skattesats: <strong>${pct(this.s.skatt)}</strong></li>
            </ul>
            <p><em>(Kom ihåg att beräkna NOPAT först)</em></p>
          `;
        }
      }

      // --- 4. VERKSAMHETSMÅTT ---
      if (this.currentExercise === 'verksamhet') {
        if (this.s.type === 'ledtid') {
          return `
            <p>Beräkna total <strong>Ledtid</strong>:</p>
            <ul class="data-list">
              <li>Processtid: <strong>${dec(this.s.t1)} h</strong></li>
              <li>Omställningstid: <strong>${dec(this.s.t2)} h</strong></li>
              <li>Inspektionstid: <strong>${dec(this.s.t3)} h</strong></li>
              <li>Förflyttningstid: <strong>${dec(this.s.t4)} h</strong></li>
              <li>Kötid: <strong>${dec(this.s.t5)} h</strong></li>
            </ul>
          `;
        } else if (this.s.type === 'andel_nya') {
          return `
            <p>Beräkna <strong>Andel nya kunder</strong> (i %):</p>
            <ul class="data-list">
              <li>Antal nya kunder: <strong>${fmt(this.s.nya)} st</strong></li>
              <li>Totalt antal kunder: <strong>${fmt(this.s.tot)} st</strong></li>
            </ul>
          `;
        } else if (this.s.type === 'utb_kost') {
          return `
            <p>Beräkna <strong>Utbildningskostnad per medarbetare</strong>:</p>
            <ul class="data-list">
              <li>Total utbildningskostnad: <strong>${fmt(this.s.kost)} kr</strong></li>
              <li>Antal medarbetare: <strong>${fmt(this.s.antal)} st</strong></li>
            </ul>
          `;
        }
      }
    },
    solutionText() {
      const fmt = (num) => num ? Math.round(num).toLocaleString('sv-SE') : 0;
      const pct = (num) => num ? (Math.round(num * 1000) / 10).toLocaleString('sv-SE') + '%' : '0%';
      const dec = (num) => num ? num.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '0';
      
      // --- LÖSNINGAR HÄVSTÅNG ---
      if (this.currentExercise === 'havstang') {
        const margin = this.s.Rt - this.s.Rs;
        
        if (this.s.type === 'task1') {
          return `
            <p><strong>a) Förräntningsmarginal:</strong></p>
            <p>R<sub>t</sub> - R<sub>s</sub> = ${pct(this.s.Rt)} - ${pct(this.s.Rs)} = ${pct(margin)}</p>
            <p><strong>b) Räntabilitet på eget kapital (R<sub>e</sub>):</strong></p>
            <p>R<sub>e</sub> = R<sub>t</sub> + (R<sub>t</sub> - R<sub>s</sub>) × S/E</p>
            <p>R<sub>e</sub> = ${pct(this.s.Rt)} + (${pct(margin)}) × ${dec(this.s.SE)}</p>
            <p>R<sub>e</sub> = ${pct(this.s.Rt)} + ${pct(margin * this.s.SE)} = <strong>${pct(this.correctValue)}</strong></p>
          `;
        } 
        else if (this.s.type === 'task2') {
          const oldRe = this.s.Rt + (margin * this.s.SE);
          const newRt = this.s.Rt - this.s.deltaMargin;
          const newMargin = newRt - this.s.Rs;
          const newRe = newRt + (newMargin * this.s.SE);
          
          return `
            <p><strong>a) Ursprungligt R<sub>e</sub>:</strong></p>
            <p>${pct(this.s.Rt)} + (${pct(margin)} × ${dec(this.s.SE)}) = ${pct(oldRe)}</p>
            
            <p><strong>b) Nytt läge (Marginal minskar med ${(this.s.deltaMargin*100).toLocaleString('sv-SE')}%):</strong></p>
            <p>Ny marginal = ${pct(newMargin)}. (Antaget att R<sub>t</sub> sjunker till ${pct(newRt)}).</p>
            <p>Nytt R<sub>e</sub> = ${pct(newRt)} + (${pct(newMargin)} × ${dec(this.s.SE)}) = ${pct(newRe)}</p>
            
            <p><strong>c) Förändring:</strong></p>
            <p>${pct(newRe)} - ${pct(oldRe)} = <strong>${dec(this.correctValue)} procentenheter</strong></p>
          `;
        }
        else if (this.s.type === 'task3') {
          const oldRe = this.s.Rt + (margin * this.s.SE_old);
          const newRe = this.s.Rt + (margin * this.s.SE_new);
          
          return `
            <p><strong>a) Ursprungligt R<sub>e</sub> (S/E = ${dec(this.s.SE_old)}):</strong></p>
            <p>${pct(this.s.Rt)} + (${pct(margin)} × ${dec(this.s.SE_old)}) = ${pct(oldRe)}</p>
            
            <p><strong>b) Nytt läge (S/E = ${dec(this.s.SE_new)}):</strong></p>
            <p>${pct(this.s.Rt)} + (${pct(margin)} × ${dec(this.s.SE_new)}) = ${pct(newRe)}</p>
            
            <p><strong>c) Förändring:</strong></p>
            <p>${pct(newRe)} - ${pct(oldRe)} = <strong>${dec(this.correctValue)} procentenheter</strong></p>
          `;
        }
      }

      // LÖSNING DUPONT
      if (this.currentExercise === 'dupont') {
        return `
          <p><strong>DuPont-formeln:</strong> Vinstmarginal × KOH</p>
          <ul class="formula-list">
            <li>Vinstmarginal = ${fmt(this.s.res)} / ${fmt(this.s.oms)} = ${pct(this.s.margin)}</li>
            <li>KOH = ${fmt(this.s.oms)} / ${fmt(this.s.kap)} = ${dec(this.s.koh)} ggr</li>
            <li>R<sub>t</sub> = ${pct(this.s.margin)} × ${dec(this.s.koh)} = <strong>${pct(this.correctValue)}</strong></li>
          </ul>
        `;
      }

      // LÖSNING VÄRDESKAPANDE
      if (this.currentExercise === 'varde') {
        if (this.s.type === 'residual') {
          return `
            <p><strong>Formel:</strong> Resultatmått – (Totalt kapital × Kalkylränta)</p>
            <p>Kapitalkostnad: ${fmt(this.s.kap)} × ${pct(this.s.krav)} = ${fmt(this.s.kap * this.s.krav)} kr</p>
            <p>Residualresultat: ${fmt(this.s.res)} - ${fmt(this.s.kap * this.s.krav)} = <strong>${fmt(this.correctValue)} kr</strong></p>
          `;
        } else if (this.s.type === 'eva') {
          return `
            <p><strong>Formel:</strong> EVA = NOPAT – (Sysselsatt kapital × EVA-ränta)</p>
            <p>NOPAT = ${fmt(this.s.res_for_skatt)} × (1 - ${pct(this.s.skatt)}) = ${fmt(this.s.nopat)} kr</p>
            <p>Kapitalkostnad = ${fmt(this.s.syss_kap)} × ${pct(this.s.wacc)} = ${fmt(this.s.syss_kap * this.s.wacc)} kr</p>
            <p>EVA = ${fmt(this.s.nopat)} - ${fmt(this.s.syss_kap * this.s.wacc)} = <strong>${fmt(this.correctValue)} kr</strong></p>
          `;
        }
      }

      // LÖSNING VERKSAMHETSMÅTT
      if (this.currentExercise === 'verksamhet') {
        if (this.s.type === 'ledtid') {
          return `
            <p><strong>Formel:</strong> Processtid + Omställning + Inspektion + Förflyttning + Kö</p>
            <p>${dec(this.s.t1)} + ${dec(this.s.t2)} + ${dec(this.s.t3)} + ${dec(this.s.t4)} + ${dec(this.s.t5)} = <strong>${dec(this.correctValue)} h</strong></p>
          `;
        } else if (this.s.type === 'andel_nya') {
          return `<p>${fmt(this.s.nya)} / ${fmt(this.s.tot)} = <strong>${pct(this.correctValue/100)}</strong></p>`;
        } else if (this.s.type === 'utb_kost') {
          return `<p>${fmt(this.s.kost)} / ${fmt(this.s.antal)} = <strong>${fmt(this.correctValue)} kr/st</strong></p>`;
        }
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

      const rnd = (min, max, decimals=0) => {
        const val = Math.random() * (max - min) + min;
        return Number(val.toFixed(decimals));
      };

      // --- 1. HÄVSTÅNG (Dina 3 uppgiftstyper) ---
      if (type === 'havstang') {
        const task = Math.floor(Math.random() * 3) + 1; // 1, 2 eller 3

        // Generera grundvärden (Avrundade till 3 decimaler internt, visas som 1 decimal %)
        this.s.Rt = rnd(0.10, 0.20, 3); 
        this.s.Rs = rnd(0.04, 0.08, 3); 
        
        if (task === 1) {
          // Uppgift 1: Grundläggande
          this.s.type = 'task1';
          this.s.SE = rnd(1.0, 2.0, 1);
          const margin = this.s.Rt - this.s.Rs;
          this.correctValue = this.s.Rt + (margin * this.s.SE);
          this.s.qLabel = 'Svar i % (t.ex. 15,5):';
        } 
        else if (task === 2) {
          // Uppgift 2: Förändring marginal
          this.s.type = 'task2';
          this.s.SE = rnd(1.0, 1.5, 1);
          this.s.deltaMargin = 0.02; // 2%
          
          const oldRe = this.s.Rt + ((this.s.Rt - this.s.Rs) * this.s.SE);
          const newRt = this.s.Rt - this.s.deltaMargin;
          const newMargin = newRt - this.s.Rs;
          const newRe = newRt + ((newRt - this.s.Rs) * this.s.SE);
          
          this.correctValue = (newRe - oldRe) * 100; 
          this.s.qLabel = 'Förändring (procentenheter):';
        } 
        else {
          // Uppgift 3: Förändring S/E
          this.s.type = 'task3';
          this.s.SE_old = rnd(0.5, 1.0, 1);
          this.s.SE_new = this.s.SE_old + rnd(0.5, 1.0, 1); // Ökar med 0.5 - 1.0
          
          const margin = this.s.Rt - this.s.Rs;
          const oldRe = this.s.Rt + (margin * this.s.SE_old);
          const newRe = this.s.Rt + (margin * this.s.SE_new);
          
          this.correctValue = (newRe - oldRe) * 100;
          this.s.qLabel = 'Förändring (procentenheter):';
        }
      }

      // --- 2. DUPONT ---
      if (type === 'dupont') {
        this.s.oms = rnd(5, 20, 0) * 1000000;
        this.s.margin = rnd(0.05, 0.15, 3);
        this.s.koh = rnd(0.5, 2.0, 2);
        this.s.res = Math.round(this.s.oms * this.s.margin); 
        this.s.kap = Math.round(this.s.oms / this.s.koh); 
        this.correctValue = this.s.res / this.s.kap;
        this.s.qLabel = 'Beräkna Rt i %:';
      }

      // --- 3. VÄRDESKAPANDE ---
      if (type === 'varde') {
        const vSub = Math.random();
        
        if (vSub < 0.5) {
          // RESIDUALRESULTAT
          this.s.type = 'residual';
          this.s.kap = rnd(10, 50, 0) * 1000000;
          this.s.krav = rnd(0.08, 0.15, 2);
          this.s.res = Math.round((this.s.kap * this.s.krav) + rnd(-500000, 1000000, 0));
          this.correctValue = this.s.res - (this.s.kap * this.s.krav);
          this.s.qLabel = 'Residualresultat (kr):';
        } else {
          // EVA
          this.s.type = 'eva';
          this.s.syss_kap = rnd(10, 50, 0) * 1000000;
          this.s.wacc = rnd(0.08, 0.12, 2);
          this.s.skatt = 0.206;
          this.s.res_for_skatt = Math.round((this.s.syss_kap * this.s.wacc) / (1-this.s.skatt) + rnd(100000, 500000, 0));
          this.s.nopat = this.s.res_for_skatt * (1 - this.s.skatt);
          
          this.correctValue = this.s.nopat - (this.s.syss_kap * this.s.wacc);
          this.s.qLabel = 'EVA (kr):';
        }
      }

      // --- 4. VERKSAMHETSMÅTT ---
      if (type === 'verksamhet') {
        const kSub = Math.random();
        if (kSub < 0.33) {
          // LEDTID
          this.s.type = 'ledtid';
          this.s.t1 = rnd(1, 10, 1);
          this.s.t2 = rnd(0.5, 5, 1);
          this.s.t3 = rnd(0.1, 2, 1);
          this.s.t4 = rnd(0.5, 3, 1);
          this.s.t5 = rnd(0, 5, 1);
          this.correctValue = this.s.t1 + this.s.t2 + this.s.t3 + this.s.t4 + this.s.t5;
          this.s.qLabel = 'Ledtid (timmar):';
        } else if (kSub < 0.66) {
          // ANDEL NYA KUNDER
          this.s.type = 'andel_nya';
          this.s.nya = rnd(5, 50, 0);
          this.s.tot = rnd(100, 500, 0);
          this.correctValue = (this.s.nya / this.s.tot) * 100;
          this.s.qLabel = 'Andel (%):';
        } else {
          // UTBILDNINGSKOSTNAD
          this.s.type = 'utb_kost';
          this.s.kost = rnd(50000, 200000, 0);
          this.s.antal = rnd(10, 50, 0);
          this.correctValue = this.s.kost / this.s.antal;
          this.s.qLabel = 'Kostnad (kr/st):';
        }
      }
    },
    checkAnswer() {
      let userVal = parseFloat(this.userAnswer);
      if (isNaN(userVal)) return;

      let isCorrect = false;
      
      // Procent-hantering
      const isPercentQuestion = 
        this.s.qLabel.includes('%') || 
        this.s.qLabel.includes('procentenheter') ||
        this.currentExercise === 'dupont'; 

      if (isPercentQuestion) {
        // Tolerera inmatning som 15 (för 15%) eller 0.15
        if (Math.abs(userVal - this.correctValue) < 0.1) isCorrect = true;
        else if (Math.abs((userVal / 100) - this.correctValue) < 0.001) isCorrect = true;
      } else {
        // Kronor (heltal) - tolerera lite avvikelse pga avrundning
        if (Math.abs(userVal - this.correctValue) < 2) isCorrect = true;
        // Decimaltal (timmar)
        if (Math.abs(userVal - this.correctValue) < 0.1) isCorrect = true;
      }

      if (isCorrect) {
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
  max-width: 900px; 
  margin: 0 auto; 
  text-align: center;
  font-family: Arial, sans-serif;
  color: #333;
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
.data-table th { background: #f9f9f9; padding: 8px; border-bottom: 2px solid #eee; }
.data-table td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; }
.data-table td:last-child { text-align: right; font-weight: bold; }

.data-list {
  list-style: none;
  padding: 0;
  text-align: left;
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}
.data-list li { margin-bottom: 0.5rem; font-size: 1.1rem; }

.input-area { margin-top: 2rem; }
.instruction { font-weight: bold; margin-bottom: 0.5rem; font-size: 1.1rem; }

.input-wrapper { display: flex; justify-content: center; gap: 10px; }

input { 
  padding: 0.8rem; 
  border: 2px solid #ddd; 
  border-radius: 6px; 
  width: 150px; 
  text-align: center;
  font-size: 1.1rem;
}

/* Updated buttons based on user preferences */
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

.secondary-btn { background-color: #eee; color: #555; }
.mt-4 { margin-top: 1rem; }

.footer-actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; }

.solution-area { margin-top: 2rem; padding: 1.5rem; border-radius: 8px; text-align: left; }
.correct-bg { background-color: #f0fff4; border: 1px solid #c6f6d5; }
.wrong-bg { background-color: #fff5f5; border: 1px solid #fed7d7; }

.status-msg { margin-top: 0; }
.formula-list { padding-left: 1.2rem; }

.shake-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
</style>