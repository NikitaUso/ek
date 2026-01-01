// ...existing code...
<template>
  <div class="view-container">
    <h1 class="main-title">Flashcards: Block 5</h1>

    <!-- FLASHCARD SCENE -->
    <div class="flashcard-scene">
      <div 
        class="flashcard" 
        :class="{ 'is-flipped': isFlipped }" 
        @click="flipCard"
      >
        <!-- FRAMSIDA (Begrepp) -->
        <div class="card-face card-front">
          <div class="content">
            <span class="label">Begrepp</span>
            <h2 class="concept-title">{{ currentCard.front }}</h2>
            <p class="hint">(Klicka för att vända)</p>
          </div>
        </div>

        <!-- BAKSIDA (Förklaring) -->
        <div class="card-face card-back">
          <div class="content">
            <span class="label">Förklaring</span>
            <p class="explanation-text">{{ currentCard.back || "Ingen definition angiven." }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- NAVIGERING -->
    <div class="controls">
      <button 
        @click.stop="prevCard" 
        :disabled="currentIndex === 0" 
        class="nav-btn"
      >
        Föregående
      </button>
      
      <span class="counter">{{ currentIndex + 1 }} / {{ cards.length }}</span>
      
      <button 
        @click.stop="nextCard" 
        :disabled="currentIndex === cards.length - 1" 
        class="nav-btn"
      >
        Nästa
      </button>
    </div>

    <!-- EXTRA KONTROLLER -->
    <div class="footer-actions">
      <button @click="reshuffle" class="reset-btn">Blanda om korten</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Den exakta datan från användaren - inga ord ändrade
const flashcardsData = [
  { front: "Företag", back: "Större sammanslutning personer som bedriver ett medvetet arbete för att uppnå ett mål." },
  { front: "Ekonomi", back: "Hushållning med begränsade resurser." },
  { front: "Företagsekonomi", back: "Läran om företags hushållning med begränsade resurser." },
  { front: "Ekonomistyrning", back: "Avsiktlig påverkan på en verksamhet och dess befattningshavare mot vissa ekonomiska mål." },
  { front: "Formaliserade styrmedel", back: "Styrmedel av metodkaraktär och utgör ekonomistyrningens tekniker, såsom : produktkalkylering, budgetering m.m." },
  { front: "Organisationsstruktur", back: "Innefattar aspekter på bla verksamhetens utformning, arbetets utförande, beslut, ansvar och personalstruktur." },
  { front: "Mindre formaliserade styrmedel", back: "Mjuka styrmedel, såsom företagskultur, lärande och medarbetarskap." },
  { front: "Vision", back: "Anger hur man vill att kunderna ska uppfatta företaget eller den riktning i vilken företaget ska utvecklas. Önskvärt framtida tillstånd." },
  { front: "Visionens tre funktioner", back: "Legitimerande, ambition & fokus samt identifikation & motivation." },
  { front: "Affärsidé", back: "Vad företaget ska ägna sig åt och hur man avser att utvecklas i förhållande till visionen. Klargörande av differentiering." },
  { front: "Strategi", back: "Klargör hur företaget ska arbeta. Plan för hur företagets affärsidé ska uppnås." },
  { front: "Verksamhetsplanering", back: "Nedbrytning av huvudmål till delmål och framtagande av handlingsplaner och riktlinjer." },
  { front: "Effektivitet", back: "Graden av måluppfyllelse och uttryck för i vilken utsträckning företaget uppnår ett mål. Värdet av utflöde / Värdet av inflöde = E" },
  { front: "Intäkt", back: "" },
  { front: "Kostnad", back: "" },
  { front: "Öppna systemsynsättet", back: "Man ser organisationen som en del av ett större ekosystem snarare än en sluten enhet." },
  { front: "Nuvärde", back: "Värdet idag" },
  { front: "Inre effektivitet", back: "Handlar om att göra saker rätt" },
  { front: "Yttre effektivitet", back: "Handlar om att göra rätt saker, rör företagets relationer till sin omvärld." },
  { front: "Produktivitet", back: "Vad som har åstadkommits och den resursinsats som satts in och de prestationer som utförts för att åstadkomma resultat uttrycks i fysiska termer, dvs i kvantiteter. Kvantitet utflöde / Kvantitet inflöde = P" },
  { front: "Inbetalning", back: "Inflöde av likvida medel." },
  { front: "Utbetalning", back: "Utflöde av likvida medel. Uppkommer när det köpande bolaget betalar för anskaffade resurser." },
  { front: "Inkomst", back: "Uppstår när ett företag säljer varor eller tjänster. När fakturan skickas." },
  { front: "Utgift", back: "Uppstår när ett företag anskaffar resurser genom köp av varor eller tjänster. När fakturan kommer." },
  { front: "Lönsamhet", back: "Ett kvotmått, ett relationstal. Resultat / Kapital = L" },
  { front: "Det vertikala perspektivet", back: "Företaget ses som en hierarki med under- och överordnade enheter. “Toppen styr” och ekonomistyrning är medlet vilket de överordnade enheterna kan kontrollera." },
  { front: "Det horisontella perspektivet", back: "Företag betraktas som en serie processer som in sin tur består av aktiviteter vilka syftar till att skapa kundvärde. Ekonomistyrningens uppgift är att länka samman processer och aktiviteter." },
  { front: "Lönsamhetsansvar", back: "Ansvaret ska svara mot ägarnas avkastningskrav. Enheten har såväl befogenhet som möjligheter att påverka de intäkter och kostnader och det kapital som ingår i ansvaret." },
  { front: "Resultatansvar", back: "Ansvar för att uppnå ett ekonomiskt resultat genom att påverka intäkter och kostnader, men utan fullt ansvar för kapitalbindning." },
  { front: "Intäkts- eller bidragsansvar", back: "Innebär att målsättningar och krav preciseras i termer av intäkter, dvs försäljning." },
  { front: "Kostnadsansvar", back: "Ansvar för att kontrollera och påverka kostnader." },
  { front: "Belöningssystem", back: "Används för att motivera anställda att uppnå organisationens må. Finns finansiella och icke-finansiella." },
  { front: "Företagskultur", back: "Organisationens inre liv, dvs sättet att leva, tänka, handla och vara." },
  { front: "Single-loop learning", back: "Innebär att när något oönskat inträffar så löser man det utan att gå till botten med orsaken till det inträffade." },
  { front: "Double-loop learning", back: "Innebär att såväl det oönskade löses som att ett ifrågasättande av själva orsaken till det inträffade äger rum." },
  { front: "Medarbetarskap", back: "Handlar om demokratisering av arbetslivet. Strategi för att öka engagemanget och viljan att göra ett bra jobb." },
  { front: "Kostnads- och nyttokriteriet", back: "Det centrala kriteriet som bör tillämpas vid val mellan metoder är deras nytta när det gäller att bidra till uppfyllandet av mål jämfört med kostnaden för metoderna." }
];

const cards = ref([]);
const currentIndex = ref(0);
const isFlipped = ref(false);

const currentCard = computed(() => {
  if (cards.value.length === 0) return { front: '', back: '' };
  return cards.value[currentIndex.value];
});

const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const reshuffle = () => {
  isFlipped.value = false;
  setTimeout(() => {
    cards.value = shuffle(flashcardsData);
    currentIndex.value = 0;
  }, 300);
};

const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};

