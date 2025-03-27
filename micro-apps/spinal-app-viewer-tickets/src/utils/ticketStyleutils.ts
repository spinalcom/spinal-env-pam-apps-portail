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
