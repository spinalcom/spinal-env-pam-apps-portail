
# Workflow List

### **Request**

**Endpoint**: `/workflow/list`

This endpoint retrieves a list of available workflows.

### **Response**

```json
[
  {
    "dynamicId": 74211712,
    "staticId": "SpinalContext-ef6c3e62-e409-af20-f919-8eaef7691f9e-187236d8b1d",
    "name": "Demande d'intervention",
    "type": "SpinalSystemServiceTicket"
  },
  {
    "dynamicId": 474573040,
    "staticId": "5ab0-b105-355a-190ea88533f",
    "name": "Tickets Otis",
    "type": "SpinalSystemServiceTicket"
  }
]
```
This response contains an array of workflows with details like `dynamicId`, `staticId`, `name`, and `type`.

# Workflow Tree

### **Request**

**Endpoint**:  `/workflow/${workflow.dynamicId}/tree`

This endpoint retrieves the structure or "tree" for a specific workflow using its  `dynamicId`.

### **Response**

#### **Model**

```json
{
  "dynamicId": 74211712,
  "staticId": "SpinalContext-ef6c3e62-e409-af20-f919-8eaef7691f9e-187236d8b1d",
  "name": "Demande d'intervention",
  "type": "SpinalSystemServiceTicket",
  "children": [
    {
      "dynamicId": 74209120,
      "staticId": "5bca-f47b-165a-187236e92ea",
      "name": "BATIMENT/SECOND ŒUVRE/CLOS COU",
      "type": "SpinalServiceTicketProcess",
      "color": "#ff00d0",
      "children": [...]
    }
  ]
}
```
#### **Explanation**

-   `dynamicId`: Unique identifier for the workflow.
-   `staticId`: Static identifier of the workflow.
-   `name`: Name of the workflow.
-   `type`: Type of the workflow (e.g., service ticket).
-   `children`: An array of child processes or tickets within the workflow, which may also have their own  `children`.

### **Logic**

1.  **Loop through each workflow process**:
    -   For each process in the workflow tree, check if it is not closed (`cloturee`), rejected (`refusee`), or archived (`archivee`).
2.  **Get Children (Tickets)**:
    -   If the process is still active (not closed, rejected, or archived), retrieve its children (which may represent individual tickets or further processes).

This allows us to dynamically render only the active workflows and their associated tickets, ensuring that we do not show closed or archived workflows.
