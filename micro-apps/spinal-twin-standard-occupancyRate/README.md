#  Gestion des Occupations dans les Bâtiments

## **Introduction** 

Ce projet vise à afficher **le taux d'occupation en temps réel** d'un bâtiment, des salles de réunion et des équipements (postes de travail).  
Les données sont récupérées via des **appels API** et affichées sous forme de **graphiques** avec **Vue.js** et **Chart.js**.

---

## **🔹 Taux d'Occupation du Bâtiment**

### **Étapes Principales**
1. **Récupération des Dynamic IDs**  
   🔹 `getGraphData()` récupère le `dynamicId` du `control_endpoint` lié au taux d'occupation du bâtiment.  
2. **Récupération des Données**  
   🔹 `getGraphData()` est appelé dans `getData()` pour récupérer les informations.  
   🔹 Utilisation de **timeseries** pour obtenir l'évolution des données dans le temps.

---

## **🔹 Taux d'Occupation des Salles de Réunion**

### **Étapes Principales**
1. **Récupération des Dynamic IDs**  
   🔹 `fetchSecondChartOccupationDynamicIds()` récupère les `dynamicIds` des salles.  
   🔹 Il utilise `roomIds`, obtenus via `getRoomIds()`.  
2. **Récupération des Room IDs**  
   🔹 `getRoomIds()` identifie les salles à partir de leur **contexte, catégorie et groupe** (`getContextId()`, `getCategoryId()`, `getGroupId()`).  
3. **Récupération des Données**  
   🔹 Utilisation de **timeseries** pour suivre l'évolution des taux d'occupation.

---

## **🔹 Taux d'Occupation des Équipements**

### **Étapes Principales**
1. **Récupération des IDs**  
   🔹 Récupération des **contextID, categoryID, groupID et equipment IDs**.  
   🔹 `fetchThirdChartOccupationDynamicIds()` obtient les `dynamicIDs` des équipements.  
2. **Récupération des Données**  
   🔹 Utilisation de **timeseries** pour suivre l'évolution des données.

---

## **🔹 Taux d'Occupation du Bâtiment par Étages**

  `FloorOccupancyDetail.vue`

### **Étapes Principales**
1. **Récupération des Dynamic IDs**  
   🔹 `getFloorOccupancyDynamicIds()` récupère les `dynamicIDs` du taux d'occupation par étage.  
2. **Récupération des Données**  
   🔹 `getFloorOccupancyRatesByPeriod()` récupère les taux d'occupation à différentes périodes.

---

## **🔹 Taux d'Occupation des Salles de Réunion par Étages**

 `index.js`

### **Étapes Principales**
1. **Récupération des Room IDs**  
   🔹 `getRoomIds()` récupère les IDs des salles de réunion.  
   🔹 `getRoomPositions()` récupère leurs positions dans le bâtiment.  
2. **Regroupement par Étages**  
   🔹 `groupSecondChartsByFloor()` classe les salles selon leur étage.  
3. **Récupération des Dynamic IDs**  
   🔹 `fetchSecondChartOccupationDynamicIds()` récupère les `dynamicIDs`.  
4. **Récupération des Données**  
   🔹 `getSecondChartOccupancyDataByFloor()` extrait les taux d'occupation par étage.

---

## **🔹 Taux d'Occupation des Équipements par Étages**

 `index.js`

### **Étapes Principales**
1. **Récupération des IDs**  
   🔹 `getThirdChartIds()` récupère la liste des équipements.  
   🔹 `getThirdChartPositions()` récupère leurs emplacements.  
2. **Regroupement par Étages**  
   🔹 `groupThirdChartsByFloor()` classe les équipements selon leur étage.  
3. **Récupération des Dynamic IDs**  
   🔹 `getThirdChartOccupationDynamicIdsByFloor()` récupère les `dynamicIDs`.  
4. **Récupération des Données**  
   🔹 `getThirdChartOccupancyDataByFloor()` récupère les taux d'occupation par étage.

---

## ** Autres Fonctions Utilisées**

- `fetchTotalSurface()` → Récupère la **surface totale** du bâtiment.  
- `fetchTotalSurface2()` → Récupère la **surface totale** des salles de réunion.  
- `fetchThirdChartTotalCount()` → Récupère le **nombre total d'équipements**.

---

## ** Conclusion**

Cette documentation décrit **les principales étapes et fonctions** utilisées pour **récupérer et afficher** les taux d'occupation en temps réel.  
Les données sont traitées via **API**, puis affichées dans des **graphiques interactifs** pour une meilleure visualisation.
