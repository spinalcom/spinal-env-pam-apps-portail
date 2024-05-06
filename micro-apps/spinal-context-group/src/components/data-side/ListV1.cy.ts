import ListV1 from './ListV1.vue'

describe('<ListV1 />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(ListV1)
  })
})