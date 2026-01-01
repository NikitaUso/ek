<template>
  <div class="view-container">
    <h1 class="main-title">Formelsamling: Ekonomistyrning</h1>

    <transition name="fade" mode="out-in">
      
      <!-- VY 1: HUVUDMENY (BLOCK) -->
      <div v-if="currentView === 'blocks'" class="menu-container">
        <div class="block-grid">
          <div 
            v-for="(cat, index) in categories" 
            :key="index" 
            class="menu-item block-card"
            :style="{ borderLeft: `6px solid ${cat.color}` }"
            @click="selectCategory(cat.id)"
          >
            <span class="block-title">{{ cat.title }}</span>
            <span class="arrow">➜</span>
          </div>
        </div>
      </div>

      <!-- VY 2: LISTA PÅ FORMLER I ETT BLOCK -->
      <div v-else-if="currentView === 'formula-list'" class="menu-container">
        <div class="header-nav">
          <button class="back-btn" @click="currentView = 'blocks'">
            ⬅ Tillbaka
          </button>
          <h2>{{ activeCategoryTitle }}</h2>
        </div>
        
        <div class="formula-list">
          <div 
            v-for="(formula, index) in filteredFormulas" 
            :key="index" 
            class="formula-item"
            @click="selectFormula(formula)"
          >
            {{ formula.name }}
            <span class="arrow">➜</span>
          </div>
        </div>
      </div>

      <!-- VY 3: INTERAKTIV FORMEL -->
      <div v-else-if="currentView === 'interactive'" class="interactive-container">
        <div class="header-nav">
          <button class="back-btn" @click="currentView = 'formula-list'">
            ⬅ Tillbaka
          </button>
        </div>
        
        <div class="formula-card-display">
          <h2 class="formula-title">{{ selectedFormula.name }}</h2>
          
          <div class="equation-box">
            <div class="subject-box">
              {{ currentVariation.subject }}
            </div>

            <div class="equals-sign">=</div>

            <div class="expression-box">
              <template v-for="(part, index) in currentVariation.parts" :key="index">
                <span v-if="part.isOperator" class="operator-text">
                  {{ part.value }}
                </span>
                <button 
                  v-else 
                  class="variable-btn"
                  @click="changeSubject(part.value)"
                  :title="'Klicka för att lösa ut ' + part.value"
                >
                  {{ part.value }}
                </button>
              </template>
            </div>
          </div>
          
          <p class="instruction">Klicka på ett värde till höger för att lösa ut det.</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentView = ref('blocks');
const activeCategory = ref(null);
const selectedFormula = ref(null);
const currentVariationIndex = ref(0);

const categories = [
  { id: 'grund', title: 'Grundbegrepp', color: '#fcdcf4' },
  { id: 'resultat', title: 'Resultatplanering', color: '#fef0cb' },
  { id: 'sjalv', title: 'Självkostnadskalkylering', color: '#d5f0d0' },
  { id: 'bidrag', title: 'Bidragskalkylering', color: '#e5d9f7' },
  { id: 'budget', title: 'Budgetering', color: '#c9e8fb' },
  { id: 'standard', title: 'Standardkostnader', color: '#fbc9c9' },
  { id: 'investering', title: 'Investeringsbedömning', color: '#e2e2e2' },
  { id: 'prestation', title: 'Prestationsmätning', color: '#ffd1dc' }
];

// --- LOGIK-MOTOR ---
const createDivision = (name, category, A, B, C) => ({
  name, category,
  variations: [
    { subject: A, parts: [{value: B}, {value: '/', isOperator: true}, {value: C}] },
    { subject: B, parts: [{value: A}, {value: '×', isOperator: true}, {value: C}] },
    { subject: C, parts: [{value: B}, {value: '/', isOperator: true}, {value: A}] }
  ]
});

