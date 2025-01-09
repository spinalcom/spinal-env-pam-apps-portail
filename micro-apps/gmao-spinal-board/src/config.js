
export default {
  config: {
    steps: [
      {
        name: 'Attente de lect.avant Execution',
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
        name: 'Archivée',
        icon: 'mdi-archive',
        defaultColor: '#c4c4c4',
      },
    ],
  },
}

