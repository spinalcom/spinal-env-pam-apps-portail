
import { HTTP } from "../http-constants";

async function list(bid) {

  const workflowList = await HTTP
    .get(`/building/${bid}/workflow/list`);

  return workflowList.data.map( wf => ({
    workflowName: wf.name,
    workflowId: wf.dynamicId,
  }));
}

const workflow = {
  list,
}

export default workflow;