const createMultiplication = (name, category, A, B, C) => ({
  name, category,
  variations: [
    { subject: A, parts: [{value: B}, {value: '×', isOperator: true}, {value: C}] },
    { subject: B, parts: [{value: A}, {value: '/', isOperator: true}, {value: C}] },
    { subject: C, parts: [{value: A}, {value: '/', isOperator: true}, {value: B}] }
  ]
});

const createSubtraction = (name, category, A, B, C) => ({
  name, category,
  variations: [
    { subject: A, parts: [{value: B}, {value: '-', isOperator: true}, {value: C}] },
    { subject: B, parts: [{value: A}, {value: '+', isOperator: true}, {value: C}] },
    { subject: C, parts: [{value: B}, {value: '-', isOperator: true}, {value: A}] }
  ]
});

const createAddition = (name, category, A, B, C) => ({
  name, category,
  variations: [
    { subject: A, parts: [{value: B}, {value: '+', isOperator: true}, {value: C}] },
    { subject: B, parts: [{value: A}, {value: '-', isOperator: true}, {value: C}] },
    { subject: C, parts: [{value: A}, {value: '-', isOperator: true}, {value: B}] }
  ]
});

/* --- DATA: ALLA FORMLER --- */
const allFormulas = [
  // 1. GRUNDBEGREPP
  createDivision("Effektivitet", 'grund', "Effektivitet", "Värde utflöde", "Värde inflöde"),
  createDivision("Produktivitet", 'grund', "Produktivitet", "Kvantitet utflöde", "Kvantitet inflöde"),
  createDivision("Lönsamhet", 'grund', "Lönsamhet", "Resultat", "Kapital"),

  // 2. RESULTATPLANERING
  createAddition("Totala Kostnader", 'resultat', "Totalkostnad", "Rörliga kostnader", "Fasta kostnader"),
  createMultiplication("Totala Intäkter", 'resultat', "Total intäkt", "Pris/st", "Volym"),
  {
    name: "Resultat",
    category: 'resultat',
    variations: [
      { subject: "Resultat", parts: [{value: "Total intäkt"}, {value: '-', isOperator: true}, {value: "Totala kostnader"}] },
      { subject: "Total intäkt", parts: [{value: "Resultat"}, {value: '+', isOperator: true}, {value: "Totala kostnader"}] }
    ]
  },
  {
    name: "Kritisk Punkt (Ekvation)",
    category: 'resultat',
    variations: [
      { subject: "0 kr", parts: [{value: "Intäkter"}, {value: '-', isOperator: true}, {value: "Kostnader"}] }
    ]
  },
  createSubtraction("Säkerhetsmarginal (Volym)", 'resultat', "SM Volym", "Faktisk volym", "Kritisk volym"),
  createDivision("Säkerhetsmarginal % (Volym)", 'resultat', "SM %", "Säkerhetsmarginal (st)", "Faktisk volym"),
  createSubtraction("Säkerhetsmarginal (Intäkt)", 'resultat', "SM Intäkt", "Faktisk intäkt", "Kritisk intäkt"),
  createDivision("Säkerhetsmarginal % (Intäkt)", 'resultat', "SM %", "Säkerhetsmarginal (kr)", "Faktisk intäkt"),
  createSubtraction("Totalt Täckningsbidrag", 'resultat', "Totalt TB", "Total intäkt", "Total Rörlig Kostnad"),
  createDivision("Täckningsgrad (per st)", 'resultat', "Täckningsgrad", "TB/st", "Pris/st"),
  createDivision("Täckningsgrad (Total)", 'resultat', "Täckningsgrad", "Totalt TB", "Totala intäkter"),
  createDivision("Kritisk Volym", 'resultat', "Kritisk Volym", "Fasta Kostnader", "TB/st"),
  createDivision("Kritisk Omsättning (Alt 1)", 'resultat', "Kritisk Omsättning", "FK", "Täckningsgrad"),
  {
    name: "Kritisk Omsättning (Alt 2)",
    category: 'resultat',
    variations: [
      { subject: "Kritisk Omsättning", parts: [{value: "Fasta Kostnader"}, {value: '/', isOperator: true}, {value: "TB/st"}, {value: '×', isOperator: true}, {value: "Pris/st"}] }
    ]
  },

  // 3. SJÄLVKOSTNADSKALKYLERING
  createDivision("Divisionsmetoden", 'sjalv', "Självkostnad/st", "Total kostnad", "Verksamhetsvolym"),
  {
    name: "Normalmetoden",
    category: 'sjalv',
    variations: [
      { subject: "Självkostnad/st", parts: [{value: "Rörlig kostnad"}, {value: '/', isOperator: true}, {value: "Verklig volym"}, {value: '+', isOperator: true}, {value: "Fast kostnad"}, {value: '/', isOperator: true}, {value: "Normal volym"}] }
    ]
  },
  createMultiplication("Ekvivalentvolym", 'sjalv', "Ekvivalentvolym", "Verklig volym", "Ekvivalenttal"),
  createDivision("Pålägg (Generell)", 'sjalv', "Pålägg", "Omkostnader", "Fördelningsnyckel"),
  createAddition("Självkostnad (Pålägg)", 'sjalv', "Självkostnad", "Direkta kostnader", "Pålägg"),
  // Specifika pålägg
  createDivision("Tjänsteomkostnadspålägg (TJO)", 'sjalv', "TJO-pålägg", "Tjänsteomkostnader", "Direkt lönekostnad"),
  createDivision("Admin/Försäljning (AO/FO)", 'sjalv', "AFFO-pålägg", "AO + FO", "Tillverkningskostnad (eller Tjänstekostnad)"),
  createDivision("Varuomkostnadspålägg (VO)", 'sjalv', "VO-pålägg", "Varuomkostnad", "Varupris"),
  createDivision("Materialomkostnadspålägg (MO)", 'sjalv', "MO-pålägg", "Materialomkostnader", "Direkt materialkostnad"),
  createDivision("Tillverkningsomkostnadspålägg (TO)", 'sjalv', "TO-pålägg", "Tillverkningsomkostnader", "Direkt lönekostnad"),
  createAddition("Tillverkningskostnad", 'sjalv', "Tillverkningskostnad", "Direkt Material + MO", "Direkt Lön + TO"),
  createDivision("Budgeterat Pålägg", 'sjalv', "Pålägg", "Budgeterade omkostnader", "Budgeterad fördelningsnyckel"),
  createDivision("Normalt Pålägg", 'sjalv', "Pålägg", "Normala omkostnader", "Normal fördelningsnyckel"),

  // 4. BIDRAGSKALKYLERING
  createSubtraction("Täckningsbidrag", 'bidrag', "TB", "Särintäkter", "Särkostnader"),
  createSubtraction("Resultat (Bidrag)", 'bidrag', "Resultat", "Totalt TB", "Samkostnader"),
  createDivision("Täckningsgrad", 'bidrag', "TG", "Täckningsbidrag", "Särintäkt"),
  createSubtraction("Totalt TB (Formel)", 'bidrag', "Totalt TB", "Totala Särintäkter", "Totala Rörliga Särkostnader"),
  createDivision("Rörlig särkostnad/st", 'bidrag', "Rörlig särkostnad/st", "Totala rörliga särkostnader", "Verksamhetsvolym"),
  {
    name: "Orderkalkylering",
    category: 'bidrag',
    variations: [
      { subject: "Resultat", parts: [{value: "Särintäkter"}, {value: '-', isOperator: true}, {value: "Rörliga särkostnader"}, {value: '-', isOperator: true}, {value: "Fasta särkostnader"}, {value: '-', isOperator: true}, {value: "Samkostnader"}] }
    ]
  },
  createSubtraction("Bruttovinst", 'bidrag', "Bruttovinst", "Särintäkter", "Varukostnad"),
  createDivision("Bruttovinstmarginal", 'bidrag', "Bruttovinstmarginal", "Bruttovinst", "Särintäkt"),

  // 5. BUDGETERING
  {
    name: "Genomsnittliga Kundfordringar",
    category: 'budget',
    variations: [
      { subject: "Genomsnitt KF", parts: [{value: "Nettoomsättning"}, {value: '×', isOperator: true}, {value: "Andel kredit"}, {value: '/', isOperator: true}, {value: "360"}, {value: '×', isOperator: true}, {value: "Kredittid"}] }
    ]
  },
  {
    name: "Genomsnittliga Leverantörsskulder",
    category: 'budget',
    variations: [
      { subject: "Genomsnitt LS", parts: [{value: "Inköp"}, {value: '/', isOperator: true}, {value: "360"}, {value: '×', isOperator: true}, {value: "Kredittid"}] }
    ]
  },
  {
    name: "Inbetalning från försäljning",
    category: 'budget',
    variations: [
      { subject: "Inbetalning", parts: [{value: "Nettoomsättning"}, {value: '+', isOperator: true}, {value: "IB Kundfordringar"}, {value: '-', isOperator: true}, {value: "UB Kundfordringar"}] }
    ]
  },
  {
    name: "Utbetalning för inköp",
    category: 'budget',
    variations: [
      { subject: "Utbetalning", parts: [{value: "Inköp"}, {value: '+', isOperator: true}, {value: "IB Lev.skulder"}, {value: '-', isOperator: true}, {value: "UB Lev.skulder"}] }
    ]
  },
  createMultiplication("Budgeterad Intäkt", 'budget', "Budg. Intäkt", "Volym", "Budgeterat styckpris"),
  createMultiplication("Budgeterad RK", 'budget', "Budg. RK", "Volym", "Budgeterad RK/st"),

  // 6. STANDARDKOSTNADER
  createMultiplication("Standardkostnad", 'standard', "Std.Kostnad", "Std.Pris", "Std.Kvantitet"),
  createMultiplication("Standardintäkt", 'standard', "Std.Intäkt", "Std.Pris", "Std.Kvantitet (Timmar)"),
  createMultiplication("Standardkostnad Arbete", 'standard', "Arbetskostnad", "Std.Tid", "Std.Kostnad/timme"),
  createSubtraction("Avvikelse (Total)", 'standard', "Avvikelse", "Standardkostnad", "Verklig kostnad"),
  {
    name: "Prisavvikelse",
    category: 'standard',
    variations: [
      { subject: "Prisavvikelse", parts: [{value: "("}, {value: "Std.Pris"}, {value: '-', isOperator: true}, {value: "Verkligt Pris"}, {value: ")"}, {value: '×', isOperator: true}, {value: "Verklig Kvantitet"}] }
    ]
  },
  {
    name: "Kvantitetsavvikelse",
    category: 'standard',
    variations: [
      { subject: "Kvantitetsavvikelse", parts: [{value: "("}, {value: "Std.Kvantitet"}, {value: '-', isOperator: true}, {value: "Verklig Kvantitet"}, {value: ")"}, {value: '×', isOperator: true}, {value: "Std.Pris"}] }
    ]
  },
  createSubtraction("Resultatavvikelse", 'standard', "Avvikelse", "Verkligt resultat", "Budgeterat resultat"),
  {
    name: "Volymavvikelse",
    category: 'standard',
    variations: [
      { subject: "Volymavvikelse", parts: [{value: "("}, {value: "Verklig volym"}, {value: '-', isOperator: true}, {value: "Budgeterad volym"}, {value: ")"}, {value: '×', isOperator: true}, {value: "Budgeterat resultat/st"}] }
    ]
  },
  {
    name: "Förbrukningsavvikelse",
    category: 'standard',
    variations: [
      { subject: "Förbrukningsavvikelse", parts: [{value: "("}, {value: "Verkligt pris"}, {value: '-', isOperator: true}, {value: "Budgeterat pris"}, {value: ")"}, {value: '×', isOperator: true}, {value: "Verklig volym"}] }
    ]
  },

  // 7. INVESTERINGSBEDÖMNING
  createDivision("Payback-metoden", 'investering', "Återbetalningstid", "Grundinvestering", "Årligt Inbetalningsöverskott"),
  createSubtraction("Nettonuvärde", 'investering', "NNV", "Summa Nuvärden (in/ut)", "Grundinvestering"),
  {
    name: "Annuitetsmetoden (Alt A)",
    category: 'investering',
    variations: [
      { subject: "Årligt överskott", parts: [{value: "Inbetalningsöverskott/år"}, {value: '-', isOperator: true}, {value: "Annuitet av Grundinvestering"}] }
    ]
  },
  {
    name: "Annuitetsmetoden (Alt B)",
    category: 'investering',
    variations: [
      { subject: "Årligt överskott", parts: [{value: "Nettonuvärde"}, {value: '×', isOperator: true}, {value: "Annuitetsfaktor (Tabell D)"}] }
    ]
  },
  createAddition("Total årskostnad", 'investering', "Årskostnad", "Annuitet", "Driftskostnader"),
  createDivision("Internräntemetoden (Faktor)", 'investering', "Nuvärdesummefaktor", "Grundinvestering", "Årligt Inbetalningsöverskott"),
  {
    name: "Tillväxträntemetoden",
    category: 'investering',
    variations: [
      { subject: "Grundinvestering x Slutvärdefaktor", parts: [{value: "Slutvärde av in/ut-betalningar"}, {value: '+/-', isOperator: true}, {value: "Restvärde"}] }
    ]
  },
  createDivision("Nettonuvärdeskvot", 'investering', "NNV-kvot", "Nettonuvärde", "Grundinvestering"),
  createDivision("Annuitetskvot", 'investering', "Annuitetskvot", "Årsöverskott", "Grundinvestering"),
  // Skatteformler
  createMultiplication("Betalning efter skatt", 'investering', "Betalning e. skatt", "Betalning", "(1 - Skattesats)"),
  {
    name: "Reavinst efter skatt",
    category: 'investering',
    variations: [
      { subject: "Restvärde e. skatt", parts: [{value: "Restvärde"}, {value: '-', isOperator: true}, {value: "("}, {value: "Reavinst"}, {value: '×', isOperator: true}, {value: "Skattesats"}, {value: ")"}] }
    ]
  },
  createMultiplication("Kalkylränta efter skatt", 'investering', "Ränta e. skatt", "Ränta f. skatt", "(1 - Skattesats)"),
  createMultiplication("Avskrivning skatteeffekt", 'investering', "Skatteeffekt", "Avskrivning", "Skattesats"),
  {
    name: "Real ränta (Fisher)",
    category: 'investering',
    variations: [
      { subject: "Real ränta", parts: [{value: "("}, {value: "Nominell ränta"}, {value: '-', isOperator: true}, {value: "Inflation"}, {value: ")"}, {value: '/', isOperator: true}, {value: "("}, {value: "1"}, {value: '+', isOperator: true}, {value: "Inflation"}, {value: ")"}] }
    ]
  },

  // 8. PRESTATIONSMÄTNING
  createDivision("Räntabilitet Totalt Kapital (Rt)", 'prestation', "Rt", "Res. e. fin. + Räntekostnad", "Totalt Kapital"),
  createDivision("Räntabilitet Sysselsatt Kapital (Rsyss)", 'prestation', "Rsyss", "Res. e. fin. + Räntekostnad", "Sysselsatt Kapital"),
  {
    name: "Räntabilitet Eget Kapital (Re)",
    category: 'prestation',
    variations: [
      { subject: "Re", parts: [{value: "Res. e. fin."}, {value: '×', isOperator: true}, {value: "(1 - Skatt)"}, {value: '/', isOperator: true}, {value: "Justerat Eget Kapital"}] }
    ]
  },
  {
    name: "Justerat Eget Kapital",
    category: 'prestation',
    variations: [
      { subject: "Justerat EK", parts: [{value: "Eget Kapital"}, {value: '+', isOperator: true}, {value: "Obeskattade reserver"}, {value: '×', isOperator: true}, {value: "(1 - Skatt)"}] }
    ]
  },
  createDivision("Genomsnittlig skuldränta (Rs)", 'prestation', "Rs", "Räntekostnader", "Skulder"),
  {
    name: "Residualresultat",
    category: 'prestation',
    variations: [
      { subject: "Residualresultat", parts: [{value: "Resultat"}, {value: '-', isOperator: true}, {value: "("}, {value: "Kapital"}, {value: '×', isOperator: true}, {value: "Kravränta"}, {value: ")"}] }
    ]
  },
  {
    name: "Kalkylmässig ränta (WACC)",
    category: 'prestation',
    variations: [
      { subject: "WACC", parts: [{value: "EK"}, {value: '×', isOperator: true}, {value: "Re"}, {value: '+', isOperator: true}, {value: "Skulder"}, {value: '×', isOperator: true}, {value: "Rs"}, {value: '/', isOperator: true}, {value: "Totalt Kapital"}] }
    ]
  },
  createMultiplication("NOPAT", 'prestation', "NOPAT", "Res. e. fin + Räntekostn.", "(1 - Skatt)"),
  {
    name: "EVA (Economic Value Added)",
    category: 'prestation',
    variations: [
      { subject: "EVA", parts: [{value: "NOPAT"}, {value: '-', isOperator: true}, {value: "("}, {value: "Sysselsatt kapital"}, {value: '×', isOperator: true}, {value: "EVA-ränta"}, {value: ")"}] }
    ]
  },
  createDivision("Vinstmarginal", 'prestation', "Vinstmarginal", "Resultat", "Omsättning"),
  createDivision("Kapitalomsättningshastighet", 'prestation', "KOH", "Omsättning", "Totalt Kapital"),
  
  // Icke-finansiella mått
  createDivision("Andel nya kunder", 'prestation', "Andel", "Antal nya kunder", "Totalt antal kunder"),
  createDivision("Försäljningsandel nya kunder", 'prestation', "Andel", "Försäljning nya kunder", "Total försäljning"),
  createSubtraction("Resultat per kund", 'prestation', "Res/kund", "Försäljning per kund", "Självkostnad per kund"),
  createDivision("Marginal per kund", 'prestation', "Marginal", "TB per kund", "Försäljning per kund"),
  createDivision("Andel anställda (Kön)", 'prestation', "Andel", "Antal kvinnor/män", "Totalt antal anställda"),
  createDivision("Genomsnittlig ålder", 'prestation', "Medelålder", "Summa ålder", "Antal medarbetare"),
  createDivision("Utbildningskostnad/anställd", 'prestation', "Kostnad/anställd", "Total utbildningskostnad", "Antal medarbetare"),
  createDivision("Andel utbildade", 'prestation', "Andel", "Utbildade medarbetare", "Antal medarbetare"),
  createDivision("Andel utbildningskostnad", 'prestation', "Andel", "Total utbildningskostnad", "Totala kostnader"),
  createDivision("Leveransprecision", 'prestation', "Andel", "Leveranser i tid", "Totalt antal leveranser"),
  {
    name: "Ledtid",
    category: 'prestation',
    variations: [
      { subject: "Ledtid", parts: [{value: "Processtid"}, {value: '+', isOperator: true}, {value: "Omställning"}, {value: '+', isOperator: true}, {value: "Inspektion"}, {value: '+', isOperator: true}, {value: "Förflyttning"}, {value: '+', isOperator: true}, {value: "Kötid"}] }
    ]
  },
  createDivision("Andel värdeskapande tid", 'prestation', "Andel", "Värdeskapande tid", "Total ledtid"),
  createDivision("Klagomål per enhet", 'prestation', "Andel", "Antal klagomål", "Antal kunder/order"),
  createDivision("Andel reklamerade leveranser", 'prestation', "Andel", "Reklamerade leveranser", "Utförda leveranser"),
  createDivision("Felaktiga konteringar", 'prestation', "Andel", "Felaktiga konteringar", "Totala konteringar"),
  createDivision("Kasserade varor", 'prestation', "Andel", "Kasserade varor", "Totalt inköpta varor"),
  createDivision("Omarbetning", 'prestation', "Andel", "Omarbetade produkter", "Totalt antal produkter"),
  createDivision("Förfallna räntor", 'prestation', "Andel", "Förfallna betalningar", "Totala betalningar"),
  createMultiplication("Marknadsvärde", 'prestation', "Marknadsvärde", "Antal aktier", "Aktiekurs"),
  createSubtraction("Intellektuellt kapital", 'prestation', "Intellektuellt kap.", "Marknadsvärde", "Eget kapital")
];

