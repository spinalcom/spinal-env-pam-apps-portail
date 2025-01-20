
import { HTTP } from '../http-constants';
import dates from './dates.js';
import { chunkArray } from './utils.js';
import config from '../../config.js';

batchSize = 100;
async function getTickets(bid, stepList) {
  const chunks = chunkArray(stepList, batchSize);

  const getTicketsPromises = chunks
    .map(chunk => getMultipleTickets(bid, chunk));

  const ticketList = await Promise.all(getTicketsPromises);
  const constructedTickets = constructTickets(ticketList.flat());

  // const results = await addDates(bid, constructedTickets);
  const results = await getEndDate(bid, constructedTickets);
  const filledDates = await dates.getAttributes(bid, results);
  return results;
}

async function getMultipleTickets(bid, stepList) {
  const stepIdList = stepList.map(step => step.stepId);
  const ticketList = await HTTP
    .post(`/building/${bid}/node/ticket_list_multiple`, stepIdList);
  return ticketList.data;
}

function constructTickets(ticketList) {
  return ticketList.flatMap(list =>
    list.tickets.map(ticket => ({
      name: ticket.name,
      dates: [
        { name: 'Date de début estimée', value: null },
        { name: 'Date de fin estimée', value: null },
        { name: 'Aucne date de début', value: null },
        { name: 'Aucne date de fin', value: null },
      ],
      status: ticket.step.name,
      workflowId: ticket.workflowId,
      workflowName: ticket.workflowName,
      processId: ticket.process.dynamicId,
      processName: ticket.process.name,
      stepId: ticket.step.dynamicId,
      ticketId: ticket.dynamicId,
      state: 'ticket',
    }))
  );
}

async function getEndDate(bid, constructed) {
  const endSteps = getEndSteps();

  const taskIds = constructed.map(task => task.ticketId);
  const chunkedTaskIds = chunkArray(taskIds, batchSize);

  const taskLogs = await Promise.all(
    chunkedTaskIds.map(async chunk => {
      const logs = await HTTP
        .post(`/building/${bid}/ticket/read_details_multiple`, chunk);
      return logs.data;
    })
  );

  const ticketDetails = taskLogs.flat();

  ticketDetails.forEach((detail) => {
    const task = constructed.findIndex(t => t.ticketId === detail.dynamicId);
    if (task === -1) {
      return;
    }
    constructed[task].dates = addDates(constructed[task], detail.log_list);
    constructed[task].dates = [...constructed[task].dates, ...getRealDates(constructed[task].dates)];
    getRealDates(constructed[task].dates);
  });

  return constructed;
}

/**
  * Get the real start and end dates of a ticket.
  * @param {ticket} ticket Ticket
  * @param {array} logs List of logs
  * @returns [{name: string, value: string}] List of dates
  */
function getRealDates(dates) {
  try {
    const { starts, ends, workflow } = config.config;
    const startSteps = workflow.flatMap(w => w.steps.filter(s => starts.includes(s.id)));
    const endSteps = workflow.flatMap(w => w.steps.filter(s => ends.includes(s.id)));
    const startDate = dates.find(date => startSteps.some(step => step.name === date.name));
    const start = { name: 'Date de début réelle', value: startDate ? startDate.value : null };
    const endDate = dates.find(date => endSteps.some(step => step.name === date.name));
    const end = { name: 'Date de fin réelle', value: endDate ? endDate.value : null };
    return [start, end];
  } catch (error) {
    console.error('Error getting real dates', error);
    const start = { name: 'Date de début réelle', value: null };
    const end = { name: 'Date de fin réelle', value: null };
    return [start, end];
  }
}

/**
  * Add non existing steps to the dates array.
  * for existing ones, check config file if we should keep the first or last date.
  * @param {ticket} ticket Ticket
  * @param {array} logs List of logs
  */
function addDates(ticket, logs) {
  const {
    lastPriority,
    workflow,
  } = config.config;
  // Find the current workflow of the ticket in the config file
  const currentWorkflow = workflow.find(w => w.name === ticket.workflowName);
  if (!currentWorkflow || !logs || logs.length === 0) {
    return ticket.dates;
  }
  const steps = currentWorkflow.steps;
  const dates = ticket.dates;
  /**
    * For each log, check if the step exists in the dates array
    * If it does not, add it
    * If it does, check if it is a first or last priority step
    * If it is a first priority step, do nothing
    * If it is a last priority step, update the date
    */
  logs.forEach(log => {
    if (log.event === 'created') {
      return;
    }
    const stepNameFromLog = log.event.split(' to ')[1];
    const doesLogExist = dates.findIndex(date => date.name === stepNameFromLog);
    if (doesLogExist === -1) {
      dates.push({
        name: stepNameFromLog,
        value: log.date,
      });
    } else {
      const stepFromConfig = steps.find(step => step.name === stepNameFromLog);
      if (stepFromConfig && lastPriority.includes(stepFromConfig.id)) {
        dates[doesLogExist].value = log.date || null;
      }
    }
  });
  return dates;
}

/**
  * Get end step names for a given workflow
  * @returns {array} endSteps
  */
function getEndSteps() {
  try {
    const { ends, workflow } = config.config;
    return workflow
      .flatMap(w => 
        w.steps.filter(s => ends.includes(s.id))
      )
      .map(s => s.name);
  } catch (error) {
    console.error('Error getting end steps', error);
    return [];
  }
}

const ticket = {
  getTickets,
};

export default ticket;

