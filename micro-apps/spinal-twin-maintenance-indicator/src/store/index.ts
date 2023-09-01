import Vue from "vue";
import Vuex from "vuex";
import { getProcessListAsync, getWorkflowListAsync } from "../api-requests";
import { Process } from "../classes/Process";
import { Workflow } from "../classes/Workflow";
import { gradiant } from "../colors";
import moment from "moment";
import "moment/locale/fr";

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
  weekdays: [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ],
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loaded: false,
    displayable: <(Workflow | Process)[]>[],
  },
  mutations: {
    SET_DISPLAYABLE(state, payload) {
      state.displayable = payload;
    },
    SET_LOADED(state, payload) {
      state.loaded = payload;
    },
  },
  actions: {
    async initWorkflows({ commit }) {
      const promises = <Promise<any>[]>[];
      const workflow_list = (await getWorkflowListAsync()).map(
        (w: any) => new Workflow(w.dynamicId, w.name)
      );
      const colors_workflow = gradiant(workflow_list.length);
      for (let i = 0; i < workflow_list.length; i++)
        workflow_list[i].setColor(colors_workflow[i]);

      let processes = <Process[]>[];
      for (const workflow of workflow_list) {
        promises.push(
          getProcessListAsync(workflow.dynamicId).then((process_list) => {
            processes = processes.concat(
              process_list.map(
                (p: any) => new Process(workflow.dynamicId, p.dynamicId, p.name)
              )
            );
            const colors_process = gradiant(processes.length);
            for (let i = 0; i < processes.length; i++)
              processes[i].setColor(colors_process[i]);
          })
        );
      }

      Promise.all(promises).then(() => {
        commit("SET_DISPLAYABLE", workflow_list.concat(processes));
        commit("SET_LOADED", true);
      });
    },

    async updateProcess({ state }, payload) {
      const displayable = state.displayable.find(
        (d) => d.getDynamicId() === payload.displayedId
      );
      if (displayable instanceof Process)
        await displayable.buildProcess(payload.period, payload.index);
      else if (displayable instanceof Workflow)
        await displayable.buildWorkflow(payload.period, payload.index);
    },
    async updateProcesses({ dispatch }, payload) {
      payload.displayedIds.forEach((displayedId: any) => {
        dispatch("updateProcess", {
          displayedId,
          period: payload.period,
          index: payload.index,
        });
      });
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
      (payload: { displayedIds: number[]; period: string; index: number }) => {
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
        datasets.forEach((set: any) => {
          set.data = set.data.map((d: number) => (d >= 0 ? d : null));
        });

        let labels = <any[]>[];
        switch (payload.period) {
          case "week":
            labels = moment.weekdays();
            break;
          case "month":
            const monthEnd = moment()
              .add(payload.index, "months")
              .daysInMonth();
            for (let i = 1; i <= monthEnd; i++) labels.push(i);
            break;
          case "year":
            labels = moment.months();
            break;
          case "decade":
            const decEnd = moment()
              .add(payload.index * 10, "years")
              .year();
            for (let i = 0; i < 10; i++) labels.unshift(decEnd - i);
            break;
        }
        return {
          labels,
          datasets,
        };
      },

    getSingleLineData:
      (state) => (payload: { displayedId: number; period: string }) => {
        const displayed = state.displayable.find(
          (d) => d.getDynamicId() === payload.displayedId
        );
        return displayed ? displayed.getLineChart(payload.period) : [];
      },
    getLineData:
      (state, getters) =>
      (payload: { displayedIds: number[]; period: string }) => {
        const lines = payload.displayedIds.map((displayedId) =>
          getters.getSingleLineData({ displayedId, period: payload.period })
        );
        const datasets = lines.reduce((e1, e2) => {
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
              el.data.forEach((num: any, i: number) =>
                found.data[i].push(...el.data[i])
              );
            }
          }
          return e1;
        }, []);

        return datasets;
      },
    getPeriode: (state) => (payload: { period: String; index: number }) => {
      const currentDay = moment();
      switch (payload.period) {
        case "week":
          currentDay.add(payload.index, "week");
          const end = currentDay.endOf("week");
          return `${moment(end)
            .add(-6, "days")
            .format("DD MMMM")} - ${end.format("DD MMMM")}`;
        case "month":
          currentDay.add(payload.index, "months");
          return currentDay.format("MMMM YYYY");
        case "year":
          currentDay.add(payload.index, "years");
          return currentDay.format("YYYY");
        case "decade":
          currentDay.add(payload.index * 10, "years");
          return `${moment(currentDay)
            .add(-9, "years")
            .format("YYYY")}-${currentDay.format("YYYY")}`;
      }
    },
  },
  modules: {},
});
