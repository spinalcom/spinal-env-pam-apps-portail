<template>
    <div ref="el" style="height:100vh;border-radius:12px;overflow:hidden;"></div>
</template>

<script>
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { spinalEventEmitter } from './eventEmitter';
import { layersSources } from "./layers";
import { url } from 'inspector';

const DEFAULT_COLOR = '#888' // fallback si pas de color

export default {
    name: 'MapBats',
    props: {
        infobuilding: { type: Object, default: null },
        buildings: { type: Array, default: () => [] },
        center: { type: Array, default: () => [2.4, 46.6] }, // [lng, lat]
        zoom: { type: Number, default: 14 },
        // ⚠️ Dans le parent, passe :style-url="styleUrl" (kebab-case)
        styleUrl: { type: String, default: 'https://api.maptiler.com/maps/streets/style.json?key=uVQyEUqWhEnCvtHBaPOK' }
    },
    data() {
        return {
            map: null,
            popup: null,          // une seule popup à la fois
            _mapLoaded: false,
            _pendingFocus: null,  // stocke { building, opts } si on appelle focusOn avant le load
            _lastPopupProps: null // props de la dernière pastille ouverte
        }
    },
    mounted() {
        // init map
        this.map = new maplibregl.Map({
            container: this.$refs.el,
            style: this.styleUrl,
            center: this.center,
            zoom: this.zoom
        })

        // add controls to the map
        this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }))
        // setTimeout(() => this.map && this.map.resize(), 0)

        // on load
        this.map.on('load', () => {
            this._mapLoaded = true
            this._addBuildingsLayer()
            this._wireInteractions()

            if (this.buildings.length === 1) {
                // si un seul bâtiment, on y zoom direct
                this.focusOn(this.buildings[0], { zoom: 12 })
            }

            // si un focus a été demandé avant le load
            if (this._pendingFocus) {
                const { building, opts } = this._pendingFocus
                this._pendingFocus = null
                this.focusOn(building, opts)
            }
        })
    },
    beforeDestroy() {
        if (this.popup) { this.popup.remove(); this.popup = null }
        if (this.map) this.map.remove()
    },
    methods: {
        _toNum(v) {
            return v == null ? null : (typeof v === 'string' ? parseFloat(v) : v)
        },

        _buildFeatures(list) {
            return (list || [])
                .map(b => {
                    const lng = this._toNum(b?.location?.lng)
                    const lat = this._toNum(b?.location?.lat)
                    return {
                        type: 'Feature',
                        properties: {
                            id: b.id || '',
                            name: b.name || 'Bâtiment',
                            conso: (b.conso !== undefined && b.conso !== null) ? b.conso : '—',
                            dpe: String(b.dpe || '').toUpperCase(),
                            color: b.color || DEFAULT_COLOR,
                            bosUrl: b.bosUrl || '' // 👈 ajoute l’URL au feature
                        },
                        geometry: { type: 'Point', coordinates: [lng, lat] }
                    }
                })
                .filter(f =>
                    Number.isFinite(f.geometry.coordinates[0]) &&
                    Number.isFinite(f.geometry.coordinates[1])
                )
        },

        _resetLayerSource() {
            const layersSourceIds = ['unclustered', 'cluster-count', 'clusters'];
            for (const source of layersSourceIds) {
                const layer = this.map.getLayer(source);
                if (layer) this.map.removeLayer(source);
            }

            if (this.map.getSource('bats')) this.map.removeSource('bats')
        },

        _addLayers(layerInfo) {
            this.map.addLayer(layerInfo);
        },

        _addBatsSource(features) {
            this.map.addSource('bats', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features },
                cluster: true,
                clusterRadius: 50,
                clusterMaxZoom: 12
            });
        },

        _addBuildingsLayer() {
            const features = this._buildFeatures(this.buildings);

            // reset layers/sources si rechargement
            this._resetLayerSource();
            this._addBatsSource(features);

            for (const key in layersSources) {
                const layerDef = layersSources[key];
                this._addLayers(layerDef);
            }


            // auto-zoom (optionnel)
            if (features.length) {
                const lons = features.map(f => f.geometry.coordinates[0])
                const lats = features.map(f => f.geometry.coordinates[1])
                const west = Math.min(...lons), east = Math.max(...lons)
                const south = Math.min(...lats), north = Math.max(...lats)
                this.map.fitBounds([[west, south], [east, north]], { padding: 60, duration: 600 })
            }
        },

        _wireInteractions() {
            // curseur pointeur sur points/clusters
            const hover = (on) => { this.map.getCanvas().style.cursor = on ? 'pointer' : '' };
            this.map.on('mouseenter', layersSources.unclustered.id, () => hover(true));
            this.map.on('mouseleave', layersSources.cluster.id, () => hover(false));

            // clic sur cluster -> zoom d'expansion
            this.map.on('click', layersSources.cluster.id, (e) => {
                const features = this.map.queryRenderedFeatures(e.point, { layers: [layersSources.cluster.id] })
                const clusterId = features[0].properties.cluster_id
                const src = this.map.getSource(layersSources.cluster.source)
                src.getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err) return
                    const [lng, lat] = features[0].geometry.coordinates
                    this.map.easeTo({ center: [lng, lat], zoom })
                })
            })

            // clic sur pastille -> ouvre la card popup
            this.map.on('click', layersSources.unclustered.id, (e) => {
                const feat = e.features && e.features[0]
                if (!feat) return
                const coords = feat.geometry.coordinates.slice()
                const props = feat.properties || {}
                this._openPopup(coords, props)
            })
        },

        // ---- rendu HTML de la popup intégrant infobuilding ----
        _renderPopupHTML(props) {
            const info = this.infobuilding || null
            const profileName = (info && (info.profileName || info.profilName)) || '—'
            const endpoints = Array.isArray(info?.endpoints) ? info.endpoints : []

            const endpointsHTML = endpoints.length
                ? `
        <div style="margin-top:10px;">
          <div style="font-weight:600; font-size:13px; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${props.color || DEFAULT_COLOR};"></span>
            <span>Profil&nbsp;: ${profileName}</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr auto; gap:6px 12px; font-size:13px;">
            ${endpoints.map(ep => `
              <div style="opacity:.85;">${ep.name || '—'}</div>
              <div style="text-align:right;"><strong>${Number.isFinite(ep.currentValue) ? Number(ep.currentValue).toFixed(2) : (ep.currentValue ?? '—')}</strong> ${ep.unit || ''}</div>
            `).join('')}
          </div>
        </div>
      `
                : `
        <div style="margin-top:10px; font-size:13px; opacity:.75;">
          Aucune donnée de profil disponible.
        </div>
      `

            return `
      <div class="map-card" style="
        position:relative; min-width:260px; max-width:340px;
        background:#fff; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.2);
        padding:14px 16px 12px 16px; font-family:Inter,system-ui,Arial,sans-serif;
      ">
        <button class="map-card-close" title="Fermer" style="
          position:absolute; right:8px; top:8px; border:none; background:transparent;
          font-size:18px; line-height:1; cursor:pointer;
        ">&times;</button>
  
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
          <span style="
            display:inline-block; width:12px; height:12px; border-radius:50%;
            background:${props.color || DEFAULT_COLOR}; flex:0 0 auto;
            box-shadow:0 0 0 2px #222 inset;
          "></span>
          <div style="font-weight:600; font-size:15px;">${props.name || 'Bâtiment'}</div>
        </div>
  
        
  
        ${endpointsHTML}
  
        <div style="margin-top:12px; display:flex; gap:8px;">
          <button class="map-card-open-space" 
            style="
              appearance:none; border:none; padding:8px 10px;
              border-radius:10px; background:${props.color || '#3498DB'}; 
              color:#fff; font-weight:600; cursor:pointer;
              box-shadow:0 2px 0 rgba(0,0,0,.15);
            ">
            Accéder au bâtiment
          </button>
        </div>

    </div>`
        },

        _attachPopupEvents() {
            if (!this.popup) return
            const popupEl = this.popup.getElement()
            const closeBtn = popupEl.querySelector('.map-card-close')
            const openBtn = popupEl.querySelector('.map-card-open-space')

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (this.popup) {
                        this.$emit('closedPopup');
                        this.popup.remove(); this.popup = null
                    }
                })
            }

            if (openBtn) {
                openBtn.addEventListener('click', (e) => {
                    e.stopPropagation() // évite que la map capte le clic
                    const url = openBtn.getAttribute('data-url')
                    if (url && /^https?:\/\//i.test(url)) {
                        window.open(url, '_blank') // ouvre dans un nouvel onglet
                    } else {
                        const id = openBtn.getAttribute('data-id')
                        this.$emit('openSpace', id)
                    }
                })
            }
        },

        async _openPopup([lng, lat], props) {
            // ferme l’ancienne si existe
            if (this.popup) { this.popup.remove(); this.popup = null }



            this._lastPopupProps = props

            this.$emit('clickedVignette', props)

            this.popup = new maplibregl.Popup({
                closeButton: false, // on gère notre bouton
                closeOnClick: true, // cliquer ailleurs ferme
                anchor: 'bottom',
                offset: 12,
                maxWidth: '340px'
            });


            this.popup.on('open', async () => {
                const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                await wait(100); // petit délai pour s'assurer que le DOM est prêt
                const buttons = this.popup.getElement().getElementsByClassName('map-card-open-space');
                if (buttons && buttons.length > 0) {
                    buttons[0].addEventListener('click', () => {
                        // openBosConfig(props);
                        this.$emit('openBosConfig', props);

                    });
                }
            });

            this.popup
                .setLngLat([lng, lat])
                .setHTML(this._renderPopupHTML(props))
                .addTo(this.map)

            this._attachPopupEvents()



            // await new Promise((resolve, reject) => {
            //     setTimeout(() => {
            //         resolve();
            //     }, 500)
            // });





        },

        /**
        * 👇 API publique pour le parent
        * Centre/zoome sur un building et ouvre la popup correspondante.
        * @param {Object} building - objet building (location.lat/lng requis)
        * @param {Object} opts - options { zoom?: number }
        */
        focusOn(building, opts = {}) {
            // si pas prêt, on met en attente
            if (!this.map || !this._mapLoaded) {
                this._pendingFocus = { building, opts }
                return
            }
            const lng = this._toNum(building?.location?.lng)
            const lat = this._toNum(building?.location?.lat)
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return

            const zoomTarget = typeof opts.zoom === 'number'
                ? opts.zoom
                : Math.max(this.map.getZoom(), 13) // défaut : au moins 13

            // centre + zoom
            this.map.easeTo({ center: [lng, lat], zoom: zoomTarget, duration: 500 })

            // ouvre la même popup que pour un clic sur la pastille
            const props = {
                ...building,
                id: building.id || '',
                name: building.name || 'Bâtiment',
                dpe: String(building.dpe || '').toUpperCase(),
                conso: (building.conso !== undefined && building.conso !== null) ? building.conso : '—',
                color: building.color || DEFAULT_COLOR,
                bosUrl: building.bosUrl || '', // 👈 passe l’URL à la popup
            }
            this._openPopup([lng, lat], props)
        },
    },

    watch: {
        // mise à jour des points (y compris couleur) en direct
        buildings: {
            deep: true,
            handler(val) {
                if (!this.map || !this.map.isStyleLoaded()) return
                const features = this._buildFeatures(val)
                const src = this.map.getSource('bats')
                if (src) src.setData({ type: 'FeatureCollection', features })
            }
        },

        // ➜ rafraîchit le contenu de la popup avec les nouveaux endpoints
        infobuilding: {
            deep: true,
            handler() {
                if (this.popup && this._lastPopupProps) {
                    this.popup.setHTML(this._renderPopupHTML(this._lastPopupProps))
                    this._attachPopupEvents()
                }
            }
        }
    }
}

</script>