const nextCard = () => {
  if (currentIndex.value < cards.value.length - 1) {
    isFlipped.value = false;
    setTimeout(() => {
      currentIndex.value++;
    }, 200);
  }
};

const prevCard = () => {
  if (currentIndex.value > 0) {
    isFlipped.value = false;
    setTimeout(() => {
      currentIndex.value--;
    }, 200);
  }
};

onMounted(() => {
  cards.value = shuffle(flashcardsData);
});
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
  text-align: center;
  min-height: 80vh;
}

.main-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

/* 3D KORT-CSS - BREDDAT KORT */
.flashcard-scene {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  perspective: 1000px;
  margin-bottom: 2rem;
  cursor: pointer;
}

.flashcard {
  width: 700px;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 3rem; /* Ökat padding */
  box-sizing: border-box;
}

.card-front {
  background-color: #fff;
}

.card-back {
  background-color: #fff;
  transform: rotateY(180deg);
  border: 2px solid #FFCCFD;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 1px;
}

.concept-title {
  font-size: 2.2rem; /* Något större rubrik */
  margin: 0;
  color: #333;
}

.explanation-text {
  font-size: 1.3rem; /* Något större text */
  line-height: 1.6;
  color: #444;
  max-width: 90%;
}

.hint {
  font-size: 0.8rem;
  color: #bbb;
  font-style: italic;
  margin-top: 1rem;
}

/* KONTROLLER */
.controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.counter {
  font-weight: bold;
  color: #555;
  font-size: 1.1rem;
}

.nav-btn {
  background-color: #FFCCFD;
  color: #333;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-family: Arial, sans-serif;
  transition: opacity 0.2s;
  font-size: 1rem;
}

.nav-btn:disabled {
  background-color: #eee;
  color: #aaa;
  cursor: not-allowed;
}

.nav-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.footer-actions {
  margin-top: 1rem;
}

.reset-btn {
  background-color: transparent;
  border: 1px solid #ccc;
  color: #666;
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>