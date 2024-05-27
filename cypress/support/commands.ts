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

// * Vuex
import Vuex from "vuex";
// * Store - Context Group - Micro-Applications
import { store } from "../../micro-apps/spinal-context-group/src/services/store/index";

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
  options.store = options.store || store;

  options.extensions = options.extensions || {};
  options.extensions.plugins = options.extensions.plugins || [];
  options.extensions.plugins.push(Vuex);
  return mount(
    { render: (h) => h(VApp, [h(component as Component, options)]) },
    options
  );
});

registerCommandEditGroup();
