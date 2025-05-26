// src/utils/TicketFilterUtils.ts

interface Ticket {
  workflowName: string;
  process: { name: string };
  step: { name: string };
  // ... other fields if needed
}

export function getTicketsWithRank(data: any[], selectedId: number): any[] {
  return data.map((t) =>
    selectedId === t.elementSelected.dynamicId
      ? { ...t, rank: 0 }
      : { ...t, rank: 1 }
  );
}
export function extractSortedSteps(tickets: any[]): any[] {
  const uniqueSteps = new Map();
  tickets.forEach((t) => {
    if (!uniqueSteps.has(t.step.name)) {
      uniqueSteps.set(t.step.name, t.step);
    }
  });
  return [...uniqueSteps.values()].sort((a, b) => a.order - b.order);
}
export function sortTicketsByPriorityDateRank(tickets: any[]): any[] {
  return [...tickets].sort(
    (a, b) =>
      b.lastModifDate - a.lastModifDate ||
      b.creationDate - a.creationDate ||
      b.priority - a.priority ||
      a.rank - b.rank
  );
}

export function filterTickets(
  tickets: Ticket[],
  workflowFilter: string[],
  domainFilter: string[],
  stepFilter: string[]
): Ticket[] {
  let result = tickets;

  if (workflowFilter.length > 0) {
    result = result.filter((t) => workflowFilter.includes(t.workflowName));
  }

  if (domainFilter.length > 0) {
    result = result.filter((t) => domainFilter.includes(t.process.name));
  }

  if (stepFilter.length > 0) {
    result = result.filter((t) => stepFilter.includes(t.step.name));
  }

  return result;
}
