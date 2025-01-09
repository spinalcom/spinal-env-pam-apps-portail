import Vue from "vue";
import Vuex from "vuex";
import { getProcessListAsync, getWorkflowListAsync } from "../api-requests";
import { Process } from "../classes/Process";
import { label } from "../date-comparison";
import { Workflow } from "../classes/Workflow";
import { gradiant } from "../colors";

const patrimoine = JSON.parse(localStorage.getItem("patrimoine") || "");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    intiating: false,
    loaded: false,
    displayable: <(Workflow | Process)[]>[],
  },
  mutations: {
    SET_DISPLAYABLE(state, payload) {
      state.displayable = payload;
    },
    PUSH_DISPLAYABLE(state, payload) {
      state.displayable.push(...payload);
    },
    SET_LOADED(state, payload) {
      state.loaded = payload;
    },
  },
  actions: {
    async initWorkflows({ commit }) {
      await Promise.all(
        patrimoine.buildings.map(async (building: any) => {
          const promises = <Promise<any>[]>[];
          const workflow_list = (await getWorkflowListAsync(building.id)).map(
            (w: any) => new Workflow(building.id, w.dynamicId, w.name)
          );

          const colors_workflow = gradiant(workflow_list.length);
          for (let i = 0; i < workflow_list.length; i++)
            workflow_list[i].setColor(colors_workflow[i]);

          let processes = <Process[]>[];
          for (const workflow of workflow_list) {
            promises.push(
              getProcessListAsync(workflow.buildingId, workflow.dynamicId).then(
                (process_list) => {
                  processes = processes.concat(
                    process_list.map(
                      (p: any) =>
                        new Process(
                          building.id,
                          workflow.dynamicId,
                          p.dynamicId,
                          p.name
                        )
                    )
                  );
                  const colors_process = gradiant(processes.length);
                  for (let i = 0; i < processes.length; i++)
                    processes[i].setColor(colors_process[i]);
                }
              )
            );
          }

          Promise.all(promises).then(() => {
            commit("PUSH_DISPLAYABLE", workflow_list.concat(processes));
          });
        })
      );
      commit("SET_LOADED", true);
    },

    async updateProcess({ state }, payload) {
      for (const displayable of state.displayable)
        if (displayable.getDynamicId() === payload.displayedId) {
          if (displayable instanceof Process)
            await displayable.buildProcess(payload.period);
          else if (displayable instanceof Workflow)
            await displayable.buildWorkflow(payload.period);
        }
    },
    async updateProcesses({ commit, getters, dispatch }, payload) {
      if (
        payload.displayedIds.every(
          (displayedId: any) =>
            !getters.isLoaded({ displayedId, period: payload.period })
        )
      )
        commit("SET_LOADED", false);
      await Promise.all(
        payload.displayedIds.map(async (displayedId: any) => {
          await dispatch("updateProcess", {
            displayedId,
            period: payload.period,
          });
        })
      );
      commit("SET_LOADED", true);
    },
  },
  getters: {
    isLoaded: (state) => (payload: { displayedId: number; period: string }) => {
      const displayed = state.displayable.find(
        (d) => d.getDynamicId() === payload.displayedId
      );
      return displayed ? displayed.isLoaded(payload.period) : false;
    },

    getSingleBarData:
      (state) => (payload: { displayedId: number; period: string }) => {
        const displayed = state.displayable.find(
          (d) => d.getDynamicId() === payload.displayedId
        );
        return displayed ? displayed.getBarChart(payload.period) : [];
      },
    getBarData:
      (state, getters) =>
      (payload: { displayedIds: number[]; period: string }) => {
        const bars = payload.displayedIds.map((displayedId) =>
          getters.getSingleBarData({ displayedId, period: payload.period })
        );
        const datasets = bars.reduce((e1, e2) => {
          for (const el of e2) {
            const found = e1.find((e: any) => e.label === el.label);
            if (!found) {
              const { label, backgroundColor, borderColor, borderWidth } = el;
              e1.push({
                label,
                backgroundColor,
                borderColor,
                borderWidth,
                data: [...el.data],
              });
            } else {
              el.data.forEach(
                (num: number, i: number) => (found.data[i] += num)
              );
            }
          }
          return e1;
        }, []);

        return {
          labels: (label as { [key: string]: number[] | string[] })[
            payload.period
          ],
          datasets,
        };
      },

    getSingleIndicators: (state) => (payload: { displayedId: number }) => {
      const displayed = state.displayable.find(
        (d) => d.getDynamicId() === payload.displayedId
      );
      return displayed ? displayed.getIndicators() : [];
    },
    getIndicators:
      (state, getters) => (payload: { displayedIds: number[] }) => {
        const indicators = payload.displayedIds.map((displayedId) =>
          getters.getSingleIndicators({ displayedId })
        );

        const indicator = indicators.reduce((e1, e2) => {
          for (const el of e2) {
            const found = e1.find((e: any) => e.title === el.title);
            if (!found) {
              const { compared, subtitle, title, type, unit, value } = el;
              e1.push({ compared, subtitle, title, type, unit, value });
            } else {
              if (found.title === "en cours") {
                const val = parseInt(found.compared) + parseInt(el.compared);
                const sign = val < 0 ? "-" : "+";
                found.compared = sign + Math.abs(val);
              }
              found.value += el.value;
            }
          }
          return e1;
        }, []);
        if (indicators.length && indicators[0].length) {
          const found = indicator.find((i: any) => i.title.includes("moyen"));
          if (found) {
            found.value = Math.round((found.value /= indicators.length));
            found.compared =
              found.value < 3 ? "Rapide" : found.value < 6 ? "Normal" : "Lent";
          }
        }

        return indicator.length
          ? indicator
          : [
              {
                value: -1,
                unit: "Tickets",
                title: "créés aujourd'hui",
                subtitle: "aujourd'hui",
                type: "date",
                compared: "",
              },
              {
                value: -1,
                unit: "Tickets",
                title: "créés cette semaine",
                subtitle: "cette semaine",
                type: "date",
                compared: "",
              },
              {
                value: -1,
                unit: "Tickets",
                title: "en cours",
                subtitle: "par rapport à la semaine dernière",
                type: "comparison",
                compared: "Non défini",
              },
              {
                value: -1,
                unit: "Heures",
                title: "Temps de résolution",
                subtitle: "par rapport à la moyenne",
                type: "comparison",
                compared: "Non défini",
              },
            ];
      },

    getSinglePieData: (state) => (payload: { displayedId: number }) => {
      const displayed = state.displayable.find(
        (d) => d.getDynamicId() === payload.displayedId
      );
      return displayed ? displayed.getPieChart() : [];
    },
    getPieData: (state, getters) => (payload: { displayedIds: number[] }) => {
      const pies = payload.displayedIds.map((displayedId) =>
        getters.getSinglePieData({ displayedId })
      );

      const pie = pies.reduce((e1: any[], e2: any[]) => {
        for (const el of e2) {
          const found = e1.find((e) => e.label === el.label);
          if (found) found.value += parseInt(el.value);
          else e1.push({ label: el.label, value: parseInt(el.value) });
        }

        return e1;
      }, []);

      return !pie.length ? [{ label: "Pas de données", value: 1 }] : pie;
    },
  },
  modules: {},
});
