import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr';

export async function getBuilding() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/building/read`);
  return result.data;
}

export function curveData(period, timestamp, domain, list) {
  let cardsData = {
    todaysTickets: 0,
    onGoingTickets: 0,
    selectedTempoTickets: 0,
    selectedTempoTicketsText: '',
  };
  let todaysDate = moment().format('DDMMYYYY');
  for (let i = 0; i < list.length; i++) {
    if (list[i].formatDate.week == todaysDate) {
      cardsData.todaysTickets += 1;
    }
    // if (list[i].step === 'Réalisation partielle' || list[i].step === 'Attente de lect.avant Execution' || list[i].step === 'Attente de réalisation') {
    //   cardsData.onGoingTickets += 1;
    // }
  }
  let barChartDataObject = {
    labels: [],
    data: [
      {
        label: 'Attente de lect.avant Execution',
        backgroundColor: '#14202c',
        data: []
      },
      {
        label: 'Attente de réalisation',
        backgroundColor: '#846f1a',
        data: []
      },
      {
        label: 'Réalisation partielle',
        backgroundColor: '#e423a5',
        data: []
      }
    ]
  }
  let ticketList = [];
    for(let i = 0; i < list.length; i++) {
      if (list[i].domain === domain || domain === 'Tous les domaines')
        ticketList.push(list[i]);
    }
  if (period === 'Semaine') {
    var startOfWeek = moment(timestamp).startOf('week');
    var endOfWeek = moment(timestamp).endOf('week');
    var exactDate = [];
    var currentDay = moment(startOfWeek);
    while (currentDay.isSameOrBefore(endOfWeek)) {
      exactDate.push(currentDay.format('DDMMYYYY'));
      barChartDataObject.labels.push(currentDay.format('DD MMM'));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
      currentDay.add(1, 'day');
    }

    let index = 0;
    cardsData.selectedTempoTicketsText = 'créés entre le ' + startOfWeek.format('DD MMM') + ' et ' + endOfWeek.format('DD MMM') ;
    for (let i = 0; i < ticketList.length; i++) {
      console.log('ticket date:', ticketList[i].date);
      let formattedDate = moment(ticketList[i].date).format('DDMMYYYY');
      console.log('formatted date:', formattedDate);
      index = exactDate.findIndex((date) => date === formattedDate);
      if (index != -1) {
        if (ticketList[i].step ===  'Attente de lect.avant Execution') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Attente de réalisation') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Réalisation partielle') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }
    
    return [barChartDataObject, cardsData]
  } 
  else if (period === 'Mois') {
    var startOfMonth = moment(timestamp).startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var exactDate = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      exactDate.push(currentDay.format('DDMMYYYY'));
      barChartDataObject.labels.push(currentDay.format('DD MMM'));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
      currentDay.add(1, 'day');
    }
    let index = 0;
    cardsData.selectedTempoTicketsText = 'créés en ' + startOfMonth.format('MMMM YYYY');
    for (let i = 0; i < ticketList.length; i++) {
      let formattedDate = moment(ticketList[i].date).format('DDMMYYYY');
      index = exactDate.findIndex((date) => date === formattedDate);
      if (index != -1) {
        if (ticketList[i].step ===  'Attente de lect.avant Execution') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Attente de réalisation') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Réalisation partielle') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }
    return [barChartDataObject, cardsData]
  } 
  else if (period === 'Année') {
    var exactDate = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      exactDate.push(currentMonth.format('MMM YYYY'));
      barChartDataObject.labels.push(currentMonth.format('MMM YYYY'));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
    }
    let index = 0;
    cardsData.selectedTempoTicketsText = 'créés en ' + currentMonth.format('YYYY');
    for (let i = 0; i < ticketList.length; i++) {
      let formattedDate = moment(ticketList[i].date).format('MMM YYYY');
      index = exactDate.findIndex((date) => date === formattedDate);
      if (index != -1) {
        if (ticketList[i].step ===  'Attente de lect.avant Execution') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Attente de réalisation') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Réalisation partielle') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }
    return [barChartDataObject, cardsData]
  } 
  else if (period === 'Décennie') {
    var exactDate = [];
    for (var i = -9; i <= 0; i++) {
      var currentYear = moment(timestamp).add(i, 'years');
      exactDate.push(currentYear.format('YYYY'));
      barChartDataObject.data[0].data.push(0);
      barChartDataObject.data[1].data.push(0);
      barChartDataObject.data[2].data.push(0);
      barChartDataObject.labels.push(currentYear.format('YYYY'));
    }
    let index = 0;
    cardsData.selectedTempoTicketsText = 'créés entre ' + exactDate[0] + ' et ' + exactDate[9];
    for (let i = 0; i < ticketList.length; i++) {
      let formattedDate = moment(ticketList[i].date).format('YYYY');
      index = exactDate.findIndex((date) => date === formattedDate);
      if (index != -1) {
        if (ticketList[i].step ===  'Attente de lect.avant Execution') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[0].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Attente de réalisation') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[1].data[index] += 1;
        }
        else if (ticketList[i].step ===  'Réalisation partielle') {
          cardsData.onGoingTickets += 1;
          barChartDataObject.data[2].data[index] += 1;
        }
      }
    }
    return [barChartDataObject, cardsData]
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
              if (step.name !== 'Clôturée' && step.name !== 'Refusée' &&  step.name !== 'Archived') {
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
    console.log('Number total of tickets:');
    console.log(domains.reduce((a, b) => a + b.totalNumberOfTickets, 0));

    const ticketPromises = finalTicketList.map(async t => {
      const readDetailsResponse = await HTTP.get(
        `building/${buildingId}/ticket/${t.dynamicId}/read_details`
      );
      return {
        domain: readDetailsResponse.data.process.name,
        name: readDetailsResponse.data.userName,
        step: readDetailsResponse.data.step.name,
        date: readDetailsResponse.data.log_list[0].date,
        formatDate: {
          week: moment(readDetailsResponse.data.log_list[0].date).format('DDMMYYYY'),
          month: moment(readDetailsResponse.data.log_list[0].date).format('DDMMYYYY'),
          year: moment(readDetailsResponse.data.log_list[0].date).format('MM YYYY'),
          decade: moment(readDetailsResponse.data.log_list[0].date).format('YYYY')
        }
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
