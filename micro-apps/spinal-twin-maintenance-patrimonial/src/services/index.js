import { HTTP } from "./http-constants";
import moment from "moment";

const buildings = JSON.parse(localStorage.getItem("patrimoine")).buildings;
const colors = [
  "#FF4A3B",
  "#93876E",
  "#74BDCB",
  "#EFE7BC",
  "#FFA384",
  "#E7F2F8",
  "#ECF87F",
  "#B99095",
  "#93B9B8",
  "#FDA649",
  "#050533",
  "#0D698B",
  "#29A0B1",
  "#FFAEBC",
  "#B4F8C8",
  "#FBE7C6",
  "#3D5B59",
  "#A0E7E5",
];

export function curveData(period, timestamp, domain, list, domainList) {
  let domainPie = [];
  let declarerPie = [];
  let buildingPie = [];
  let domainExists = false;
  let declarerExists = false;
  let cardsData = {
    todaysTickets: 0,
    onGoingTickets: 0,
    selectedTempoTickets: 0,
    selectedTempoTicketsText: "",
  };
  let todaysDate = moment().format("DDMMYYYY");
  cardsData.todaysTickets = list.filter((t) => t.formatDate.week == todaysDate);

  let barChartDataObject = {
    labels: [],
    data: [
      {
        label: "Attente de lect.avant Execution",
        backgroundColor: "#14202c",
        data: [],
      },
      {
        label: "Attente de réalisation",
        backgroundColor: "#846f1a",
        data: [],
      },
      {
        label: "Réalisation partielle",
        backgroundColor: "#e423a5",
        data: [],
      },
    ],
  };
  let ticketList =
    domain === "Tous les domaines"
      ? list
      : list.filter((t) => t.domain === domain);

  if (period === "Semaine") {
    var startOfWeek = moment(timestamp).startOf("week");
    var endOfWeek = moment(timestamp).endOf("week");
    var exactDate = [];
    var currentDay = moment(startOfWeek);
    while (currentDay.isSameOrBefore(endOfWeek)) {
      exactDate.push(currentDay.format("DDMMYYYY"));
      barChartDataObject.labels.push(currentDay.format("DD MMM"));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
      currentDay.add(1, "day");
    }
    buildingPie = buildings.map((b, i) => ({
      label: b.name,
      value: ticketList.filter(
        (t) =>
          t.building === b.id &&
          moment(t.date).isBetween(startOfWeek, endOfWeek)
      ).length,
      color: colors[i],
    }));
    let index = 0;
    cardsData.selectedTempoTicketsText =
      "créés entre le " +
      startOfWeek.format("DD MMM") +
      " et " +
      endOfWeek.format("DD MMM");
    for (let i = 0; i < list.length; i++) {
      domainExists = false;
      declarerExists = false;
      index = exactDate.findIndex((date) => date === list[i].formatDate.week);

      if (index != -1) {
        if (
          list[i].step === "Attente de lect.avant Execution" &&
          (list[i].domain === domain || domain === "Tous les domaines")
        ) {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === list[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: list[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === list[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === list[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: list[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        } else if (
          list[i].step === "Attente de réalisation" &&
          (list[i].domain === domain || domain === "Tous les domaines")
        ) {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === list[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: list[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === list[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === list[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: list[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        } else if (
          list[i].step === "Réalisation partielle" &&
          (list[i].domain === domain || domain === "Tous les domaines")
        ) {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === list[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: list[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === list[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === list[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: list[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }

    return [barChartDataObject, cardsData, domainPie, declarerPie, buildingPie];
  } else if (period === "Mois") {
    var startOfMonth = moment(timestamp).startOf("month");
    var endOfMonth = moment(timestamp).endOf("month");
    var exactDate = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      exactDate.push(currentDay.format("DDMMYYYY"));
      barChartDataObject.labels.push(currentDay.format("DD MMM"));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
      currentDay.add(1, "day");
    }
    buildingPie = buildings.map((b, i) => ({
      label: b.name,
      value: ticketList.filter(
        (t) =>
          t.building === b.id &&
          moment(t.date).isBetween(startOfMonth, endOfMonth)
      ).length,
      color: colors[i],
    }));
    let index = 0;
    cardsData.selectedTempoTicketsText =
      "créés en " + startOfMonth.format("MMMM YYYY");
    for (let i = 0; i < ticketList.length; i++) {
      domainExists = false;
      declarerExists = false;
      let formattedDate = moment(ticketList[i].date).format("DDMMYYYY");
      index = exactDate.findIndex((date) => date === formattedDate);
      if (index != -1) {
        if (ticketList[i].step === "Attente de lect.avant Execution") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        } else if (ticketList[i].step === "Attente de réalisation") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        } else if (ticketList[i].step === "Réalisation partielle") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }
    return [barChartDataObject, cardsData, domainPie, declarerPie, buildingPie];
  } else if (period === "Année") {
    var exactDate = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      exactDate.push(currentMonth.format("MMM YYYY"));
      barChartDataObject.labels.push(currentMonth.format("MMM YYYY"));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
    }
    buildingPie = buildings.map((b, i) => ({
      label: b.name,
      value: ticketList.filter(
        (t) =>
          t.building === b.id &&
          moment(t.date).isBetween(
            moment(timestamp).startOf("year"),
            moment(timestamp)
          )
      ).length,
      color: colors[i],
    }));
    let index = 0;
    cardsData.selectedTempoTicketsText =
      "créés en " + currentMonth.format("YYYY");
    for (let i = 0; i < ticketList.length; i++) {
      domainExists = false;
      declarerExists = false;
      let formattedDate = moment(ticketList[i].date).format("MMM YYYY");
      index = exactDate.findIndex((date) => date === formattedDate);
      if (index != -1) {
        if (ticketList[i].step === "Attente de lect.avant Execution") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }

          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        } else if (ticketList[i].step === "Attente de réalisation") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        } else if (ticketList[i].step === "Réalisation partielle") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }
    return [barChartDataObject, cardsData, domainPie, declarerPie, buildingPie];
  } else if (period === "Décennie") {
    var exactDate = [];
    for (var i = -9; i <= 0; i++) {
      var currentYear = moment(timestamp).add(i, "years");
      exactDate.push(currentYear.format("YYYY"));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
      barChartDataObject.labels.push(currentYear.format("YYYY"));
    }
    buildingPie = buildings.map((b, i) => ({
      label: b.name,
      value: ticketList.filter(
        (t) =>
          t.building === b.id &&
          moment(t.date).isBetween(
            moment(timestamp).startOf("year").subtract(10, "years"),
            moment(timestamp)
          )
      ).length,
      color: colors[i],
    }));
    let index = 0;
    cardsData.selectedTempoTicketsText =
      "créés entre " + exactDate[0] + " et " + exactDate[9];
    for (let i = 0; i < ticketList.length; i++) {
      domainExists = false;
      declarerExists = false;
      let formattedDate = moment(ticketList[i].date).format("YYYY");
      index = exactDate.findIndex((date) => date === formattedDate);
      if (index != -1) {
        if (ticketList[i].step === "Attente de lect.avant Execution") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        } else if (ticketList[i].step === "Attente de réalisation") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        } else if (ticketList[i].step === "Réalisation partielle") {
          for (let dp = 0; dp < domainPie.length; dp++) {
            if (domainPie[dp].label === ticketList[i].domain) {
              domainPie[dp].value += 1;
              domainExists = true;
              break;
            }
          }
          if (!domainExists) {
            domainPie.push({
              label: ticketList[i].domain,
              value: 1,
              color:
                domainList[
                  domainList.findIndex((d) => d.name === ticketList[i].domain)
                ].color,
            });
          }
          for (let dp = 0; dp < declarerPie.length; dp++) {
            if (declarerPie[dp].label === ticketList[i].name) {
              declarerPie[dp].value += 1;
              declarerExists = true;
              break;
            }
          }
          if (!declarerExists) {
            declarerPie.push({ label: ticketList[i].name, value: 1 });
          }
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }
    return [barChartDataObject, cardsData, domainPie, declarerPie, buildingPie];
  }
}

async function getBuildingData(buildingId, colors, colorIndex) {
  try {
    const listWorkflowResponse = await HTTP.get(
      `building/${buildingId}/workflow/list`
    );
    let domains = [];
    let totalNumberOfTickets = 0;
    let ticketList = [];
    let finalTicketList = [];
    for (const workflow of listWorkflowResponse.data) {
      if (workflow.type === "SpinalSystemServiceTicket") {
        const treeWorkflowResponse = await HTTP.get(
          `building/${buildingId}/workflow/${workflow.dynamicId}/tree`
        );
        for (const process of treeWorkflowResponse.data.children) {
          if (process.type === "SpinalServiceTicketProcess") {
            ticketList = [];
            totalNumberOfTickets = 0;
            for (const step of process.children) {
              if (
                step.name !== "Clôturée" &&
                step.name !== "Refusée" &&
                step.name !== "Archived"
              ) {
                ticketList = step.children;
                for (let i = 0; i < step.children.length; i++) {
                  finalTicketList.push(step.children[i]);
                }
                totalNumberOfTickets += step.children.length;
              }
            }
            if (totalNumberOfTickets > 0) {
              domains.push({
                dynamicId: process.dynamicId,
                staticId: process.staticId,
                name: process.name,
                type: process.type,
                totalNumberOfTickets: totalNumberOfTickets,
                ticketList: ticketList,
                color: colors[colorIndex],
              });
              colorIndex++;
            }
          }
        }
      }
    }

    const ticketPromises = finalTicketList.map(async (t) => {
      const readDetailsResponse = await HTTP.get(
        `building/${buildingId}/ticket/${t.dynamicId}/read_details`
      );
      if (readDetailsResponse.data.log_list.length == 0)
        return {
          building: buildingId,
          domain: readDetailsResponse.data.process.name,
          name: readDetailsResponse.data.userName,
          step: readDetailsResponse.data.step.name,
          date: 0,
          formatDate: {
            week: moment(0).format("DDMMYYYY"),
            month: moment(0).format("DDMMYYYY"),
            year: moment(0).format("MM YYYY"),
            decade: moment(0).format("YYYY"),
          },
        };
      return {
        building: buildingId,
        domain: readDetailsResponse.data.process.name,
        name:
          readDetailsResponse.data.userName !== ""
            ? readDetailsResponse.data.userName
            : "N.C",
        step: readDetailsResponse.data.step.name,
        date: readDetailsResponse.data.log_list[0].date,
        formatDate: {
          week: moment(readDetailsResponse.data.log_list[0].date).format(
            "DDMMYYYY"
          ),
          month: moment(readDetailsResponse.data.log_list[0].date).format(
            "DDMMYYYY"
          ),
          year: moment(readDetailsResponse.data.log_list[0].date).format(
            "MM YYYY"
          ),
          decade: moment(readDetailsResponse.data.log_list[0].date).format(
            "YYYY"
          ),
        },
      };
    });

    const ticketListStream = await Promise.all(ticketPromises);

    return {
      domains: domains,
      ticketList: ticketListStream,
    };
  } catch (error) {
    return null;
  }
}

export async function getData(buildings) {
  const colors = [
    "#FF4A3B",
    "#93876E",
    "#74BDCB",
    "#EFE7BC",
    "#FFA384",
    "#E7F2F8",
    "#ECF87F",
    "#B99095",
    "#93B9B8",
    "#FDA649",
    "#050533",
    "#0D698B",
    "#29A0B1",
    "#FFAEBC",
    "#B4F8C8",
    "#FBE7C6",
    "#3D5B59",
    "#A0E7E5",
  ];
  let colorIndex = 0;
  const tickets = { domains: [], ticketList: [] };
  for (const building of buildings) {
    const result = await getBuildingData(building.id, colors, colorIndex);
    if (!result) continue;
    tickets.domains = tickets.domains.concat(result.domains);
    tickets.ticketList = tickets.ticketList.concat(result.ticketList);
  }
  return tickets;
}

async function ticketsCreatedtodayOnBuilding(buildingId) {
  let todaysDate = moment().valueOf();
  ticketList = [];
  finalTicketList = [];
  let listWorkflowResponse;
  try {
    listWorkflowResponse = await HTTP.get(
      `building/${buildingId}/workflow/list`
    );
  } catch {
    return 0;
  }
  for (const workflow of listWorkflowResponse.data) {
    const data = {
      beginDate: moment(todaysDate).startOf("day").format("DD MM YYYY"),
      endDate: moment(todaysDate)
        .add(1, "days")
        .startOf("day")
        .format("DD MM YYYY"),
      contextId: workflow.dynamicId,
    };

    const todaysTickets = await HTTP.post(
      `building/${buildingId}/find_node_in_context_by_date`,
      data
    );

    const ticketPromises = todaysTickets.data.map(async (t) => {
      if (t.type === "SpinalSystemServiceTicketTypeTicket") {
        const readDetailsResponse = await HTTP.get(
          `building/${buildingId}/ticket/${t.dynamicId}/read_details`
        );

        if (
          moment(
            readDetailsResponse.data &&
              readDetailsResponse.data.log_list[0] &&
              readDetailsResponse.data.log_list[0].date
          ).isBetween(
            moment(todaysDate).startOf("day").valueOf(),
            moment(todaysDate).endOf("day").valueOf()
          )
        ) {
          return 1; // increment counter by 1
        } else {
          return 0; // don't increment counter
        }
      }
      return 0;
    });
    const ticketListStream = await Promise.all(ticketPromises);
    const todaysCounter = ticketListStream.reduce((a, cv) => a + cv, 0);
    return todaysCounter;
  }
}

export async function ticketsCreatedtoday(buildings) {
  ticketList = [];
  finalTicketList = [];
  const created = [];
  for (const building of buildings) {
    const tickets = await ticketsCreatedtodayOnBuilding(building.id);
    created.push(tickets);
  }
  return created.reduce((e1, e2) => e1 + e2, 0);
}

async function ticketsCreatedOnBuilding(
  buildingId,
  beginDate,
  endDate,
  bd,
  ed
) {
  let listWorkflowResponse;
  try {
    listWorkflowResponse = await HTTP.get(
      `building/${buildingId}/workflow/list`
    );
  } catch {
    return 0;
  }
  for (const workflow of listWorkflowResponse.data) {
    const data = {
      beginDate: beginDate,
      endDate: endDate,
      contextId: workflow.dynamicId,
    };

    let todaysTickets;
    try {
      todaysTickets = await HTTP.post(
        `building/${buildingId}/find_node_in_context_by_date`,
        data
      );
    } catch {
      return 0;
    }

    const ticketPromises = todaysTickets.data.map(async (t) => {
      try {
        if (t.type !== "SpinalSystemServiceTicketTypeTicket") return 0;
        const readDetailsResponse = (
          await HTTP.get(
            `building/${buildingId}/ticket/${t.dynamicId}/read_details`
          )
        ).data;
        return moment(readDetailsResponse.creationDate).isBetween(bd, ed)
          ? 1
          : 0;
      } catch {
        return 0;
      }
    });

    const ticketListStream = await Promise.all(ticketPromises);
    const todaysCounter = ticketListStream.reduce((a, cv) => a + cv, 0);
    return todaysCounter;
  }
}

export async function ticketsCreated(timestamp, period, buildings) {
  selectedTempoTicketsText = "";
  let todaysCounter = 0;
  let nowDate = moment(timestamp).valueOf();
  let currentDate = moment().valueOf();
  unit = "";
  let bd, ed;
  let beginDate;
  let endDate;
  if (period === "Semaine") {
    unit = "week";
    bd = moment(nowDate).startOf(unit);
    ed = moment(nowDate).endOf(unit);
    beginDate = moment(nowDate).startOf(unit).format("DD MM YYYY");
    endDate = moment(currentDate).endOf(unit).format("DD MM YYYY");
    selectedTempoTicketsText =
      "créés entre le " +
      moment(nowDate).startOf(unit).format("DD MMM") +
      " et " +
      moment(nowDate).endOf(unit).format("DD MMM");
  } else if (period === "Mois") {
    unit = "month";
    bd = moment(nowDate).startOf(unit);
    ed = moment(nowDate).endOf(unit);
    beginDate = moment(nowDate).startOf(unit).format("DD MM YYYY");
    endDate = moment(currentDate).endOf(unit).format("DD MM YYYY");
    selectedTempoTicketsText = "créés en " + bd.format("MMMM YYYY");
  } else if (period === "Année") {
    unit = "year";
    bd = moment(nowDate).startOf(unit);
    ed = moment(nowDate).endOf(unit);
    beginDate = moment(nowDate).startOf(unit).format("DD MM YYYY");
    endDate = moment(currentDate).endOf(unit).format("DD MM YYYY");
    selectedTempoTicketsText = "créés en " + bd.format("YYYY");
  } else if (period === "Décennie") {
    unit = "year";
    bd = moment(nowDate).add(-9, "years").startOf(unit);
    ed = moment(nowDate).endOf(unit);
    beginDate = moment(nowDate)
      .add(-9, "years")
      .startOf(unit)
      .format("DD MM YYYY");
    endDate = moment(currentDate).endOf(unit).format("DD MM YYYY");
    selectedTempoTicketsText =
      "créés entre " +
      bd.format("YYYY") +
      " et " +
      moment(currentDate).endOf(unit).format("YYYY");
  }
  for (const building of buildings) {
    todaysCounter += await ticketsCreatedOnBuilding(
      building.id,
      beginDate,
      endDate,
      bd,
      ed
    );
  }
  return [todaysCounter, selectedTempoTicketsText];
}
