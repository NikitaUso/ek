// ...existing code...
<template>
  <div class="view-container">
    <h1 class="main-title">Flashcards: Block 3</h1>

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
  { front: "Produktkalkyl", back: "Sammanställning av intäkter och/eller kostnader i en viss kalkylsituation för ett visst kalkylobjekt." },
  { front: "Kalkylobjekt", back: "Det är “vad” kalkylen handlar om." },
  { front: "Kalkylsituationer", back: "De olika situationer i en organisation där en kalkyl behövs." },
  { front: "Relevanta ekonomiska konsekvenser", back: "Sådana som aktualiseras i den unika kalkylsituationen." },
  { front: "Kalkylmässiga kostnader", back: "De kostnader som inkluderas i produktkalkyleringen." },
  { front: "Bokföringsmässiga kostnader", back: "De faktiska kostnader som registreras i den externa redovisningen." },
  { front: "Bokföringsmässiga merkostnader", back: "Kostnader som endast finns i den externa redovisningen." },
  { front: "Kalkylmässiga merkostnader", back: "Kostnader som endast finns i kalkyleringen." },
  { front: "Nuanskaffningsvärden", back: "Kostnaden att skaffa en tillgång idag" },
  { front: "Periodisering", back: "Rör behandlingen av poster i tidsdimensionen" },
  { front: "Kapitalkostnader", back: "Består dels av kostnader för förbrukning (avskrivningar) och dels av den ersättning företagets finansiärer kräver på det kapital som de ställt till företagets förfogande, avkastning och räntekostnader." },
  { front: "Självkostnad", back: "Utgör summan av samtliga kostnader för en vara/tjänst/order till dess att den är utförd/fullgjord/levererad och betald." },
  { front: "Fullständig kostnadsfördelning", back: "Alla företagets kostnader allokeras till kalkylobjekt." },
  { front: "Kostnadsställe", back: "Kan utgöras av bla tillverkningsavsnitt, ansvarsområden och avdelningar." },
  { front: "Sysselsättningseffekten", back: "Sysselsättningseffekten är en nackdel med divisionsmetoden eftersom sysselsättningsnivån inte beaktas. Med metoden fördelas samtliga kostnader på verksamhetsvolym oavsett storlek. Det är vanligt att företag har variationer i sin sysselsättning mellan tidsperioder beroende på till exempel konjunktur- och säsongsvariationer." },
  { front: "Övertäckning av fasta kostnader", back: "Uppstår när ett företag producerar och säljer fler enheter än den \"normala\" volymen som ligger till grund för kalkylen, vilket leder till att en större del av de fasta kostnaderna fördelas per enhet och skapar ett överskott." },
  { front: "Undertäckning av fasta kostnader", back: "Företagets faktiska produktions- eller försäljningsvolym är lägre än den normala eller budgeterade volymen, vilket leder till att de fasta kostnaderna inte fullt ut täcks och därmed belastar resultatet tyngre per producerad enhet, och skapar en negativ avvikelse (minus) från vad som planerat i självkostnadskalkylen." },
  { front: "Ekvivalenttal", back: "Ekvivalenttal används för att ta hänsyn till skillnader i resurskrav mellan kalkylobjekt. Ekvivalenttal är vägnings-/relationstal som anger ett kalkylobjekts resursåtgång relativt andra inkluderade kalkylobjekt. Det visar på skillnaden i resursåtgång mellan de olika kalkylobjekten. För att räkna om volym i en enhet." },
  { front: "Ekvivalentvolym", back: "Ekvivalenttal x Volym per objekt" },
  { front: "Särkostnad", back: "Kostnader som orsakas av ett kalkylobjekt i en viss kalkylsituation." },
  { front: "Samkostnad", back: "Kostnader som orsakas gemensamt av två eller fler kalkylobjekt." },
  { front: "Direkt kostnad", back: "Kostnader som påförs kalkylobjekt direkt" },
  { front: "Omkostnad", back: "Kostnader som påförs kalkylobjekt via fördelning" },
  { front: "Pålägg", back: "Den kostnadsdel eller den vinstmarginal som läggs ovanpå en varas eller tjänsts direkta kostnad för att nå försäljningspriset, och det visar hur mycket som ska adderas till inköpspriset för att täcka alla omkostnader och ge önskad vinst, till skillnad från marginal som är vinsten i förhållande till försäljningspriset." },
  { front: "Fördelningsnycklar", back: "Tid, Kvantitet/mängd, Värde" },
  { front: "Tjänsteomkostnader", back: "Kostnader för exempelvis personal & lokaler. De är relaterade till bla stödaktiviteter och tjänsteutveckling." },
  { front: "Differentierade materialomkostnadspålägg", back: "Dela upp materialomkostnaderna i flera omkostnadsposter och använda separata fördelningsnycklar." },
  { front: "Servicekostnadsställen", back: "Utför olika slag av uppgifter åt de direkta kostnadsställena." },
  { front: "Bidrag", back: "Resultatmått, dvs uttrycker skillnaden mellan intäkter, särintäkter och särkostnader." },
  { front: "Täckningsbidrag", back: "Skillnaden mellan särintäkter och särkostnader" },
  { front: "Bidragskrav", back: "Ett förutbestämt mål för hur stort täckningsbidrag en vara/tjänst måste ge för att bidra till att täcka företagets gemensamma samkostnader och vinst." },
  { front: "Stegkalkylen", back: "En utbyggd bidragskalkyl som beräknar täckningsbidrag i flera steg (nivåer). Den sorterar särkostnader på den nivå där de hör hemma – till exempel produkt, produktgrupp eller avdelning. Syftet är att visa hur varje del av verksamheten bidrar till att täcka de gemensamma samkostnaderna och skapa vinst." },
  { front: "Icke-återvinningsbar kostnad", back: "Kostnader för redan anskaffade resurser som inte kan påverkas oavsett vilken beslutssituation företaget befinner sig i." },
  { front: "Alternativkostnad", back: "Speciell typ av särkostnad. Värdet av det man väljer bort när man väljer ett visst handlingsalternativ. Det definieras som det överskott (t.ex. täckningsbidrag) man går miste om från det bästa av de alternativ man tackat nej till. Om en resurs inte har någon alternativ användning är alternativkostnaden noll." },
  { front: "Operationell vinst eller operationell förlust", back: "Det överskott som blir kvar när man dragit av både särkostnader och alternativkostnad från intäkterna. Uppstår när särintäkterna för ett valt handlingsalternativ är lägre än de totala uppoffringarna (summan av särkostnader och alternativkostnad). Det innebär att det alternativ man valde ger ett sämre resultat än om man hade valt det bästa av de bortvalda alternativen." }
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

@media (max-width: 600px) {
  .view-container {
    padding: 0.5rem;
  }
  .main-title {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  .flashcard-scene {
    margin-bottom: 1rem;
  }
  .flashcard {
    width: 98vw;
    max-width: 340px;
    min-height: 180px;
    font-size: 1rem;
  }
  .card-face {
    padding: 1rem 0.5rem;
  }
  .controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  .nav-btn {
    width: 100%;
    padding: 0.7rem 0;
    font-size: 1rem;
  }
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