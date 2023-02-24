import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr';

export async function getBuilding() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/building/read`);
  return result.data;
}

export function curveData(period, timestamp, domain, list) {
  console.log(domain);
  let ticketList = [];
  if (domain !== 'Tous les domains') {
    for(const ticket in list) {
      if (ticket.domain === domain)
        ticketList.push(ticket);
    }
  }
  else {
    ticketList = list;
  }
  list = [];
  if (period === 'Semaine') {
    var startOfWeek = moment(timestamp).startOf('week');
    var endOfWeek = moment(timestamp).endOf('week');
    var daysInWeek = [];
    var currentDay = moment(startOfWeek);
    while (currentDay.isSameOrBefore(endOfWeek)) {
      daysInWeek.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    return [daysInWeek];
  } 
  else if (period === 'Mois') {
    var startOfMonth = moment(timestamp).startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var daysInMonth = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    console.log(daysInMonth);
    return [daysInMonth];
  } 
  else if (period === 'Année') {
    var monthsInYear = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      monthsInYear.push(currentMonth.format('MMM YYYY'));
    }
    console.log(monthsInYear);
    return [monthsInYear];
  } 
  else if (period === 'Décennie') {
    var yearsInDecade = [];
    for (var i = -9; i <= 0; i++) {
      var currentYear = moment(timestamp).add(i, 'years');
      yearsInDecade.push(currentYear.format('YYYY'));
    }
    return [yearsInDecade];
  }
}

export async function getData() {
  const buildingId = localStorage.getItem("idBuilding");
  try {
    const listWorkflowResponse = await HTTP.get(`building/${buildingId}/workflow/list`);
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
              if (step.name !== "Clôturée" && step.name !== "Refusée" && step.name !== "Archived") {
                ticketList = step.children;
                for (let i = 0; i < step.children.length; i++) 
                  finalTicketList.push(step.children[i]);
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
                ticketList: ticketList
              });
            }
          }
        }


      }
    }
    // console.log('Domains:');
    // console.log(domains);
    // console.log('Number total of tickets:');
    // console.log(domains.reduce((a, b) => a + b.totalNumberOfTickets, 0));

    const ticketPromises = finalTicketList.map(async t => {
      const readDetailsResponse = await HTTP.get(
        `building/${buildingId}/ticket/${t.dynamicId}/read_details`
      );
      return {
        domain: readDetailsResponse.data.process.name,
        name: readDetailsResponse.data.userName,
        step: readDetailsResponse.data.step.name,
        date: readDetailsResponse.data.log_list[0].date
      };
    });
    
    const ticketListStream = await Promise.all(ticketPromises);
    
    return {
      domains: domains,
      ticketList: ticketListStream
    };
      // for (let i = 0; i < finalTicketList.length; i++) {
      //   const readDetailsResponse = await HTTP.get(
      //     `building/${buildingId}/ticket/${finalTicketList[i].dynamicId}/read_details`
      //   );
      //   // console.log(readDetailsResponse.data)
      //   finalTicketList[i] = {
      //     domain: readDetailsResponse.data.process.name,
      //     name: readDetailsResponse.data.userName,
      //     step: readDetailsResponse.data.step.name,
      //     date: readDetailsResponse.data.log_list[0].date
      //   }
      // }
    // return {
    //   domains: domains,
    //   ticketList: finalTicketList
    // }
  } catch (error) {
    console.error(error);
    return null;
  } 
}
