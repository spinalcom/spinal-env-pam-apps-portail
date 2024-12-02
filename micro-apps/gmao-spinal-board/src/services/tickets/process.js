
import { HTTP } from "../http-constants";

async function processWorkflowProcesses(bid, workflow) {
  try {
    const processList = await HTTP
      .get(`/building/${bid}/workflow/${workflow.workflowId}/processlist`);

    if (!processList.data) {
      throw new Error('Invalid response structure');
    }
    
    return processList.data.map(process => ({
      ...workflow,
      processId: process.dynamicId,
      processName: process.name,
    }));
  } catch (error) {
    console.error(`Error processing workflow ${workflow.workflowId}`, error);
    return [];
  }
}

async function getProcesses(bid, workflowList) {
  const workflowProcessesPromises = workflowList
    .map(w => processWorkflowProcesses(bid, w));

  const processList = await Promise.all(workflowProcessesPromises);

  return processList.flat();
}

const process = {
  getProcesses,
};

export default process;

