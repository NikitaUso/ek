<template>
  <div class="view-container">
    <h1 class="main-title">Flashcards: Block 2</h1>

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
  { front: "Rörliga kostnader", back: "En kostnad vars totalsumma förändras kontinuerligt när verksamhetsvolymen förändras." },
  { front: "Fasta kostnader", back: "En kostnad vars totalsumma är oförändrad när verksamhetsvolymen förändras." },
  { front: "Verksamhetsvolym", back: "Oftast ett uttryck för företagets output, ex antalet producerade enheter." },
  { front: "Aktiviteter", back: "Olika slag av arbetsmoment." },
  { front: "Kostnadsdrivare", back: "Vad som driver på kostnaden." },
  { front: "Resultatplanering", back: "Studerar samband mellan intäkter, rörliga kostnader, fasta kostnader och volym." },
  { front: "Totalkostnad", back: "Summan av den rörliga och den fasta kostnaden." },
  { front: "Kritisk punkt (nollpunkt)", back: "Anger vid vilken volym och vid vilken total intäkt resultatet är 0 kr. Består av den kritiska volymen och den kritiska intäkten." },
  { front: "Säkerhetsmarginal", back: "Skillnaden mellan faktiska volymen och den kritiska volymen alt skillnaden mellan den faktiska intäkten och den kritiska totala intäkten." },
  { front: "Bidragsanalys", back: "Enklare variant av resultatplanering. Tittar på särintäkter och särkostnader för att beräkna täckningsbidrag." },
  { front: "Bidragslinje", back: "Linje som anger skillnaden mellan intäkter och rörliga kostnader vid olika volymer." },
  { front: "Täckningsgrad", back: "Anger hur stort täckningsbidraget är per styck eller totalt i förhållande till priset per styck respektive den totala intäkten. Det bidrag varje försäljningskrona ger i procent." }
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