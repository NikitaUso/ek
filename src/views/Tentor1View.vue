<template>
  <div class="view-container">
    <h1 class="main-title">Resultatplanering</h1>

    <div class="graph-container">
      <svg viewBox="0 0 900 500" class="cvp-graph">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
          </marker>
        </defs>

        <line v-for="i in 8" :key="'h'+i" x1="60" :y1="450 - (i*50)" x2="850" :y2="450 - (i*50)" stroke="#f0f0f0" />
        
        <line x1="60" y1="450" x2="850" y2="450" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="60" y1="450" x2="60" y2="30" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
        <text x="820" y="475" font-size="14" font-weight="bold">Volym (st)</text>
        <text x="20" y="30" font-size="14" font-weight="bold" transform="rotate(-90 20,30)">Kr</text>

        <polygon :points="polyPoints" fill="#FFCCFD" opacity="0.4" />

        <line x1="60" :y1="scaleY(inputs.fk)" x2="850" :y2="scaleY(inputs.fk)" stroke="#f56565" stroke-width="2" stroke-dasharray="6" />
        
        <line x1="60" y1="450" :x2="850" :y2="scaleY(inputs.pris * dynamicMaxVolym)" stroke="#2596be" stroke-width="4" />

        <line x1="60" :y1="scaleY(inputs.fk)" :x2="850" :y2="scaleY(inputs.fk + (inputs.rk * dynamicMaxVolym))" stroke="#e53e3e" stroke-width="4" />

        <g>
          <line :x1="scaleX(nollpunkt) - 50" :y1="scaleY(inputs.pris * nollpunkt) - 50" :x2="scaleX(nollpunkt) - 5" :y2="scaleY(inputs.pris * nollpunkt) - 5" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
          <text :x="scaleX(nollpunkt) - 100" :y="scaleY(inputs.pris * nollpunkt) - 60" font-size="12" font-weight="bold">Nollpunkt</text>
        </g>

        <g>
          <line :x1="scaleX(inputs.volym) + 50" :y1="scaleY(inputs.pris * inputs.volym) + 40" :x2="scaleX(inputs.volym) + 5" :y2="scaleY(inputs.pris * inputs.volym) + 5" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
          <text :x="scaleX(inputs.volym) + 40" :y="scaleY(inputs.pris * inputs.volym) + 60" font-size="12" font-weight="bold">Verklig omsättning</text>
        </g>

        <circle :cx="scaleX(nollpunkt)" :cy="scaleY(inputs.pris * nollpunkt)" r="7" fill="white" stroke="#333" stroke-width="2" />
        
        <circle :cx="scaleX(inputs.volym)" :cy="scaleY(inputs.pris * inputs.volym)" r="7" fill="#333" />
      </svg>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span>Nollpunktsvolym: </span>
        <strong>{{ Math.round(nollpunkt) }} st</strong>
      </div>
      <div class="stat-card">
        <span>Omsättning vid nollpunkt: </span>
        <strong>{{ Math.round(nollpunkt * inputs.pris).toLocaleString() }} kr</strong>
      </div>
      <div class="stat-card" :class="inputs.volym >= nollpunkt ? 'pos' : 'neg'">
        <span>Säkerhetsmarginal (%): </span>
        <strong>{{ marginalProcent }}%</strong>
      </div>
      <div class="stat-card">
        <span>Aktuellt Resultat: </span>
        <strong>{{ resultat.toLocaleString() }} kr</strong>
      </div>
    </div>

    <div class="controls-container">
      <div class="control-column">
        <div class="control-item">
          <label>Pris per styck: <b>{{ inputs.pris }} kr</b></label>
          <input type="range" v-model.number="inputs.pris" min="10" max="2000" />
        </div>
        <div class="control-item">
          <label>Rörlig kostnad/st: <b>{{ inputs.rk }} kr</b></label>
          <input type="range" v-model.number="inputs.rk" min="0" :max="inputs.pris - 1" />
        </div>
      </div>
      <div class="control-column">
        <div class="control-item">
          <label>Fasta kostnader: <b>{{ inputs.fk.toLocaleString() }} kr</b></label>
          <input type="range" v-model.number="inputs.fk" min="1000" max="1000000" step="5000" />
        </div>
        <div class="control-item">
          <label>Verklig Volym: <b>{{ inputs.volym }} st</b></label>
          <input type="range" v-model.number="inputs.volym" min="0" max="10000" step="100" />
        </div>
      </div>
    </div>

    <button @click="resetSimulation" class="reset-btn">Återställ</button>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const inputs = reactive({
  pris: 800,
  rk: 300,
  fk: 200000,
  volym: 1500
});

const nollpunkt = computed(() => inputs.fk / (inputs.pris - inputs.rk));
const dynamicMaxVolym = computed(() => Math.max(nollpunkt.value * 1.8, inputs.volym * 1.2, 500));
const dynamicMaxKronor = computed(() => Math.max(inputs.pris * dynamicMaxVolym.value, inputs.fk * 1.5));

const resultat = computed(() => (inputs.pris * inputs.volym) - (inputs.rk * inputs.volym) - inputs.fk);
const marginalProcent = computed(() => {
  if (inputs.volym === 0) return 0;
  return Math.round(((inputs.volym - nollpunkt.value) / inputs.volym) * 100);
});

// Skalnings-funktioner för det nya 900x500 fältet
const scaleX = (val) => 60 + (val / dynamicMaxVolym.value) * 780;
const scaleY = (val) => 450 - (val / dynamicMaxKronor.value) * 400;

const polyPoints = computed(() => {
  const xN = scaleX(nollpunkt.value);
  const xEnd = scaleX(dynamicMaxVolym.value);
  const yNoll = scaleY(inputs.pris * nollpunkt.value);
  const yIntEnd = scaleY(inputs.pris * dynamicMaxVolym.value);
  const yKostEnd = scaleY(inputs.fk + (inputs.rk * dynamicMaxVolym.value));
  return `${xN},${yNoll} ${xEnd},${yIntEnd} ${xEnd},${yKostEnd}`;
});

const resetSimulation = () => {
  inputs.pris = 800; inputs.rk = 300; inputs.fk = 200000; inputs.volym = 1500;
};
</script>

<style scoped>
.view-container { 
  padding: 1rem; 
  max-width: 1100px; 
  margin: 0 auto; 
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrerar allt enligt dina instruktioner */
}

.main-title { font-size: 1.8rem; margin-bottom: 1.5rem; }

.graph-container {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.cvp-graph { width: 100%; height: auto; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fdfdfd;
  padding: 1.2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: inset 0 -4px 0 #eee;
}

.stat-card.pos { box-shadow: inset 0 -4px 0 #48bb78; }
.stat-card.neg { box-shadow: inset 0 -4px 0 #f56565; }

.controls-container {
  display: flex;
  width: 100%;
  gap: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 12px;
}

.control-column { flex: 1; }
.control-item { margin-bottom: 1rem; }
.control-item label { display: block; font-size: 0.9rem; margin-bottom: 0.5rem; }

input[type="range"] { 
  width: 100%; 
  accent-color: #FFCCFD; /* Din önskade färg på reglage */
  cursor: pointer;
}

.reset-btn {
  margin-top: 2rem;
  background: #FFCCFD; /* Din önskade färg på knappar */
  border: none;
  padding: 0.8rem 2.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.reset-btn:hover { opacity: 0.8; }
</style>