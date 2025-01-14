
export default {
  config: {
    workflow: [
      {
        name: 'Demande d\'intervention',
        steps: [
          {
            name: 'Attente de lect.avant Execution',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
          {
            name: 'Attente de réalisation',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
          {
            name: 'Réalisation partielle',
            icon: 'mdi-progress-helper',
            defaultColor: '#c4c4c4',
            start: true,
          },
          {
            name: 'Clôturée',
            icon: 'mdi-check-circle',
            defaultColor: '#c4c4c4',
            end: true,
          },
          {
            name: 'Refusée',
            icon: 'mdi-close-circle',
            defaultColor: '#c4c4c4',
            end: true,
          },
          {
            name: 'Archivée',
            icon: 'mdi-archive',
            defaultColor: '#c4c4c4',
          },
        ],
      },
      {
        name: 'Tickets Otis',
        steps: [
          {
            name: 'Availabilty',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
          {
            name: 'Maintenability',
            icon: 'mdi-clock',
            defaultColor: '#c4c4c4',
          },
          {
            name: 'Repair',
            icon: 'mdi-progress-helper',
            defaultColor: '#c4c4c4',
          },
          {
            name: 'Customer Call Back',
            icon: 'mdi-check-circle',
            defaultColor: '#c4c4c4',
          },
        ],
      },
    ],
  },
}

