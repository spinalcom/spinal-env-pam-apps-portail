
import { HTTP } from '../http-constants';
batchSize = 100;
async function getTickets(bid, stepList) {
  const chunks = chunkArray(stepList, batchSize);

  const getTicketsPromises = chunks
    .map(chunk => getMultipleTickets(bid, chunk));

  const ticketList = await Promise.all(getTicketsPromises);
  console.log(ticketList);
  const constructedTickets = constructTickets(ticketList.flat());

  const results = await getEndDate(bid, constructedTickets);
  results[3].startDate = null;
  results[3].endDate = null;
  // results[3].endDate = 1681344956543;
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
      startDate: ticket.creationDate,
      endDate: null,
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

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function getEndDate(bid, constructed) {
  const END_STATES = ["Archived", "Clôturée", "Solved"]

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

