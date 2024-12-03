
import workflow from './workflow';
import process from './process';
import step from './step';
import ticket from './ticket';

export default async function () {
  const bid = localStorage.getItem('idBuilding');

  const workflowList = await workflow.list(bid);
  const processList = await process.getProcesses(bid, workflowList);
  const stepList = await step.getSteps(bid, processList);
  const ticketList = await ticket.getTickets(bid, stepList);

  return ticketList;
}

