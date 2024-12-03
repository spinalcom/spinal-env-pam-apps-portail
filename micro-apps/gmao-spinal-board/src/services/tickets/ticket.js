
import { HTTP } from '../http-constants';

async function getTickets(bid, stepList) {
  const batchSize = 20;
  const chunks = chunkArray(stepList, batchSize);

  const getTicketsPromises = chunks
    .map(chunk => getMultipleTickets(bid, chunk));

  const ticketList = await Promise.all(getTicketsPromises);

  return constructTickets(ticketList.flat());
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

const ticket = {
  getTickets,
};

export default ticket;

