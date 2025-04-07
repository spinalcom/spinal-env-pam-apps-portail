import { IConfig } from "./src/interfaces/IConfig";

export const config: IConfig = {
    entryPoint: {
        context: "Synchronisation équipements GMAO",
        category: "CFO",
        group: "Luminaires",
        type: "equipement" // | equipments
    },
    sources: [
        {
            id: 1,
            type: "attribute",
            categoryName: "GMAO",
            name: "LO_Nom_Référence",
            unit: "",

        },

    ],
    bilan: {
        timeline: {
            sourceId: 1,
            setup: {
                type: "regex",
                // value: /^[A-Za-z]{3,4}-[A-Za-z]\d{3,4}$/,
                value: "^ECLF-[A-Za-z]\\d{4}$",
                legend: [
                    { name: 'correspond', color: 'green',  type: "success" },
                    { name: 'doublons', color: 'purple', type: "dual" },
                    { name: 'incorrect', color: 'red', type: "warning" },
                    { name: 'non défini', color: 'pink', type: "missing" },
                ]
            }
        },
        // dotsGrid: {
        //     sourceId: 4,
        //     setup: {
        //         type: "threshold_below",
        //         value: 70,
        //     }
        // }

    }
}