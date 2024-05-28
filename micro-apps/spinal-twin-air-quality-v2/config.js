module.exports = {
    title: 'Qualité de l\'air',
    fileName: 'Qualité de l\'air',
    columnName: 'Niveau CO2',
    unit: 'ppm',
    controlEndpoint: 'Dioxyde de carbone',
    // the min is <=
    // the max is >
    level: [
        {
            name: 'Niveau correct',
            color: '#11eda9',
            interval: {
                min: -Infinity, // <=
                max: 600 // >
            }
        },
        {
            name: 'Modéré',
            color: '#ffe600',
            interval: {
                min: 600, // <=
                max: 1200 // >
            }
        },
        {
            name: 'Pas sain',
            color: '#ffa400',
            interval: {
                min: 1200, // <=
                max: 5000 // >
            }
        },
        {
            name: 'Hasardeux',
            color: '#ff000b',
            interval: {
                min: 5000, // <=
                max: Infinity // >
            }
        }
    ]
};

// module.exports = {
//     title: 'Température',
//     fileName: 'Température',
//     columnName: 'Degré de température',
//     unit: '°C',
//     controlEndpoint: 'Température',
//     source: {
//         type: 'controlEndpoint', // [controlEndpoint, endpoint]
//         Name: 'Température',
//         profile: 'Control Point'
//     },
//     // [min, max[
//     level: [
//         {
//             name: 'Trop froid',
//             color: '#3177e0',
//             interval: {
//                 min: -Infinity, // >=
//                 max: 10 // <
//             }
//         },
//         {
//             name: 'Niveau correct',
//             color: '#11eda9',
//             interval: {
//                 min: 10, // >=
//                 max: 27 // <
//             }
//         },
//         {
//             name: 'Trop chaud',
//             color: '#ff000b',
//             interval: {
//                 min: 27, // >=
//                 max: Infinity // <
//             }
//         }
//     ]
// };