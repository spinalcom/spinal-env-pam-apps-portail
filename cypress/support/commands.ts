/// <reference types="cypress" />

// * Cypress
import { mount } from "cypress/vue2";
import "material-design-icons-iconfont";

// * Vuetify
import { VApp } from "vuetify/lib";
import vuetify from "./vuetify";
import "vuetify/dist/vuetify.css";

// * Vue
import { type Component } from "vue";

// * Commands
import { registerCommandEditGroup } from "./EditGroup";


declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
Cypress.Commands.add("mount", (component, options = {}) => {
  options.vuetify = vuetify;
  return mount(
    { render: (h) => h(VApp, [h(component as Component, options)]) },
    options
  );
});

registerCommandEditGroup();
