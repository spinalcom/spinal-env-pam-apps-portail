import {
  runningTickets,
  splitByDeclarants,
  splitByDomains,
  splitByPeriode,
} from "../data-management";

function toManageableTicket(ticket: any) {
  return {
    name: ticket.name,
    step: ticket.step.name,
    domain: ticket.process.name,
    creation_date: new Date(ticket.log_list[0].date).toLocaleDateString(),
    last_step_date: new Date(
      ticket.log_list[ticket.log_list.length - 1].date
    ).toLocaleDateString(),
    declarant: ticket.userName || "ADMIN",
  };
}

export function findNode(tree: any, nodeId: number): any {
  if (tree.dynamicId === nodeId) return tree;
  let element: any = undefined;
  if (tree.children)
    tree.children.forEach(
      (child: any) => (element = element || findNode(child, nodeId))
    );
  return element;
}

export function setWorkflows(node: any, workflows: any[]) {
  node.workflows = [];
  workflows.forEach((w) =>
    node.workflows.push({
      dynamicId: w.dynamicId,
      name: w.name,
    })
  );
  if (node.children)
    node.children.forEach((child: any) => setWorkflows(child, workflows));
}

export function setWorkflow(
  node: any,
  workflowId: number,
  tickets: any[]
): Promise<any[]> | any[] {
  let tickets_temp = tickets.filter(
    (t) => !t.elementSelected || t.elementSelected.dynamicId === node.dynamicId
  );

  const found = node.workflows.find((w: any) => w.dynamicId === workflowId);
  if (!found) return tickets_temp;

  const promises = [];
  if (node.children)
    for (const child of node.children)
      promises.push(
        setWorkflow(
          child,
          workflowId,
          tickets.filter((t) => !tickets_temp.includes(t))
        )
      );

  return Promise.all(promises)
    .then((ret) => {
      ret.forEach((tickets) => (tickets_temp = tickets_temp.concat(tickets)));
    })
    .then(() => {
      const managed_tickets = tickets_temp.map((t) => toManageableTicket(t));

      const domains = [{ name: "Tous les domaines" }].concat(
        [...new Set(managed_tickets.map((t: any) => t.domain))].map((d) => ({
          name: d,
        }))
      );

      const steps = [...new Set(managed_tickets.map((t: any) => t.step))];
      const declarants = [
        ...new Set(managed_tickets.map((t: any) => t.declarant)),
      ];

      found.tickets = runningTickets(managed_tickets);

      found.domains = splitByDomains(
        domains,
        steps,
        managed_tickets,
        declarants
      );
      found.steps = steps;
      found.declarants = splitByDeclarants(declarants, managed_tickets);
      found.loaded = true;
    })
    .then(() => {
      return tickets_temp;
    });
}
