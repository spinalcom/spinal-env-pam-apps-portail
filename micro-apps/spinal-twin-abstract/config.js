module.exports = {
    title: "Consommation d'énergie",
    chart: 'bar',
    unit: 'Kw',
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
            totalTitle: 'Consommation totale',
            subtitle: 'today',
            todaySubtitle: 'today',
            averageSubtitle: '',
            totalSubtitle: 'TOTAL SUBTITLE',
            root: true,
        },
        {
            label: 'Eclairage',
            name: 'Eclairage',
            color: '#E8D712',
            unit: 'kWh',
            stackGroup: '01',
            title: 'd\'éclairage consommée',
            todayTitle: 'today',
            averageTitle: 'AVERAGE TEXT',
            totalTitle: 'TOTAL TEXT',
            subtitle: 'par rapport a l\'énergie globale',
            todaySubtitle: 'today',
            averageSubtitle: '',
            totalSubtitle: 'TOTAL SUBTITLE',
            root: false,
        },
        
    ],
    
    cards: ['total', 'average', 'today'], // ['total', 'average', 'today']
};

// "water": "Eau globale",
// "sanitary_water": "Eau sanitaire",
// "people_number": "Nombre de personnes",
// "energy": "Energie globale",
// "lighting": "Eclairage",
// "heating": "Chauffage"