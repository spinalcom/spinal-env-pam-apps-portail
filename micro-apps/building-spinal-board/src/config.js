

export default {
    config: {
      
          lighting : {
            title: 'Consommation d\'électricité éclairage',
            label: 'Consommation',
            labelIndicators:"consommée",
            buildingApiUrl: "Eclairage",
            floorApiUrl: "Eclairage",
            unit: "kWh",
            color:'#14202c',
          },
          sanitary_water: {
            title: 'Consommation d\'eau sanitaire',
            label: 'Consommation',
            labelIndicators:"consommée",
            buildingApiUrl: "Eau globale",
            floorApiUrl: "Eau sanitaire",
            unit:'L',
            color:'#14202c',
          }

       

          
          
          // title: 'Consommation Eau globale',
          // label: 'Consommation',
          // labelIndicators:"consommés",
        // buildingApiUrl: "Eau globale",
        // floorApiUrl: "Eau sanitaire",
        // unit:'L',
        // color:'#14202c',
        
      },
      // exemple: {
        //   title: 'Consommation d\'eau sanitaire',
        //   label: 'Consommation',
    //   labelIndicators:"consommé",
    //   apiUrl: 'Eau globale',
    //   unit:'L',
    // },
  }