const filteredFormulas = computed(() => {
  return allFormulas.filter(f => f.category === activeCategory.value);
});

const activeCategoryTitle = computed(() => {
  const cat = categories.find(c => c.id === activeCategory.value);
  return cat ? cat.title : 'Välj Kategori';
});

const currentVariation = computed(() => {
  if (!selectedFormula.value) return { subject: '', parts: [] };
  const idx = Math.min(currentVariationIndex.value, selectedFormula.value.variations.length - 1);
  return selectedFormula.value.variations[idx];
});

// --- Actions ---
const selectCategory = (id) => {
  activeCategory.value = id;
  currentView.value = 'formula-list';
};

const selectFormula = (formula) => {
  selectedFormula.value = formula;
  currentVariationIndex.value = 0; 
  currentView.value = 'interactive';
};

const changeSubject = (clickedValue) => {
  const cleanValue = clickedValue.replace(/[()]/g, '');
  const newIndex = selectedFormula.value.variations.findIndex(v => v.subject === cleanValue || v.subject === clickedValue);
  if (newIndex !== -1) {
    currentVariationIndex.value = newIndex;
  }
};
</script>

<style scoped>
.view-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  text-align: center;
  color: #333;
  min-height: 80vh;
}

.main-title {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

/* --- Block Meny --- */
.block-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  width: 100%;
}

.menu-item {
  background: white;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.arrow { color: #aaa; }

/* --- Formel Lista --- */
.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn {
  background: #f5f5f5;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #555;
  transition: background 0.2s;
}

.back-btn:hover { background: #e0e0e0; }

.formula-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.formula-item {
  background: white;
  border: 1px solid #eee;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  transition: border-color 0.2s;
}

.formula-item:hover { border-color: #FFCCFD; }

/* --- Interaktiv Vy --- */
.formula-card-display {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.formula-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #333;
}

.equation-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.subject-box {
  background-color: #f0f0f0;
  border: 2px solid #333;
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  font-weight: bold;
}

.equals-sign { font-size: 2rem; font-weight: bold; }

.expression-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.operator-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
}

.variable-btn {
  background-color: #FFCCFD;
  border: 2px solid transparent;
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.2s;
  color: #333;
}

.variable-btn:hover {
  border-color: #333;
  transform: scale(1.05);
}

.instruction {
  color: #888;
  font-style: italic;
  margin-top: 1rem;
  font-size: 0.9rem;
}

/* Mobilanpassning */
@media (max-width: 600px) {
  .equation-box { flex-direction: column; }
  .expression-box { justify-content: center; }
  .variable-btn { width: 100%; }
}
</style>