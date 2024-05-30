module.exports = {
  workflowList: ["Ticket Mission"],
  dashboardTitle: "Historique des tickets",
  controlPointProfil: {
    name: "Maintenance Control Points",
    endpoints: [
      {
        name: "Nombre de tickets créés",
        color: "rgba(255,0,11,1)",
      },
      {
        name: "Nombre de tickets en cours",
        color: "rgba(20,32,44,1)",
      },
      {
        name: "Nombre de tickets résolus",
        color: "rgba(17,237,169,1)",
      },
      {
        name: "Temps de résolution",
        color: "rgba(0,0,255,1)",
      },
    ],
  },
};
