/// <reference types="cypress" />

// * Vuetify
import { VApp } from "vuetify/lib";
import vuetify from "./vuetify";
import "vuetify/dist/vuetify.css";

// * Vue
import { h } from "vue";
import { type Component } from "vue";

// * Enums
import { EGroupType } from "../../../micro-apps/spinal-context-group/src/controllers";

declare global {
  namespace Cypress {
    interface Chainable {
      selectItemEditGroup(name: string, type: EGroupType): Chainable<void>;
      typeSearchBarEditGroup(search: string, type: EGroupType): Chainable<void>;
      clickAddBtnEditGroup(type: EGroupType): Chainable<void>;
      deleteListItemEditGroup(name: string, type: EGroupType): Chainable<void>;
      addGrpCtxEditGroup(name: string): Chainable<void>;
      addGrpCategoryEditGroup(
        name: string,
        nameParent: string,
        icon: string
      ): Chainable<void>;
      deleteGrpCtxEditGroup(name: string): Chainable<void>;
      deleteGrpCategoryEditGroup(
        name: string,
        nameParent: string
      ): Chainable<void>;
      addGrpGroupEditGroup(
        name: string,
        nameParent: string,
        color: string
      ): Chainable<void>;
      deleteGrpGroupEditGroup(
        name: string,
        nameParent: string
      ): Chainable<void>;
      chooseIconEditGroup(icon: string): Chainable<void>;
      chooseColorEditGroup(color: string): Chainable<void>;
    }
  }
}

export function registerCommandEditGroup() {
  Cypress.Commands.add(
    "selectItemEditGroup",
    (name: string, type: EGroupType) => {
      cy.get('[data-cy="listV1"]')
        .eq(type)
        .find('[data-cy="listV1ItemTitle"]', { timeout: 1000 * 10 })
        .contains(name)
        .click();
    }
  );

  Cypress.Commands.add(
    "typeSearchBarEditGroup",
    (search: string, type: EGroupType) => {
      cy.get('[data-cy="listV1"]')
        .eq(type)
        .find('[data-cy="listV1SearchBar"]')
        .first()
        .click()
        .focused()
        .type(search);
    }
  );

  Cypress.Commands.add("clickAddBtnEditGroup", (type: EGroupType) => {
    cy.get('[data-cy="listV1"]')
      .eq(type)
      .find('[data-cy="listV1AddButton"]')
      .first()
      .click();
  });

  Cypress.Commands.add(
    "deleteListItemEditGroup",
    (name: string, type: EGroupType) => {
      cy.get('[data-cy="listV1"]')
        .eq(type)
        .find('[data-cy="listV1ItemTitle"]', { timeout: 1000 * 10 })
        .contains(name)
        .parent()
        .parent()
        .find('[data-cy="listV1ItemMenuButton"]')
        .first()
        .click();
      cy.get('[data-cy="listV1ItemMenuButtonDelete"]').first().click();
      cy.get('[data-cy="listV1DialogDelete"]')
        .find('[data-cy="listV1DialogDeleteConfirmation"]')
        .filter(":visible")
        .first()
        .click();
    }
  );

  Cypress.Commands.add("chooseIconEditGroup", (icon: string) => {
    cy.get('[data-cy="chooseIconModaleAutocomplete"]', { timeout: 1000 * 10 })
      .first()
      .type(icon);
    cy.get('[data-cy="chooseIconModaleRow"]', { timeout: 1000 * 10 })
      .first()
      .click();
    cy.get('[data-cy="simpleModale"]')
      .contains("Choisissez une icon")
      .parent()
      .parent()
      .find('[data-cy="simpleModaleSubmitBtn"]', { timeout: 1000 * 10 })
      .first()
      .click();
  });

  Cypress.Commands.add("chooseColorEditGroup", (color: string) => {
    // cy.get('[data-cy="chooseColorModalePicker"]', {timeout: 1000 * 10});

    cy.get('[data-cy="simpleModale"]')
      .contains("Choisissez une couleur")
      .parent()
      .parent()
      .find('[data-cy="simpleModaleSubmitBtn"]', { timeout: 1000 * 10 })
      .first()
      .click();
  });

  Cypress.Commands.add("addGrpCtxEditGroup", (name: string) => {
    cy.typeSearchBarEditGroup(name, EGroupType.GRP_CONTEXT);
    cy.clickAddBtnEditGroup(EGroupType.GRP_CONTEXT);
    cy.get('[data-cy="listV1"]')
      .eq(EGroupType.GRP_CONTEXT)
      .find('[data-cy="listV1ItemTitle"]')
      .contains(name);
  });

  Cypress.Commands.add(
    "addGrpCategoryEditGroup",
    (name: string, nameParent: string, icon = "mdiAbacus") => {
      cy.selectItemEditGroup(nameParent, EGroupType.GRP_CONTEXT);
      cy.typeSearchBarEditGroup(name, EGroupType.GRP_CATEGORY);
      cy.clickAddBtnEditGroup(EGroupType.GRP_CATEGORY);
      cy.chooseIconEditGroup(icon);
      cy.get('[data-cy="listV1"]')
        .eq(EGroupType.GRP_CATEGORY)
        .find('[data-cy="listV1ItemTitle"]')
        .contains(name);
    }
  );

  Cypress.Commands.add(
    "addGrpGroupEditGroup",
    (name: string, nameParent: string, color = "#ffffff") => {
      cy.selectItemEditGroup(nameParent, EGroupType.GRP_CATEGORY);
      cy.typeSearchBarEditGroup(name, EGroupType.GRP_GROUP);
      cy.clickAddBtnEditGroup(EGroupType.GRP_GROUP);
      cy.chooseColorEditGroup(color);
      cy.get('[data-cy="listV1"]')
        .eq(EGroupType.GRP_GROUP)
        .find('[data-cy="listV1ItemTitle"]')
        .contains(name);
    }
  );

  Cypress.Commands.add("deleteGrpCtxEditGroup", (name: string) => {
    cy.typeSearchBarEditGroup(name, EGroupType.GRP_CONTEXT);
    cy.deleteListItemEditGroup(name, EGroupType.GRP_CONTEXT);
    //cy.get('[data-cy="listV1"]').eq(EGroupType.GRP_CATEGORY).find('[data-cy="listV1ItemTitle"]').contains(name).should('not.exist');
  });

  Cypress.Commands.add(
    "deleteGrpCategoryEditGroup",
    (name: string, nameParent: string) => {
      cy.selectItemEditGroup(nameParent, EGroupType.GRP_CONTEXT);
      cy.typeSearchBarEditGroup(name, EGroupType.GRP_CATEGORY);
      cy.deleteListItemEditGroup(name, EGroupType.GRP_CATEGORY);
      //cy.get('[data-cy="listV1"]').eq(EGroupType.GRP_CATEGORY).find('[data-cy="listV1ItemTitle"]').contains(name).should('not.exist');
    }
  );

  Cypress.Commands.add(
    "deleteGrpGroupEditGroup",
    (name: string, nameParent: string) => {
      cy.selectItemEditGroup(nameParent, EGroupType.GRP_CATEGORY);
      cy.typeSearchBarEditGroup(name, EGroupType.GRP_GROUP);
      cy.deleteListItemEditGroup(name, EGroupType.GRP_GROUP);
      //cy.get('[data-cy="listV1"]').eq(EGroupType.GRP_GROUP).find('[data-cy="listV1ItemTitle"]').contains(name).should('not.exist');
    }
  );
}
