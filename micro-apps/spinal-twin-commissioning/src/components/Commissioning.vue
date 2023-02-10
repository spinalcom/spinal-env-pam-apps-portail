<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
      <div class="CH">
        <p class="TTL">DÉTAILS DES ÉLÉMENTS CONNECTÉS</p>
      </div>
      <div class="SLS">
        <SmallLegend :size="12" color="#14202C" text="Connecté et fonctionnel"/>
        <SmallLegend :size="12" color="#9830F2" text="Pas de convention de nommage"/>
        <SmallLegend :size="12" color="#EF8BC5" text="Convention de nommage incorrect"/>          
        <SmallLegend :size="12" color="#FF000B" text="Données incohérentes"/>
        <SmallLegend :size="12" color="#898F95" text="Données non remontées / champ indéfini"/>
      </div>
      <div class="MS">
        <div class="TS">
          <div class="HD">
            <p class="ST">DÉTAILS</p>
          </div>
          <div class="STRPS">
            <Stripe :key="dotKeys" v-if="stripeData && stripeData.stripeValues && stripeData.stripeValues != [0, 0, 0, 0]" :stripeData="stripeData"></Stripe>
          </div>
          <div class="MTBL">
            <SpinalTable v-if="context" :context="context" :floor="floor"/>
          </div>
        </div>
        <div class="DS">
          <div class="HD d-flex flex-row justify-center">
            <p class="ST flex-grow-1">MULTICAPTEURS</p>
            <div class="d-flex flex-row mb-n1">
                <v-icon style="margin-top: -1px; font-size: 20px; margin-right: 10px;">mdi-dots-grid</v-icon>
              <v-switch
                style="margin-top: -3px;margin-bottom: -10px; padding: 0px;height: 24px;"
                inset
                v-model="isPercent"
                color="blue-grey"
                dense
                >
              </v-switch>
              <v-icon style="margin-top: -1px; font-size: 18px; margin-left: -10px">mdi-percent</v-icon>
              </div>
          </div>
          <div class="GRDFRM">
            <div class="DBRF" ref="debrief">
              <table style="height: 100%" v-if="availabilityArray != null">
                <tr>
                  <td class="RA BN">{{ availabilityArray[2] }}</td>
                  <td class="LA LDBRF">connectés <br>{{ connectedPercentage }}% des automates totaux</td>
                </tr>
                <tr>
                  <td class="RA GN">{{ availabilityArray[1] }}</td>
                  <td class="LA LDBRF">données non remontées</td>
                </tr>
                <tr>
                  <td class="RA RN">{{ availabilityArray[0] }}</td>
                  <td class="LA LDBRF">données incohérentes</td>
                </tr>
              </table>
            </div>
            <div class="GRD">
              <DotGrid :key="dotKeys" v-if="dotsHeight!=-1 && dotsWidth!=-1 && availabilityArray != null" :givenHeight="dotsHeight" :givenWidth="dotsWidth" :isPercent="isPercent" :dotsColor="gtbColors" :dotsList="availabilityArray"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { getContextTree } from "../services/index.js";
