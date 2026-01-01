<template>
  <div class="view-container">
    <h1>Tentor</h1>
    <nav class="sub-menu sub-menu-top">
      <a v-for="n in 4" :key="n" :href="'#'">Tentor {{ n }}</a>
    </nav>
    <slot />
  </div>
</template>

<script setup>
</script>

<style scoped>
.view-container { padding: 2rem; text-align: center; }
.sub-menu { margin: 2rem 0; display: flex; justify-content: center; gap: 1.5rem; }
.sub-menu a { color: #111; font-weight: 600; text-decoration: none; padding: 0.5rem 1.2rem; border-radius: 4px; transition: background 0.2s; }
.sub-menu a:hover { background: #f2f2f2; color: #111; }
.sub-menu-top { margin-top: 0.5rem; margin-bottom: 2rem; }
</style>
