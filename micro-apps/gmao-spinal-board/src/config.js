
export default {
  config: {
    showArchive: true,
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
            type: 'start',
          },
          {
            id: 3,
            name: 'Clôturée',
            icon: 'mdi-check-circle',
            defaultColor: '#c4c4c4',
            type: 'end',
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
            id: 0,
            name: 'Raised',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
            type: 'start',
          },
          {
            id: 3,
            name: 'Solved',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
            type: 'end',
          },
        ],
      },
    ],
  },
}

