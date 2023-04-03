module.exports = {
    title: "Consommation d'énergie",
    chart: 'bar',
    unit: 'Kw',
    label: 'Energie globale',
    name: 'Energie globale',
    color: '#14202c',
    todayTitle: 'today',
    averageTitle: 'Consommation moyenne',
    totalTitle: 'Consommation totale',
    subtitle: 'today',
    todaySubtitle: 'today',
    averageSubtitle: '',
    totalSubtitle: 'TOTAL SUBTITLE',
    controlEndpoints: [
        {
            label: 'Energie globale',
            name: 'Energie globale',
            color: '#14202c',
            unit: 'kWh',
            stackGroup: '0',
            title: 'd\'énergie consommés',
            todayTitle: 'today',
            averageTitle: 'Consommation moyenne',
            totalTitle: 'TOTAL TITLE',
            subtitle: 'today',
            todaySubtitle: 'today',
            averageSubtitle: '',
            totalSubtitle: 'TOTAL SUBTITLE',
            root: true,
        }
    ],
    
    cards: ['total', 'permeter', 'today'], // ['total', 'average', 'permeter', 'today']
};

// "water": "Eau globale",
// "sanitary_water": "Eau sanitaire",
// "people_number": "Nombre de personnes",
// "energy": "Energie globale",
// "lighting": "Eclairage",
// "heating": "Chauffage"