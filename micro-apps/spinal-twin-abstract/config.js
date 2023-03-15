module.exports = {
    title: "Consommation d'énergie",
    chart: 'bar',
    unit: 'Kw',
    controlEndpoints: [
        {
            label: 'Energie globale',
            name: 'Energie globale',
            color: '#14202c',
            unit: 'Kw',
        },
        {
            label: 'Eclairage',
            name: 'Eclairage',
            color: '#E8D712',
            unit: 'Kw',
        },
        {
            label: 'Chauffage',
            name: 'Chauffage',
            color: '#5444ae',
            unit: 'Kw',
        }
    ],
    cards: [
        {
            type: 'total',
            compare: true
        },
        {
            type: 'average',
            compare: true
        },
        {
            type: 'today',
            compare: false
        }
    ]
};

// "water": "Eau globale",
// "sanitary_water": "Eau sanitaire",
// "people_number": "Nombre de personnes",
// "energy": "Energie globale",
// "lighting": "Eclairage",
// "heating": "Chauffage"