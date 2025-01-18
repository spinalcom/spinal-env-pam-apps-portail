
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
      dates: [],
      estimatedStartDate: null,
      estimatedEndDate: null,
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
  const END_STATES = ["Archived", "Clôturée", "Solved"];

  const completedTaskIds = constructed
    .filter(task => END_STATES.includes(task.status))
    .map(task => task.ticketId);

  const ticketDetails = await HTTP
    .post(`/building/${bid}/ticket/read_details_multiple`, completedTaskIds);

  ticketDetails.data.forEach((detail) => {
    const lastStepDate = detail.log_list[detail.log_list.length - 1].date;
    const ticket = constructed.find( task => task.ticketId === detail.dynamicId);
    ticket.endDate = lastStepDate;
  });

  return constructed;
}

const ticket = {
  getTickets,
};

export default ticket;

