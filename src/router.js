import { createRouter, createWebHistory } from 'vue-router';



import Quiz1View from './views/Quiz1View.vue';
import Quiz2View from './views/Quiz2View.vue';
import Quiz3View from './views/Quiz3View.vue';
import Quiz4View from './views/Quiz4View.vue';
import Quiz5View from './views/Quiz5View.vue';
import Quiz6View from './views/Quiz6View.vue';
import Quiz7View from './views/Quiz7View.vue';
import Quiz8View from './views/Quiz8View.vue';
import Flashcards1View from './views/Flashcards1View.vue';
import Flashcards2View from './views/Flashcards2View.vue';
import Flashcards3View from './views/Flashcards3View.vue';
import Flashcards4View from './views/Flashcards4View.vue';
import Flashcards5View from './views/Flashcards5View.vue';
import Flashcards6View from './views/Flashcards6View.vue';
import Flashcards7View from './views/Flashcards7View.vue';
import Flashcards8View from './views/Flashcards8View.vue';
import Tentor1View from './views/Tentor1View.vue';
import Tentor2View from './views/Tentor2View.vue';
import Tentor3View from './views/Tentor3View.vue';
import Tentor4View from './views/Tentor4View.vue';
import Ovningar1View from './views/Ovningar1View.vue';
import Ovningar2View from './views/Ovningar2View.vue';
import Ovningar3View from './views/Ovningar3View.vue';
import Ovningar4View from './views/Ovningar4View.vue';
import Ovningar5View from './views/Ovningar5View.vue';

const routes = [
  // { path: '/quiz', component: QuizView },
  { path: '/quiz/1', component: Quiz1View },
  { path: '/quiz/2', component: Quiz2View },
  { path: '/quiz/3', component: Quiz3View },
  { path: '/quiz/4', component: Quiz4View },
  { path: '/quiz/5', component: Quiz5View },
  { path: '/quiz/6', component: Quiz6View },
  { path: '/quiz/7', component: Quiz7View },
  { path: '/quiz/8', component: Quiz8View },
  // { path: '/flashcards', component: FlashcardsView },
  { path: '/flashcards/1', component: Flashcards1View },
  { path: '/flashcards/2', component: Flashcards2View },
  { path: '/flashcards/3', component: Flashcards3View },
  { path: '/flashcards/4', component: Flashcards4View },
  { path: '/flashcards/5', component: Flashcards5View },
  { path: '/flashcards/6', component: Flashcards6View },
  { path: '/flashcards/7', component: Flashcards7View },
  { path: '/flashcards/8', component: Flashcards8View },
  // { path: '/tentor', component: TentorView },
  { path: '/tentor/1', component: Tentor1View },
  { path: '/tentor/2', component: Tentor2View },
  { path: '/tentor/3', component: Tentor3View },
  { path: '/tentor/4', component: Tentor4View },
  // { path: '/ovningar', component: OvningarView },
  { path: '/ovningar/1', component: Ovningar1View },
  { path: '/ovningar/2', component: Ovningar2View },
  { path: '/ovningar/3', component: Ovningar3View },
  { path: '/ovningar/4', component: Ovningar4View },
  { path: '/ovningar/5', component: Ovningar5View },
  { path: '/', component: { template: '<div></div>' } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
