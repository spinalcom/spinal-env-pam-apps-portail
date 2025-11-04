import { url } from "inspector";

const DEFAULT_COLOR = '#888';

export const layersSources = {
    cluster: {
        id: 'clusters',
        type: 'circle',
        source: 'bats',
        filter: ['has', 'point_count'],
        paint: {
            'circle-radius': ['step', ['get', 'point_count'], 14, 20, 18, 100, 24],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#222',
            'circle-color': '#ddd'
        }
    },

    clusterCount: {
        id: 'cluster-count', type: 'symbol', source: 'bats',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 }
    },

    unclustered: {
        id: 'unclustered',
        type: 'circle',
        source: 'bats',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': 7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#222',
            'circle-color': ['coalesce', ['get', 'color'], DEFAULT_COLOR]
        }
    }
}

export default layersSources;