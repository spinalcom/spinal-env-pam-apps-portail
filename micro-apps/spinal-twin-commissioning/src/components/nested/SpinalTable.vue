<template>
  <div style="width: 100%; height: 100%;">
    <v-data-table
    style="height: 100%"
    mobile-breakpoint="0"
    :headers="headers"
    :items="context"
    :items-per-page="15"
    fixed-header
    :footer-props="{
    'items-per-page-text':'Lignes par page',
    'page-text': '',
    'items-per-page-all-text': 'Toutes'
  }"
  >
  <template v-slot:[`item.floor`]="{ item }">
    <div class="font-table">{{item.floor}}</div>
  </template>
  <template v-slot:[`item.name`]="{ item }">
    <div class="font-table">{{item.name}}</div>
  </template>
  <template v-slot:[`item.monitorability`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="thresholdColor(item.monitorabilityValue)" :text="checkMonitorability(item.monitorability)"/>
  </template>
  <template v-slot:[`item.actionable`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="positiveColor(item.actionable, 70)" :text="(typeof item.actionable!=='undefined')? parseInt(item.actionable.toFixed(0)) +'%': 'indéfini' " />
  </template>
  <template v-slot:[`item.default`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="negativeColor(item.default, 30)" :text="(typeof item.default!=='undefined')? parseInt(item.default.toFixed(0)) +'%': 'indéfini'"/>
  </template>
  <template v-slot:[`item.availability`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="positiveColor(item.availability, 70)" :text="(typeof item.availability!=='undefined')? parseInt(item.availability.toFixed(0)) +'%': 'indéfini'"/>
  </template>
</v-data-table>
  </div>
</template>


<script>
import SmallLegend from './SmallLegend.vue';
export default {
  components: {
    SmallLegend,
  },
  props: ['context'],
  data: () => ({
    headers: [
      // {
      //   text: 'Etage',
      //   align: 'start',
      //   sortable: false,
      //   value: 'floor',
      // },
      { text: 'Etage', value: 'floor', align: 'center' },
      { text: 'Nom', value: 'name' },
      { text: 'Convention de nommage', value: 'monitorability' },
      { text: 'Taux de données reçues', value: 'actionable' },
      { text: 'Taux de données en défaut reçues', value: 'default' },
      { text: 'Taux de disponibilité', value: 'availability' },
    ],
  //   context: [
  // {
  //   "dynamicId": 56462816,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288746]",
  //   "naming": 23.63558589467181,
  //   "default": 97.52454541037936,
  //   "availability": 90.63526454349034,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1458660736,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288797]",
  //   "naming": 98.12129951696174,
  //   "default": 65.61625262640949,
  //   "availability": 86.42879648955018,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1450941712,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288808]",
  //   "naming": 12.111725932544125,
  //   "default": 31.8514483453658,
  //   "availability": 29.45094771650547,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1444801424,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288860]",
  //   "naming": 61.50470787268203,
  //   "default": 76.24258024167536,
  //   "availability": 85.37037315244027,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 1444679840,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288949]",
  //   "naming": 37.55567975595469,
  //   "default": 43.51824554792796,
  //   "availability": 61.500226942449046,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 202282672,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288968]",
  //   "naming": 20.22094733316413,
  //   "default": 62.76293194319473,
  //   "availability": 66.79809787092425,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 175278720,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288990]",
  //   "naming": 17.23866484954368,
  //   "default": 54.68785529156966,
  //   "availability": 52.39546830133435,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 192725824,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10288999]",
  //   "naming": 14.93205982707555,
  //   "default": 22.980489954051176,
  //   "availability": 80.50041352614654,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 192760960,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289008]",
  //   "naming": 50.57804477312908,
  //   "default": 50.2755790791046,
  //   "availability": 32.58651016008365,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 205504624,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289019]",
  //   "naming": 68.30186837854141,
  //   "default": 21.960501077057337,
  //   "availability": 47.70214412795435,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 205469488,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289028]",
  //   "naming": 67.70912109572207,
  //   "default": 4.2537617149884355,
  //   "availability": 9.296314866197353,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 184867168,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289052]",
  //   "naming": 92.4612659078435,
  //   "default": 55.82422485228156,
  //   "availability": 14.100221168741301,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 184832048,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289061]",
  //   "naming": 39.20088271530642,
  //   "default": 3.460188067935621,
  //   "availability": 44.32279433137929,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 93425680,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289083]",
  //   "naming": 9.045696050626153,
  //   "default": 12.23709509400912,
  //   "availability": 98.46487693341624,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1386708944,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289104]",
  //   "naming": 43.67070603027694,
  //   "default": 92.91313372847944,
  //   "availability": 93.0986096780596,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1397464160,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289125]",
  //   "naming": 81.21083247698921,
  //   "default": 19.213504709475828,
  //   "availability": 58.39757664148948,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 227249200,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289144]",
  //   "naming": 36.67653834288009,
  //   "default": 10.697884962100337,
  //   "availability": 30.60527400717856,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 227214096,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289153]",
  //   "naming": 51.72414497705206,
  //   "default": 25.25576046326201,
  //   "availability": 18.370385625822514,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 216398240,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289162]",
  //   "naming": 15.212476468647608,
  //   "default": 58.52646437901849,
  //   "availability": 99.47070767821906,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 216363136,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [10289199]",
  //   "naming": 5.25140642011741,
  //   "default": 39.714771141074955,
  //   "availability": 41.421904939243625,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4303015712,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497641]",
  //   "naming": 65.62195867818983,
  //   "default": 4.99492007425999,
  //   "availability": 86.87234234163503,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4303006784,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497760]",
  //   "naming": 90.6983146540686,
  //   "default": 94.5582646959145,
  //   "availability": 53.22585691515553,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 6618811344,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497769]",
  //   "naming": 93.00044550046682,
  //   "default": 93.11735278056445,
  //   "availability": 48.99248714662392,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 63126224,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497778]",
  //   "naming": 52.20925112731063,
  //   "default": 23.43257696345338,
  //   "availability": 23.796292334870085,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1438563984,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497806]",
  //   "naming": 5.9568813350982195,
  //   "default": 90.95081897624348,
  //   "availability": 6.704851999292295,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 157793920,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497942]",
  //   "naming": 86.45999317328545,
  //   "default": 57.27258647839781,
  //   "availability": 52.38024409783122,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 143961536,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497970]",
  //   "naming": 76.62274463618562,
  //   "default": 45.98916977460576,
  //   "availability": 21.41787429279671,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 139266800,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497979]",
  //   "naming": 72.1818619473692,
  //   "default": 71.53127925436034,
  //   "availability": 27.05943500782859,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 131480528,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497988]",
  //   "naming": 70.98987203264232,
  //   "default": 95.92337154660576,
  //   "availability": 2.4362305084259632,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 106005712,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12497997]",
  //   "naming": 91.20664929412786,
  //   "default": 63.82635082319601,
  //   "availability": 19.782701592613282,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 105970624,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12498085]",
  //   "naming": 56.02428409332689,
  //   "default": 83.25110364194663,
  //   "availability": 92.92994146813176,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 98149696,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12498104]",
  //   "naming": 39.33742763908237,
  //   "default": 75.9435563382489,
  //   "availability": 40.336101645684465,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 93462000,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12498111]",
  //   "naming": 36.36306097644826,
  //   "default": 27.96408335002856,
  //   "availability": 59.50924709388605,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 115338192,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12498120]",
  //   "naming": 81.36785388597345,
  //   "default": 77.60165347330354,
  //   "availability": 41.69113753983928,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 123687600,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12498137]",
  //   "naming": 46.02101616808825,
  //   "default": 6.535705510894575,
  //   "availability": 93.96778903149854,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 150076400,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12508549]",
  //   "naming": 67.07661362900721,
  //   "default": 2.4366396620021162,
  //   "availability": 22.7610985577096,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1406568336,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12931569]",
  //   "naming": 91.38878944712864,
  //   "default": 97.67139523586451,
  //   "availability": 28.207602015840273,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 1406304400,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12931570]",
  //   "naming": 50.08233168614671,
  //   "default": 2.2991407647568796,
  //   "availability": 9.290469246032362,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1412751936,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12931616]",
  //   "naming": 19.16476978845616,
  //   "default": 78.24109099751975,
  //   "availability": 65.24419948867744,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4299981584,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12939410]",
  //   "naming": 27.74514043771124,
  //   "default": 53.26165878293303,
  //   "availability": 47.70581109080765,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4283841504,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12939629]",
  //   "naming": 60.98234242322163,
  //   "default": 15.143024903413616,
  //   "availability": 42.78984807283202,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4293056880,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12939630]",
  //   "naming": 62.08132377851175,
  //   "default": 64.95993324394738,
  //   "availability": 4.551816847255209,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4283694544,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12939717]",
  //   "naming": 87.88535572016897,
  //   "default": 82.13261989736438,
  //   "availability": 19.588467913842813,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4286913920,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12939725]",
  //   "naming": 73.08126596618119,
  //   "default": 33.591497518012424,
  //   "availability": 17.41008429439344,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4283755392,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12939743]",
  //   "naming": 0.28979924041065974,
  //   "default": 37.187254346375,
  //   "availability": 42.62199523498729,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 57829344,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12945759]",
  //   "naming": 47.15808222654465,
  //   "default": 75.40492425168333,
  //   "availability": 31.339052489036458,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 6583486704,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12945808]",
  //   "naming": 35.358251527406125,
  //   "default": 20.409225607872866,
  //   "availability": 5.180986323478677,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 6586988080,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12946878]",
  //   "naming": 92.90149999127428,
  //   "default": 9.926179839747109,
  //   "availability": 85.11477797308531,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 4277453792,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12946970]",
  //   "naming": 49.77495559313945,
  //   "default": 57.75828048579241,
  //   "availability": 84.71934510232688,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4277577984,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12947052]",
  //   "naming": 9.03069332614097,
  //   "default": 61.5231215034941,
  //   "availability": 65.89461099755785,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 72284592,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12947083]",
  //   "naming": 26.767761763923794,
  //   "default": 15.55416635381308,
  //   "availability": 87.38215248018595,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 84200624,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12948490]",
  //   "naming": 81.59520981486278,
  //   "default": 97.90969508365012,
  //   "availability": 55.285778530124155,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4274432432,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12951101]",
  //   "naming": 60.43669097685236,
  //   "default": 22.43038604815229,
  //   "availability": 59.94333927972053,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 65026640,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12951171]",
  //   "naming": 60.52949678141077,
  //   "default": 77.59118251980253,
  //   "availability": 22.910052209523826,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 6615570976,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12951640]",
  //   "naming": 65.66635704278825,
  //   "default": 97.9717326445681,
  //   "availability": 77.51139374706864,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1414964480,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12955888]",
  //   "naming": 26.805508544464306,
  //   "default": 45.2557262661643,
  //   "availability": 84.61674016881639,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 79948816,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12957360]",
  //   "naming": 29.29967604853239,
  //   "default": 43.6036093141279,
  //   "availability": 27.35764909487111,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 79892528,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12957444]",
  //   "naming": 93.16983721617036,
  //   "default": 3.7431735085547757,
  //   "availability": 34.260933361618065,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 167992256,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12958925]",
  //   "naming": 5.677784977175082,
  //   "default": 36.661253724681764,
  //   "availability": 66.89324899235831,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 167957168,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12959043]",
  //   "naming": 76.63268393131928,
  //   "default": 86.40357753997925,
  //   "availability": 32.26611285006258,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 164478432,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12961309]",
  //   "naming": 45.33837645269227,
  //   "default": 5.88046229843846,
  //   "availability": 90.7901423708732,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 4267790416,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12962630]",
  //   "naming": 46.82455396274274,
  //   "default": 72.18514996002854,
  //   "availability": 49.61394010880211,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 83180272,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12962763]",
  //   "naming": 10.362428918270417,
  //   "default": 47.47449511859674,
  //   "availability": 69.73312226801154,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 71273792,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12962771]",
  //   "naming": 70.46083297124494,
  //   "default": 53.701447861260505,
  //   "availability": 70.56409569665898,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 80078528,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12962825]",
  //   "naming": 19.387423198130314,
  //   "default": 90.80663442179548,
  //   "availability": 7.804832122880213,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 71614096,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12965265]",
  //   "naming": 3.018967728303834,
  //   "default": 19.88539753338288,
  //   "availability": 15.21077226337655,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 4261221488,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12965418]",
  //   "naming": 54.4691869958974,
  //   "default": 59.77613886690853,
  //   "availability": 20.254461894890152,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 71528272,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [12966114]",
  //   "naming": 10.897373057536797,
  //   "default": 39.07140207757194,
  //   "availability": 92.3973104851095,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 72826256,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [13365230]",
  //   "naming": 14.040571869995167,
  //   "default": 50.09150147926149,
  //   "availability": 63.13685367641782,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 1430775504,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [13469837]",
  //   "naming": 51.24997721068319,
  //   "default": 94.92358134758592,
  //   "availability": 72.32915104723148,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // },
  // {
  //   "dynamicId": 164258384,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [13480706]",
  //   "naming": 68.40031412728523,
  //   "default": 30.230250758192277,
  //   "availability": 90.28949689104188,
  //   "monitorability": "CONVENTION DE NOMMAGE INCORRECTE"
  // },
  // {
  //   "dynamicId": 63557136,
  //   "name": "VE_GTIE_GTB_GTB_MULTICAPTEUR [13522241]",
  //   "naming": 68.39348066109802,
  //   "default": 99.56446395256056,
  //   "availability": 60.22749875587608,
  //   "monitorability": "DONNÉES NON REMONTÉES"
  // }
  //   ]
  }),
  methods: {
    positiveColor(val, threshold) {
      if(typeof val =='undefined') return '#898F95'
      if(val<threshold) return '#FF4242';
      return '#14202C';
    },
    negativeColor(val, threshold) {
      if(typeof val =='undefined') return '#898F95'
      if(val<threshold) return '#14202C';
      return '#FF4242';
    },
    //14202C', '9830F2', 'EF8BC5', 'FF4242
    thresholdColor(val) {
      if(typeof val =='undefined') return '#898F95';
      if(val<5){
        return '#898F95';
      }
        else if(val<10){
          return '#EF8BC5';
        }
          else if(val<20){
            return '#9830F2';
          }
            else{
              return '#14202C';
            }
    },
    checkMonitorability(monitorabily) {
      if (['OK', 'NOK', 'CONVENTION DE NOMMAGE INCORRECTE', 'DONNÉES NON REMONTÉES'].includes(monitorabily))
      return monitorabily;
      return 'indéfinie';
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
.font-table {
  font: normal normal normal 11px/13px Charlevoix !important;
  letter-spacing: 1.1px;
  color: #14202C;
  opacity: 1;
  box-shadow: none !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.v-data-table {
  display: flex;
  flex-direction: column;
}
::v-deep .v-data-table__wrapper {
  flex-grow: 1;
  height: 0;
  overflow-y: auto !important;
}

::v-deep th {
  height: 16px !important;
  font-size: 10px !important;
  color: #214353 !important;
}

::v-deep td {
  font-size: 14px !important;
  color: #14202C !important;
  background-color: #F4F4F4;
  border-bottom: 1px solid white !important;
  border-right: 1px solid white !important;
}

::v-deep tr:hover td {
  background-color: #f0f0f0 !important;
}

::v-deep .v-icon__svg {
  fill: #214353 !important;
}

::v-deep .v-list .v-list-item--active, .v-list .v-list-item--active .v-icon {
  background-color: #2f5321 !important;
}

::v-deep .v-text-field.v-input--is-focused > .v-input__control > .v-input__slot:after{
  color: #214353;
}

::v-deep .v-list-item--link:before {
  background-color: #1500ff !important;
}

::v-deep .v-application .primary--text {
  color: #14202C !important;
  caret-color: #14202C !important;
  background-color: #1500ff !important;
}
</style>