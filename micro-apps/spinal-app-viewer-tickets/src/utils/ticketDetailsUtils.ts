interface Step {
  name: string;
  order: number;
  color: string;
  dynamicId: number;
  processId: string;
  staticId: string;
  type: string;
}

interface Log {
  date: number;
  event?: string;
}

interface Annotation {
  date: number;
  message: string;
  type: string;
  userName: string;
}

interface TimelineItem {
  date: number | null;
  type: "forward" | "backward" | "next" | "other";
  step: Step;
  annotations: Annotation[];
}

type LogParseResult = {
  type: "forward" | "backward";
  toStepName: string;
} | null;

/**
 * Parses log.event to extract direction and target step name.
 */
function parseLogEvent(event?: string): LogParseResult {
  if (!event) return null; // <- prevent undefined match
  const match = event.match(/(Passed|Backward) from (.+?) to (.+)$/);
  if (!match) return null;

  const [, direction, , toStepName] = match;
  return {
    type: direction === "Backward" ? "backward" : "forward",
    toStepName,
  };
}

/**
 * Finds a step by name.
 */
function getStepByName(name: string, steps: Step[]): Step | undefined {
  return steps.find((step) => step.name === name);
}

/**
 * Assigns annotations to timeline items based on date.
 */
function attachAnnotationsToTimeline(
  timeline: TimelineItem[],
  annotations: Annotation[]
): void {
  const sortedAnnotations = [...annotations].sort((a, b) => a.date - b.date);
  let annotationIndex = 0;

  for (let i = 0; i < timeline.length; i++) {
    const currentItem = timeline[i];
    const nextItemDate = timeline[i + 1]?.date ?? Infinity;

    while (
      annotationIndex < sortedAnnotations.length &&
      sortedAnnotations[annotationIndex].date < nextItemDate
    ) {
      currentItem.annotations.push(sortedAnnotations[annotationIndex]);
      annotationIndex++;
    }
  }
}

/**
 * Main timeline generator function.
 */
export function generateTimeline(
  steps: Step[],
  logs: Log[],
  annotations: Annotation[]
): TimelineItem[] {
  if (logs.length === 0 || steps.length === 0) return [];

  const orderedSteps = [...steps].sort((a, b) => a.order - b.order);
  const stepByName = new Map<string, Step>(
    steps.map((step) => [step.name, step])
  );
  const sortedLogs = [...logs].sort((a, b) => a.date - b.date);

  const timeline: TimelineItem[] = [];

  // First timeline item from first log and step with order 0
  const firstStep = orderedSteps.find((step) => step.order === 0);
  if (!firstStep) {
    throw new Error("No step with order 0 found.");
  }
  timeline.push({
    date: sortedLogs[0].date,
    type: "forward",
    step: firstStep,
    annotations: [],
  });

  // Generate timeline items from logs
  for (let i = 1; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    const parsed = parseLogEvent(log.event);
    if (!parsed) continue;

    const targetStep = getStepByName(parsed.toStepName, steps);
    if (!targetStep) continue;

    timeline.push({
      date: log.date,
      type: parsed.type,
      step: targetStep,
      annotations: [],
    });
  }

  // Attach annotations
  attachAnnotationsToTimeline(timeline, annotations);
  // Add future steps (those with higher order)
  const lastOrder = timeline[timeline.length - 1].step.order;

  const futureSteps = steps
    .filter((step) => step.order > lastOrder)
    .sort((a, b) => a.order - b.order);

  for (const step of futureSteps) {
    timeline.push({
      date: null,
      type: "next",
      step,
      annotations: [],
    });
  }

  const negativeSteps = steps.filter((step) => step.order < 0);
  for (const step of negativeSteps) {
    timeline.push({
      date: null,
      type: "other",
      step,
      annotations: [],
    });
  }
  return timeline;
}
