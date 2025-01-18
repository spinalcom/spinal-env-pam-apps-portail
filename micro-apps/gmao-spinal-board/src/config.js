
export default {
  config: {
    similarSteps: [
      [0, 5],
      [3, 6]
    ],
    firstPriority: [0, 1, 2, 5],
    lastPriority: [3, 4, 6],
    starts: [2, 5],
    ends: [3, 6],
    workflow: [
      {
        name: 'Demande d\'intervention',
        steps: [
          {
            id: 0,
            name: 'Attente de lect.avant Execution',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
          {
            id: 1,
            name: 'Attente de réalisation',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
          {
            id: 2,
            name: 'Réalisation partielle',
            icon: 'mdi-progress-helper',
            defaultColor: '#c4c4c4',
          },
          {
            id: 3,
            name: 'Clôturée',
            icon: 'mdi-check-circle',
            defaultColor: '#c4c4c4',
          },
          {
            id: 4,
            name: 'Refusée',
            icon: 'mdi-close-circle',
            defaultColor: '#c4c4c4',
          },
        ],
      },
      {
        name: 'Tickets Otis',
        steps: [
          {
            id: 5,
            name: 'Raised',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
          {
            id: 6,
            name: 'Solved',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
        ],
      },
    ],
  },
}