import SmallLegend from "./nested/SmallLegend.vue";
import Stripe from "./nested/Stripe.vue";
import SpinalTable from "./nested/SpinalTable.vue";
import DotGrid from './nested/DotGrid.vue';
export default {
  name: 'CommissioningComponent',
  components: {
    SmallLegend,
    Stripe,
    SpinalTable,
    DotGrid
  },
  props: ['floor'],
  computed: {
    connectedPercentage() {
      if (this.availabilityArray) {
        let sum = this.availabilityArray.reduce((a, b) => a+b, 0);
        return (this.availabilityArray[2] * 100 / sum).toFixed(0);
      }
      else return 0;
    }
  },
  methods: {
    resizeHandler() {
      this.dotsHeight = window.innerHeight - 327 - 4 - 79;
      this.dotsWidth = this.$refs.debrief.clientWidth -20;

    }
  },
  data: () => ({
    debriefHeight: 0,
    debriefWidth: 0,
    stripeData: {
      stripeNames: ['OK', 'NOK', 'incorrecte', 'non remontées'],
      stripeColors: ['#14202C', '#9830F2', '#EF8BC5', '#898F95'],
      stripeValues: null,
      originalStripeValues: null,
    },
    dotsHeight: -1,
    dotsWidth: -1,
    availabilityArray: null,
    originalAvailabilityArray: null,
    gtbColors: ['FF000B', '898F95', '14202C'],
    isPercent: true,
    context: null,
    originalContext: null,
    dotKeys: 0,
  }),
  async mounted() {
    this.dotsHeight = window.innerHeight - 327 - 4 - 79;
    this.dotsWidth = this.$refs.debrief.clientWidth -20;
    let data = await getContextTree();
    this.context = data;
    this.originalContext = data;
    this.availabilityArray = data['availabilityArray'];
    this.originalAvailabilityArray = data['availabilityArray'];
    this.stripeData.stripeValues = data['namingConventionArray'];
    this.stripeData.originalStripeValues = data['namingConventionArray'];
  },

  created() {
    this.throttleListener = _.throttle(this.resizeHandler, 10);
    window.addEventListener("resize", this.throttleListener);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleListener);
  },
  watch: {
    floor(value) {
      this.dotKeys++;
      if (this.originalContext) {
        this.context = [];
        this.availabilityArray = null;
        this.availabilityArray = [0, 0, 0];
        this.stripeData.stripeValues = [0, 0, 0, 0];
        // for (let i = 0; i < this.originalContext.length; i++) {
        //   if (this.originalContext[i].floor == value) {
        //     this.context.push(this.originalContext[i]);
        //   }
        // }
        this.originalContext.forEach(l => {if (l.floor == value) this.context.push(l)});
        this.context.forEach(c => {
          if (c.monitorability == 'OK') this.stripeData.stripeValues[0]++;
          else if (c.monitorability == 'NOK') this.stripeData.stripeValues[1]++;
          else if (c.monitorability == 'CONVENTION DE NOMMAGE INCORRECTE') this.stripeData.stripeValues[2]++;
          else this.stripeData.stripeValues[3]++;

          if (c.availability < 70) this.availabilityArray[0]++;
          else this.availabilityArray[2]++;
        })
      }
    }
  }
}
</script>

<style scoped>
/* root container */

.RC {
  font-family: Charlevoix;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 80px 10px 10px;
  gap: 10px;
  height: 100vh;
  width: 100%;
  background: linear-gradient(111.34deg, #F8FAFA 0%, #D6E2E6 100%);
}
/* main container */
.MC {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  background: #F9F9F9;
  border: 1px solid #F7F7F7;
  box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.16);
  border-radius: 10px;
  width: 100%;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  overflow-y: hidden;
}
/* container header */
.CH {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px;
  gap: 10px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}
/* title */
.TTL {
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  color: #214353;
  margin-bottom: 0 !important;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
/* small legend section*/
.SLS {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 10px;
  gap: 10px;
  width: 100%;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
  overflow-x: auto;
}
/* main section */
.MS {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px;
  gap: 10px;
  width: 100%;
  flex: none;
  order: 2;
  align-self: stretch;
  flex-grow: 1;
  overflow-x: auto;
}
/* table section */
.TS {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  width: 60%;
  min-width: 400px;
  background: #FFFFFF;
  border: 1px solid #F9F9F9;
  border-radius: 5px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 1;
}
/* dots section */
.DS {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 10px;
  width: 30%;
  min-width: 300px;
  background: #FFFFFF;
  border: 1px solid #F9F9F9;
  border-radius: 5px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}
/* header section */
.HD {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 10px;
  gap: 10px;
  width: 100%;
  height: 30px;
  border-bottom: 1px solid #F7F7F7;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}
/* section title */
.ST {
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  color: #435567;
  flex: none;
  order: 0;
  flex-grow: 0;
  margin-bottom: 0 !important;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.STRPS {
  width: 100%;
  order: 1;
}

.MTBL {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 10px;
  gap: 1px;
  flex: none;
  order: 2;
  align-self: stretch;
  flex-grow: 1;
}

.GRDFRM {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  width: 100%;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 1; 
}

.DBRF {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  flex-shrink: 1;
}

.GRD {
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 10px;
  width: 100%;
  margin-bottom: 59px;
  gap: 10px;
  flex: none;
  order: 1;
  flex-grow: 1;
}

.RA {
  text-align: end;
  width: 30%;
}

.LA {
  padding-left: 10px;
  text-align: start;
}

.LDBRF {
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 19px;
  letter-spacing: 1.1px;
  color: #949DA6;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.BN {
  font-style: normal;
  font-weight: 400;
  font-size: 32px;
  line-height: 32px;
  color: #14202C;
}

.GN {
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 24px;
  color: #898F95;
}

.RN {
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 24px;
  color: #FF000B;
}

::v-deep .theme--light.v-input--switch .v-input--switch__thumb, .theme--light.v-input--switch .v-input--switch__track {
  color: #607d8b !important;
}
</style>
