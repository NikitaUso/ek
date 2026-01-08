
<script setup>
import { ref } from 'vue';
const openDropdown = ref(null);
let closeTimeout = null;

function handleMouseEnter(name) {
  if (closeTimeout) clearTimeout(closeTimeout);
  openDropdown.value = name;
}
function handleMouseLeave() {
  closeTimeout = setTimeout(() => {
    openDropdown.value = null;
  }, 600); // 600ms delay before closing
}
</script>

<template>
  <div class="app-container">
    <header class="navbar">
      <nav class="nav-content">
        <div class="logo">Styrning</div>
        <ul class="nav-links">
          <li class="dropdown"
              @mouseenter="handleMouseEnter('quiz')"
              @mouseleave="handleMouseLeave"
              :class="{ open: openDropdown === 'quiz' }">
            <span class="dropbtn" style="cursor: default; color: #111;">Quiz</span>
            <div class="dropdown-content" v-show="openDropdown === 'quiz'">
              <router-link
                v-for="n in [1,2,3,4,6,7,8]"
                :key="n"
                :to="`/quiz/${n}`"
                :style="{
                  'text-decoration': 'none',
                  color: '#111',
                  'background-color':
                    n === 1 ? '#FFD6EA' :
                    n === 2 ? '#FFF7CC' :
                    n === 3 ? '#D6F5D6' :
                    n === 4 ? '#E3D6F5' :
                    n === 6 ? '#D6E9F5' :
                    n === 7 ? '#ffd5d5' :
                    n === 8 ? '#ffe6fa' :
                    '#fff',
                }"
              >Quiz Block {{ n }}</router-link>
            </div>
          </li>
          <li class="dropdown"
              @mouseenter="handleMouseEnter('flashcards')"
              @mouseleave="handleMouseLeave"
              :class="{ open: openDropdown === 'flashcards' }">
            <span class="dropbtn" style="cursor: default; color: #111;">Flashcards</span>
            <div class="dropdown-content" v-show="openDropdown === 'flashcards'">
              <router-link
                v-for="n in [1,2,3,4,6,7,8]"
                :key="n"
                :to="`/flashcards/${n}`"
                :style="{
                  'text-decoration': 'none',
                  color: '#111',
                  'background-color':
                    n === 1 ? '#FFD6EA' :
                    n === 2 ? '#FFF7CC' :
                    n === 3 ? '#D6F5D6' :
                    n === 4 ? '#E3D6F5' :
                    n === 6 ? '#D6E9F5' :
                    n === 7 ? '#ffd5d5' :
                    n === 8 ? '#ffe6fa' :
                    '#fff',
                }"
              >Flashcards Block {{ n }}</router-link>
            </div>
          </li>
          <li class="dropdown"
              @mouseenter="handleMouseEnter('verktyg')"
              @mouseleave="handleMouseLeave"
              :class="{ open: openDropdown === 'verktyg' }">
            <span class="dropbtn" style="cursor: default; color: #111;">Verktyg</span>
            <div class="dropdown-content" v-show="openDropdown === 'verktyg'">
              <router-link :to="'/tentor/1'" style="text-decoration: none; color: #111;">Resultatplanering</router-link>
              <router-link :to="'/tentor/2'" style="text-decoration: none; color: #111;">Formelsamling</router-link>
              <router-link :to="'/tentor/3'" style="text-decoration: none; color: #111;">Korsord</router-link>
              <router-link :to="'/tentor/4'" style="text-decoration: none; color: #111;">Verktyg 4</router-link>
            </div>
          </li>
          <li class="dropdown"
              @mouseenter="handleMouseEnter('ovningar')"
              @mouseleave="handleMouseLeave"
              :class="{ open: openDropdown === 'ovningar' }">
            <span class="dropbtn" style="cursor: default; color: #111;">Övningar</span>
            <div class="dropdown-content" v-show="openDropdown === 'ovningar'">
              <router-link :to="'/ovningar/1'" style="text-decoration: none; color: #111;">Resultatplanering & Nollpunkt</router-link>
              <router-link :to="'/ovningar/2'" style="text-decoration: none; color: #111;">Diskontering</router-link>
              <router-link :to="'/ovningar/3'" style="text-decoration: none; color: #111;">Investeringskalkylering</router-link>
              <router-link :to="'/ovningar/4'" style="text-decoration: none; color: #111;">Budgetering</router-link>
              <router-link :to="'/ovningar/5'" style="text-decoration: none; color: #111;">Pålägg & TB</router-link>
            </div>
          </li>
        </ul>
        <ul class="nav-links">
          <li>
            <router-link to="/genererade-tentor" class="dropbtn" style="display: inline-block; text-align: center; text-decoration: none;">Genererade tentor</router-link>
          </li>
        </ul>
      </nav>
    </header>
    <main class="content-area">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Nollställer allt för att garantera att sidan är vit och når kanterna */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background-color: #ffffff !important;
  font-family: 'Segoe UI', Arial, sans-serif;
  width: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Navbar centrerad högst upp */
.navbar {
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  padding: 1.5rem 0;
  display: flex;
  justify-content: center;
  background-color: #ffffff;
}

.nav-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem; /* Avstånd mellan texten "Styrning" och knapparna */
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.nav-links {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

/* --- Huvudmenyns knappar med din färg --- */
.dropbtn {
  background-color: #FFCCFD; /* Din färg */
  color: #000000; /* Vit text för bra kontrast */
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-width: 130px;
  transition: background-color 0.2s ease;
}

.dropbtn:hover {
  background-color: #FDF0FF; /* Lite mörkare vid hover */
}

.dropdown {
  position: relative;
}

/* Dropdown-menyn */

/* Dropdown utan punkter */
.dropdown-content {
  display: none;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  min-width: 150px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  z-index: 100;
  margin-top: 5px;
  border-radius: 4px;
  list-style: none;
  padding: 0; 
}
.dropdown.open .dropdown-content {
  display: block;
  animation: dropdown-fadein 0.2s;
}
@keyframes dropdown-fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dropdown-content a {
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  font-size: 0.95rem;
  text-align: center;
}

.dropdown-content a:hover {
  background-color: #f8f9fa;
  color: rgba(37, 150, 190);
}

.content-area {
  text-align: center;
  margin-top: 4rem;
}
</style>

<style>
@media (max-width: 600px) {
  .navbar {
    padding: 0.5rem 0;
  }
  .nav-content {
    gap: 0.5rem;
  }
  .logo {
    font-size: 1.2rem;
    letter-spacing: 1px;
  }
  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
    width: 100vw;
    align-items: stretch;
  }
  .dropbtn {
    font-size: 0.95rem;
    padding: 0.6rem 1rem;
    min-width: 100px;
    width: 100%;
    box-sizing: border-box;
  }
  .dropdown-content {
    min-width: 100vw;
    left: 0;
    transform: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0px 4px 12px rgba(0,0,0,0.08);
  }
  .dropdown-content a {
    font-size: 1rem;
    padding: 10px 8px;
  }
  .content-area {
    margin-top: 2.5rem;
    padding: 0.5rem;
  }
}
</style>