
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

  const result = workflowList.map(workflow => {
    const processes = processList.filter(process => process.workflowId === workflow.workflowId);
    return {
      ...workflow,
      processes: processes.map(process => {
        const steps = stepList.filter(step => step.processId === process.processId);
        return {
          ...process,
          ticketList: ticketList.filter(ticket => steps.some(step => step.stepId === ticket.stepId)),
        };
      }),
    };
  });

  return {
    flat: ticketList,
    nested: result,
  };
}

