
import { HTTP } from "../http-constants";

async function processProcessesSteps(bid, process) {
  const stepList = await HTTP
    .get(`/building/${bid}/workflow/${process.workflowId}/process/${process.processId}/stepList`);
  return stepList.data.map(s => ({
    ...process,
    stepId: s.dynamicId,
    stepName: s.name
  }));
}

async function getSteps(bid, processList) {
  const processListStepsPromises = processList
    .map(process => processProcessesSteps(bid, process));

  const stepList = await Promise.all(processListStepsPromises);

  const uniqueSteps = new Set();
  stepList.forEach(steps => steps.forEach(step => uniqueSteps.add(step.stepName)));
  return stepList.flat();
}

const step = {
  getSteps,
};

export default step;

