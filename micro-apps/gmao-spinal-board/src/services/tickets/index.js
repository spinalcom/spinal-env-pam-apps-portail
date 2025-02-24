
import workflow from './workflow';
import process from './process';
import step from './step';
import ticket from './ticket';

async function getAll() {
  const bid = localStorage.getItem('idBuilding');

  const workflowList = await workflow.list(bid);
  const processList = await process.getProcesses(bid, workflowList);
  const stepList = await step.getSteps(bid, processList);
  const ticketList = await ticket.getTickets(bid, stepList);

  const result = workflowList.map(workflow => {
    const processes = processList.filter(process => process.workflowId === workflow.workflowId);
    return {
      ...workflow,
      type: 'workflow',
      state: 'open',
      processes: processes.map(process => {
        const steps = stepList.filter(step => step.processId === process.processId);
        return {
          ...process,
          type: 'process',
          state: 'open',
          ticketList: ticketList.filter(ticket => steps.some(step => step.stepId === ticket.stepId)),
        };
      }),
    };
  });

  const nested = removeProcessWithNoTickets(result);

  return {
    flat: ticketList,
    nested,
  };
}

function removeProcessWithNoTickets(workflowList) {
  return workflowList.map(workflow => {
    const processes = workflow.processes.filter(process => process.ticketList.length > 0);
    return {
      ...workflow,
      processes,
    };
  });
}

const ticketService = {
  getAll,
  removeProcessWithNoTickets,
};

export default ticketService;

