export default {
  // config: {
  //   Title: 'Etat des position de travail',
  //   Context: 'Equipments context',
  //   GroupingCategory: "CFO courant fort",
  //   BIMObjectGroup: "Luminaires",
  //   headers: [
  //     { text: 'Nom', value: 'name', filtrable: true, sortable: true, unit: '', width: "25%" },
  //     { text: 'power', value: 'Power', sortable: false, unit: 'W' },
  //     { text: 'consigne', value: 'Consigne Luminosité', sortable: true, unit: '%' },
  //     { text: 'luminosité', value: 'Luminosité', sortable: true, unit: '%' },
  //   ],
  // },



  //test 1 api spinaltower
  // config: {
  //   contextType: 'équipement',
  //   title: 'Etat des Climatisations',
  //   context: 'Equipments context',
  //   groupingCategory: "CVC chauffage ventillation climatisation",
  //   bimObjectGroup: "Climatisation",
  //   headers: [
  //     { text: 'Nom', value: 'name', sortable: true, unit: '', width: "25%" },
  //     { text: 'CO2', value: 'CO2', sortable: false, unit: '%' },
  //     { text: 'AlarmeCO2', value: 'Alarme CO2', unit: '', isBoolean: true, editBoolean: "Activé/Désactivé", colorBoolean: "red/green", addToCapacityTab: true, filterable: true, sortable: true, },
  //     { text: 'Température', value: 'Température', sortable: true, unit: '°C', filterable: true },
  //     { text: 'Consigne Température', value: 'Consigne Température', sortable: true, unit: '°C', filterable: true },
  //   ],
  //   enableWebSocket: false,
  //   enableCapacityTab: true,
  //   itemPerTable: 10
  // },




  //test2 api spinaltower 
  // config: {
  //   contextType: 'room',
  //   title: 'Etat des Bureaux',
  //   context: 'Space management',
  //   groupingCategory: "Relaxation",
  //   bimObjectGroup: "Salles de massage",
  //   headers: [
  //     { text: 'Nom', value: 'name', sortable: true, unit: '', width: "25%" },
  //     { text: 'Luminosité', value: 'Luminosité', sortable: false, unit: '%' },
  //     { text: 'Occupation', value: 'Occupation', unit: '', isBoolean: true, editBoolean: "Disponible/Indisponible", addToCapacityTab: true, filterable: true, sortable: false, colorBoolean: "green/red" },
  //     { text: 'Température', value: 'Température', sortable: true, unit: '°C' },
  //     { text: 'Consigne De Lumière', value: 'Consigne de lumière', sortable: true, unit: '', isBoolean: true, colorBoolean: "green/red", editBoolean: "Activé/Désactivé", addToCapacityTab: true,filterable: false, },
  //   ],
  //   enableWebSocket: false, 
  //   enableCapacityTab: true,
  //   itemPerTable : 10
  // },


  //configtestcontrolepoint
  // config: {
  //   contextType: 'équipement',
  //   title: 'Etat des Climatisations',
  //   context: 'Equipments context',
  //   groupingCategory: "CVC chauffage ventillation climatisation",
  //   bimObjectGroup: "Climatisation",
  //   headers: [
  //     { text: 'Température', value: 'Température', sortable: true, unit: '', width: "25%" },
  //     { text: 'Hydrometrie', value: 'Hydrometrie', sortable: false, unit: '%' },
  //     { text: 'Présence', value: 'Présence', unit: '', isBoolean: true, editBoolean: "Activé/Désactivé", colorBoolean: "red/green", addToCapacityTab: true, filterable: true, sortable: true, },
  //   ],
  //   isEndPoint : true,
  //   enableWebSocket: false,
  //   enableCapacityTab: false,
  //   itemPerTable: 10
  // },




  // test 3 api ubigreen
  // config: {
  //   contextType: 'équipement',
  //   title: 'Etat des positions de travail',
  //   context: 'Contexte équipement capteur',
  //   groupingCategory: "Ubigreen",
  //   bimObjectGroup: "All",
  //   headers: [
  //         { text: 'Nom', value: 'name', filterable: true, sortable: true, unit: '', width: "25%" }, 
  //         { text: 'Ubigreen', value: 'Ubigreen', sortable: false, unit: '' , isBoolean:true, editBoolean:"Occupé/Disponible",addToCapacityTab:true ,colorBoolean: "red/green"},
  //         { text: 'Statut-Occupation', value: 'Statut-Occupation', sortable: true, unit: '', isBoolean:true, editBoolean:"Occupé/Disponible",addToCapacityTab:true,colorBoolean: "red/green"},
  //       ], 
  //   enableWebSocket: false,
  //   enableCapacityTab: true,
  //   itemPerTable : 10
  // },





 //test 1 api spinaltower endpoint + controleendpoint test 
 config: {
  contextType: 'équipement',
  title: 'Etat des Climatisations',
  context: 'Equipments context',
  groupingCategory: "CVC chauffage ventillation climatisation",
  bimObjectGroup: "Climatisation",
  headers: [
    {text: 'Nom',type:'controle point' , value: 'name', sortable: true, unit: '', width: "25%" },
    { text: 'CO2',type:'controle point' , value: 'CO2', sortable: false, unit: '%' },
    {  text: 'AlarmeCO2',type:'controle point' , value: 'Alarme CO2', unit: '', isBoolean: true, editBoolean: "Activé/Désactivé", colorBoolean: "red/green", addToCapacityTab: true, filterable: true, sortable: true, },
    { text: 'Température',type:'controle point' , value: 'Température', sortable: true, unit: '°C', filterable: true },
    // { text: 'Consigne Température',type:'controle point' , value: 'Consigne Température', sortable: true, unit: '°C', filterable: true },
    { text: 'Température endpoint',  type:'endpoint' , value: 'endpoint/Température', sortable: true, filterable: true , unit:'°C' },
    { text: 'Présence endpoint',  type:'endpoint' , value: 'endpoint/Présence', sortable: true, filterable: true , unit: '', isBoolean: true, editBoolean: "Activé/Désactivé", colorBoolean: "red/green",},
  ],
  enableWebSocket: false,
  enableCapacityTab: true,
},





}