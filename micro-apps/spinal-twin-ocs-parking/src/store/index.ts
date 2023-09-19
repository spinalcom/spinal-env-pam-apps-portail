import Vue from "vue";
import Vuex from "vuex";
import {
  getEndpointListAsync,
  getRoomGroupCategoriesAsync,
  getRoomGroupContextsAsync,
  getRoomGroupGroupsAsync,
  getTimeSeriesAsync,
} from "../api-requests";
import moment from "moment";

import config from "../../config.js";
const appConfig = config;

moment.locale("fr", {
  months: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    groups: [],
    labels: Array(1440)
      .fill(0)
      .map((e, i) => {
        const hour = i / 60;
        const fhour = Math.floor(hour);
        if (hour === fhour) return `${hour}h00`;
        const min = Math.round((hour - Math.floor(hour)) * 60);
        return `${fhour > 9 ? fhour : "0" + fhour}h${
          min > 9 ? min : "0" + min
        }`;
      }),
    step: 360,
    capacities: [],
    datasets: <any[]>[],
  },
  mutations: {
    SET_GROUPS(state, payload) {
      state.groups = payload;
    },
    SET_CAPACITIES(state, payload) {
      state.capacities = payload;
    },
    SET_DATASETS(state, payload) {
      state.datasets = payload;
    },
  },
  actions: {
    async setCapacities({ commit, state }) {
      const table = await Promise.all(
        state.groups.map(async (g: any) => {
          const endpoints = await getEndpointListAsync(g.dynamicId);
          const e_used = endpoints.find((e: any) =>
            e.name.includes("Occupied")
          );
          g.endpointId = e_used.dynamicId;
          const [used, nused] = [
            e_used.currentValue,
            endpoints.find((e: any) => e.name.includes("Vacant")).currentValue,
          ];

          return {
            title: g.name,
            color: g.color,
            count: `${used}/${used + nused}`,
            percentage: `${Math.round((used * 100) / (used + nused))}%`,
          };
        })
      );
      const total = {
        title: "Total",
        color: "#14202c",
        count: "",
        percentage: "",
      };
      const { used, tot } = table.reduce(
        (e1, e2) => {
          const [u, t] = e2.count.split("/");
          e1.used += parseInt(u);
          e1.tot += parseInt(t);
          return e1;
        },
        { used: 0, tot: 0 }
      );
      total.count = `${used}/${tot}`;
      total.percentage = Math.round((used * 100) / tot) + "%";
      table.unshift(total);
      commit("SET_CAPACITIES", table);
    },

    async updateChart({ commit, state }, index: number) {
      const datasets = await Promise.all(
        state.groups.map(async (g: any) => {
          return {
            label: g.name,
            borderColor: g.color,
            data: (await getTimeSeriesAsync(g.endpointId, index)).reduce(
              (tab: any, s: any) => {
                const ret: { [key: string]: any } = {};
                const label = moment(s.date).format("HH[h]mm");
                ret[label] = s.value;
                return { ...tab, ...ret };
              },
              {}
            ),
          };
        })
      );

      const total = {
        label: "Total",
        borderColor: "#14202c",
        data: datasets.reduce((e1: any, e2: any) => {
          for (const i in e2.data) e1[i] = e2.data[i] + (e1[i] || 0);
          return e1;
        }, {}),
      };
      datasets.unshift(total);
      commit("SET_DATASETS", datasets);
    },

    async initData({ commit, dispatch }) {
      const context = (await getRoomGroupContextsAsync()).find(
        (c: any) => c.name === appConfig.context
      );
      const category = (
        await getRoomGroupCategoriesAsync(context.dynamicId)
      ).find((c: any) => c.name === appConfig.category);

      const group_list = await getRoomGroupGroupsAsync(
        context.dynamicId,
        category.dynamicId
      );

      commit("SET_GROUPS", group_list);
      await dispatch("setCapacities");
      await dispatch("updateChart", 0);
    },
  },
  getters: {
    getCurrentDate: (state) => (index: number) => {
      return moment().add(index, "days").format("DD MMMM YYYY");
    },
    getDatasets: (state) => (type: string) => {
      if (type !== "%") {
        return state.datasets.map((d) => ({
          label: d.label,
          borderColor: d.borderColor,
          data: state.labels.map((l) => d.data?.[l]),
        }));
      }
      return state.datasets.map((d) => {
        const group: any = state.capacities.find(
          (c: any) => c.title === d.label
        );
        if (!group) return null;
        const total = parseInt(group.count.split("/")[1]);
        return {
          label: d.label,
          borderColor: d.borderColor,
          data: state.labels.map((l) =>
            Math.round((d.data?.[l] * 100) / total)
          ),
        };
      });
    },
    getDataTable: (state) => (index: number) => {
      const header = ["Typologie"].concat(
        state.capacities.map((c: any) => c.title)
      );
      const tabRet = [];
      const subHeader: { [key: string]: any } = {};
      for (const i in header) {
        const found: any = state.capacities.find(
          (c: any) => c.title === header[i]
        );
        subHeader[header[i]] = found?.count.split("/")[1] || "Capacité";
      }
      tabRet.push(subHeader);
      for (const i in state.datasets[0]?.data || []) {
        const el: { [key: string]: any } = {};
        for (const key of header) {
          if (key === "Typologie") el[key] = i;
          else {
            const found: any = state.datasets.find((c: any) => c.label === key);
            el[key] = found?.data[i] || 0;
          }
        }
        tabRet.push(el);
      }
      return {
        file:
          "Occupation " +
          appConfig.category +
          " du " +
          moment().add(index, "days").format("DD/MM/YY"),
        data: tabRet,
      };
    },
  },
  modules: {},
});
