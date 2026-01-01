<template>
  <div class="view-container">
    <h1 class="main-title">Flashcards: Block 4</h1>

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
  { front: "Budgetering", back: "Metod för ekonomisk styrning vilken innebär uppställande och användande av budgetar. Det är en process." },
  { front: "Resultatbudget", back: "Plan för hur intäkter och kostnader för verksamheten leder till ett resultat. Lyckas man skapa vinst?" },
  { front: "Likviditetsbudget", back: "Plan för hur pengar ska anskaffas och användas. Vilka medel som är tillgängliga, vilka medel som betalas in och ut. Uppfattning om likviditeten räcker till." },
  { front: "Budgeterad balansräkning", back: "Visar vilka tillgångar och skulder samt vilket eget kapital ett företag planeras ha vid en viss tidpunkt." },
  { front: "Budget", back: "Uttrycker strävanden, förväntningar och åtaganden för en organisation, gällande ekonomiska konsekvenser för en kommande period." },
  { front: "Strategisk planering", back: "Rör frågor relaterade till verksamhetens inriktning. Långsiktig och präglas av osäkerhet om framtiden." },
  { front: "Taktisk planering", back: "Planera verksamheten så att det som kommit till uttryck i den strategiska planeringen kan förverkligas. Mer detaljerad." },
  { front: "Operativ planering", back: "Handlar om planering av aktiviteter, en planering av hur det löpande arbetet i företaget ska genomföras under den närmast kommande perioden." },
  { front: "Funktionsbudget", back: "Tas primärt fram för att planera verksamheten baserat på de verksamhetsplaner som gäller. Planera verksamheten." },
  { front: "Projektbudget", back: "Planer för de olika projekt som bedrivs i verksamheten." },
  { front: "Produktbudget", back: "Beskriver vad man tänker sig för utfall för olika produkter eller produktgrupper för en kommande period." },
  { front: "Kundbudget/försäljningsbudget", back: "Planer för olika kategorier av kunder." },
  { front: "Resursbudget", back: "Avser exempelvis materialbudget och personalbudget." },
  { front: "Avdelningsbudget", back: "Används främst för att styra olika enheter. Ett instrument för uppföljning av avdelningar. Tas fram för att få insyn i enheten." },
  { front: "Personalbudget", back: "Budgetera personalen i olika kategorier för olika tjänster, kapaciteter i form av manår eller antal timmar, lönekostnader och övriga personalkostnader." },
  { front: "Administrationsbudget", back: "Innehåller sammanställning av de administrativa kostnaderna för verksamheten. Aktiviteter som ligger utanför själva varuflödet." },
  { front: "Inköpsbudget", back: "Underlag för beslut om hur inköpet ska gå till, vilka varor som ska köpas in och till vilket pris." },
  { front: "Lagerbudget", back: "Underlag för lagerhållningen av varor." },
  { front: "Produktionsbudget", back: "Budgetar för själva produktionen och kostnader samt volymer i denna." },
  { front: "Investeringsbudget", back: "Typ av projektbudget, där projektet syftar till att anskaffa något som kommer att bli en del av verksamhetens balansräkning." },
  { front: "Kapitalbudget", back: "Fokuserar på företagets investeringsbehov främst." },
  { front: "Omkostnadsbudget", back: "Man fokuserar på de viktigaste och största omkostnadsposterna." },
  { front: "Uppbyggnadsmetoden", back: "En demokratisk budgeteringsmetod där budgeten skapas nerifrån och upp i organisationen. Istället för att ledningen bestämmer alla siffror, låter man de som är närmast verksamheten ta fram förslagen." },
  { front: "Nedbrytningsmetoden", back: "Den direkta motsatsen till uppbyggnadsmetoden. Här dikteras villkoren uppifrån: ledningen sätter de stora ramarna först, och dessa bryts sedan ner i mindre delar för avdelningarna." },
  { front: "Den iterativa metoden", back: "Den mest realistiska budgeteringsmetoden och fungerar som en gyllene medelväg. Istället för att bara gå nerifrån-upp eller uppifrån-ner, ser man budgeteringen som en dialog som går fram och tillbaka (i cirklar) mellan ledning och avdelningar." },
  { front: "Avvikelseanalys", back: "Processen att jämföra budgeterat resultat med faktiskt utfall för att förstå varför skillnader (avvikelser) uppstått. Målet är att identifiera orsaker (t.ex. pris, volym, effektivitet) till positiva (gynnsamma) eller negativa (ogynnsamma) avvikelser, vilket hjälper till att vidta korrigerande åtgärder, förbättra framtida budgetar och öka ekonomisk kontroll och prestation." },
  { front: "Prognos", back: "En uppdaterad förutsägelse om hur framtiden ser ut, baserad på både faktiska siffror hittills och justerade förväntningar för resten av perioden." },
  { front: "Tröskelpaket", back: "Utgör det som man anser vara absolut nödvändigt för att över huvud taget uppnå det paketet syftar till. En slags miniminivå." },
  { front: "Tilläggspaket", back: "Det som inte är absolut nödvändigt men som av olika anledningar upplevs vara angeläget för verksamheten." },
  { front: "Variabilitetsprincipen", back: "Man relaterar intäkter och kostnader till de faktorer som man antar påverkar deras storlek." }
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
@media (max-width: 700px) {
@media (max-width: 700px) {
  .view-container {
    padding: 0.5rem;
  }
  .main-title {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  .flashcard-scene {
    margin-bottom: 1rem;
    min-height: unset;
    height: auto;
  }
  .flashcard {
    width: 98vw;
    max-width: 340px;
    min-height: 180px;
    font-size: 0.92rem;
    height: auto;
  }
  .card-face {
    padding: 0.7rem 0.3rem;
  }
  .concept-title {
    font-size: 1.1rem;
  }
  .explanation-text {
    font-size: 1rem;
  }
  }
  .controls {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .nav-btn {
    width: 100%;
    padding: 0.7rem 0;
    font-size: 1rem;
  }
  .footer-actions {
    margin-top: 0.5rem;
  }
}
</style>