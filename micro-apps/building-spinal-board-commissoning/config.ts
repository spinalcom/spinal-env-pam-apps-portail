import { IConfig } from "./src/interfaces/IConfig";


// export const  config: IConfig = {
//     context: 'Gestion des équipements',
//     category: 'Typologie',
//     groupEquipement: 'Multicapteurs',
//     profileName: 'multicapteur commisonning',
//     attributs: {
//         categoryAttribute: 'GTB',
//         label: 'convention nommage',
//         conventionName: /^AUT-\d{3}-MCA-\d{3}$/
//     },
//     sources : [
//         {
//             name: 'Taux de disponibilité',
//             unit: '%',
//         },
//         {
//             name: 'Taux de données en défaut reçues',
//             unit: '%',
//         },
//         {
//             name: 'Taux de données exploitables',
//             unit: '%',
//         }
//     ]


// }


export const  config: IConfig = {
    entryPoint:{
        context: "Gestion des équipements",
        category: "Typologie",
        group: "Multicapteurs",
        type: "equipement" // | equipments
    },
    sources:[
        {
            id: 1,
            type: "attribute",
            categoryName: "GTB",
            name: "Convention nommage",
            unit: "",
            
        },
        {
            id: 2,
            type: "controlPoint",
            profileName: "multicapteur commisonning",
            name: "Taux de disponibilité",
            unit: "%",
            legend: {
                min: { value: 0, color: "#24CBD9" },
                median: { value: 50, color: "#2077CE" },
                max: { value: 100, color: "#112C9D" },
            },
        },
        {
            id: 3,
            type: "controlPoint",
            profileName: "multicapteur commisonning",
            name: "Taux de données en défaut reçues",
            unit: "%",
            legend:{
                min: { value: 0, color: "#24CBD9" },
                median: { value: 50, color: "#2077CE" },
                max: { value: 100, color: "#112C9D" },
            }
        },
        {
            id: 4,
            type: "controlPoint",
            profileName: "multicapteur commisonning",
            name: "Taux de données exploitables",
            unit: "%",
            legend:{
                min: { value: 0, color: "#24CBD9" },
                median: { value: 50, color: "#2077CE" },
                max: { value: 100, color: "#112C9D" },
            }
        }
    ],
    bilan: {
        timeline: {
            sourceId: 1,
            setup:{
                type: "regex",
                config: [
                    { name: 'correspond', value:  /^AUT-\d{3}-MCA-\d{3}$/, color: '#14202C', label: "Convention de nommage" , type: "success"},
                    { name: 'incorrect', value:  /^AUT-\d{3}-MCA-\d{3}$/, color: '#FF000B', label: "Convention de nommage", type: "warning" },
                    { name: 'non défini', value:  /^AUT-\d{3}-MCA-\d{3}$/, color: '#9830F2', label: "Convention de nommage", type: "missing" },
                    { name: 'double', value:  /^AUT-\d{3}-MCA-\d{3}$/, color: '#EF8BC5', label: "Convention de nommage", type: "dual" },



                ]
            }
        },
        dotsGrid: {
            sourceId: 4,
            setup:{
                type: "threshold_below",
                config: [
                    {name: 'max', value: 70, color: "#24CBD9", label: "Taux de données exploitables", type: '' },
                ] // tu isoles ceux undefined et ceux <70
            }
        }

    }
}