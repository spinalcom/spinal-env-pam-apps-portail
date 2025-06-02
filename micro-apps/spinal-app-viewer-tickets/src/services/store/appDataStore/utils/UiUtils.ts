// src/utils/UiUtils.ts

/**
 * Calculates gradient angles based on ticket priority distribution.
 * @param countFloorList - An array of ticket counts for each priority [Low, Medium, High]
 * @returns { firstStep, lastStep } representing angles for the conic gradient
 */
export function computePriorityGradient(countFloorList: number[]) {
  const len = countFloorList.reduce((sum, num) => sum + num, 0) || 1; // Avoid division by zero
  const low = countFloorList[2] || 0; // Priority 2 (Red)
  const mid = countFloorList[1] || 0; // Priority 1 (Orange)

  const firstStep = Math.round(360 * (low / len)); // Red section
  const lastStep = firstStep + Math.round(360 * (mid / len)); // Orange section

  return {
    firstStep,
    lastStep,
  };
}

export function computeStepsGradient(data: { step?: { color?: string } }[]) {
  const len = data.length;
  if (!len) return { conic: "", steps: [] };

  const anglePerStep = 360 / len;
  let currentAngle = 0;

  const gradientSteps = data.map((d) => {
    const color = d.step?.color || "#000"; // default fallback
    const start = currentAngle;
    const end = currentAngle + anglePerStep;
    currentAngle = end;
    return { color, start, end };
  });

  const conic = gradientSteps
    .map((step) => `${step.color} ${step.start}deg ${step.end}deg`)
    .join(", ");

  return {
    conic: `conic-gradient(${conic})`,
    steps: gradientSteps,
  };
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 0:
      return "red";
    case 1:
      return "orange";
    case 2:
      return "green";
    default:
      return "gray";
  }
}
export function resizeWindow(): void {
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 1);
}
