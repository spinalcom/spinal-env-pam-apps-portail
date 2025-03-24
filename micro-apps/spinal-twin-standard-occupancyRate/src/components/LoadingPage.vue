<template>
  <div class="loading-overlay">
   <!--  <img src="../assets/logo/spinalcom.png" alt="Logo" class="logo" />
    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" class="logo" /> -->
    <div class="loader"></div>
    <p>Chargement des données...</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingPage'
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8); 
  z-index: 9999; 
}

.loader {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  margin-top: 20px;
  font-family: 'Charlevoix Pro', sans-serif;
  font-size: 18px;
  color: #333;
}

.logo {
  width: 150px; /* Ajustez la taille du logo selon vos besoins */
  margin-bottom: 20px; /* Espace entre le logo et le loader */
}
</style>