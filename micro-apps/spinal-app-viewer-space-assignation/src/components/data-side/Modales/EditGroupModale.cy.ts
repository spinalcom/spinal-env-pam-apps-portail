import EditGroupModale from "./EditGroupModale.vue";
import { EGroupeType } from "../../../interfaces/IGroupeWithChildren";

describe("EditGroupModale - [BASIC]", () => {
  beforeEach(() => {
    localStorage.setItem("idBuilding", "68a1-5e37-6e16-18e52340dd7");
    localStorage.setItem(
      "token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJuYW1lIjoiYWRtaW4iLCJ0eXBlIjoiQURNSU4iLCJpZCI6IjE0NWUtZDE5MS1iNjgxLTE4ZTUxZmIwZTFiIiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxMjIxOTgzOTA4NiwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzEwNzcyMzkxNDUxLCJ1c2VyTmFtZSI6ImFkbWluIiwidXNlclR5cGUiOiJBRE1JTiJ9LCJpYXQiOjE3MTMyMDQ4MzAsImV4cCI6MTcxMzgwOTYzMH0.fEOcCrfmOv-0Hx4sEHPvhlge80DK9FMkzcxxuIK160Q"
    );
    Cypress.env("SPINAL_API_URL", "http://localhost:2023");
    cy.viewport("macbook-15");
  });

  it("renders", () => {
    cy.mount(EditGroupModale, {
      props: {
        showModal: true,
      },
    });
  });

  it("Can add a Group of context", () => {
    const titleGrpCtx = "My context group";

    cy.mount(EditGroupModale, {
      props: {
        showModal: true,
      },
    });
    // !! Ajouter un groupe de contexte ne marche pas
    cy.addGrpCtxEditGroup(titleGrpCtx);
  });

  it("Can add a group of category", () => {
    const titleGrpCtx = "My context group";
    const titleGrpCategory = "My Category Group2";

    cy.mount(EditGroupModale, {
      props: {
        showModal: true,
      },
    });
    cy.addGrpCategoryEditGroup(titleGrpCategory, titleGrpCtx);
  });

  it("Can delete a group of category", () => {
    const titleGrpCtx = "My context group";
    const titleGrpCategory = "My Category Group2";

    cy.mount(EditGroupModale, {
      props: {
        showModal: true,
      },
    });
    cy.deleteGrpCategoryEditGroup(titleGrpCategory, titleGrpCtx);
  });

  it("Can add a group of group", () => {
    const titleGrpCtx = "My context group";
    const titleGrpCategory = "My Category Group 2";
    const titleGrpGroup = "My Group Group 1";

    // Cypress.on('uncaught:exception', (err, runnable) =>
    // 	true,
    // );
    cy.mount(EditGroupModale, {
      props: {
        showModal: true,
      },
    });
    cy.addGrpCategoryEditGroup(titleGrpCategory, titleGrpCtx);
    cy.addGrpGroupEditGroup(titleGrpGroup, titleGrpCategory);
  });

  it("Can delete a group of group", () => {
    const titleGrpCtx = "My context group";
    const titleGrpCategory = "My Category Group 2";
    const titleGrpGroup = "My Group Group 1";

    // Cypress.on('uncaught:exception', (err, runnable) =>
    // 	true,
    // );
    cy.mount(EditGroupModale, {
      props: {
        showModal: true,
      },
    });
    cy.selectItemEditGroup(titleGrpCtx, EGroupeType.GRP_CONTEXT);
    cy.deleteGrpGroupEditGroup(titleGrpGroup, titleGrpCategory);
  });

  after(() => {
    const titleGrpCtx = "My context group";
    const titleGrpCategory = "My Category Group 2";

    // TODO Remove the following line after the server add grp ctx bug is fixed
    cy.selectItemEditGroup(titleGrpCtx, EGroupeType.GRP_CONTEXT);
    cy.deleteGrpCtxEditGroup(titleGrpCtx);
  });
});

// TODO Verifier qu'on envoie bien l'icon et la couleur au server
//  * => https://docs.cypress.io/api/commands/intercept <=
// describe("EditGroupModale - [MEDIUM]", () => {
//   beforeEach(() => {
//     localStorage.setItem("idBuilding", "68a1-5e37-6e16-18e52340dd7");
//     localStorage.setItem(
//       "token",
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJuYW1lIjoiYWRtaW4iLCJ0eXBlIjoiQURNSU4iLCJpZCI6IjE0NWUtZDE5MS1iNjgxLTE4ZTUxZmIwZTFiIiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxMjIxOTgzOTA4NiwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzEwNzcyMzkxNDUxLCJ1c2VyTmFtZSI6ImFkbWluIiwidXNlclR5cGUiOiJBRE1JTiJ9LCJpYXQiOjE3MTMyMDQ4MzAsImV4cCI6MTcxMzgwOTYzMH0.fEOcCrfmOv-0Hx4sEHPvhlge80DK9FMkzcxxuIK160Q"
//     );
//     Cypress.env("SPINAL_API_URL", "http://localhost:2023");
//     cy.viewport("macbook-15");
//   });

//   it("renders", () => {
//     cy.mount(EditGroupModale, {
//       props: {
//         showModal: true,
//       },
//     });
//   });

//   it("Update category include icon", () => {
//     const titleGrpCtx = "My context group";
//     const titleGrpCategory = "My Category Group2";

//     cy.mount(EditGroupModale, {
//       props: {
//         showModal: true,
//       },
//     });
//     cy.addGrpCategoryEditGroup(
//       titleGrpCategory,
//       titleGrpCtx,
//       "mdiCardsPlayingSpade"
//     );
//     cy.intercept(
//       {
//         method: "GET",
//         url: "/api/v2/building/*/api/v1/groupContext/*/create_category",
//         hostname: "localhost",
//         port: 2023,
//       },
//       (req) => {
//         expect(req.body).to.include("mdiCardsPlayingSpade");
//       }
//     )
//   });

  after(() => {
    const titleGrpCtx = "My context group";
    const titleGrpCategory = "My Category Group 2";

    // TODO Remove the following line after the server add grp ctx bug is fixed
    // cy.selectItemEditGroup(titleGrpCtx, EGroupeType.GRP_CONTEXT);
    // cy.deleteGrpCategoryEditGroup(titleGrpCategory, titleGrpCtx);

    // cy.deleteGrpCtxEditGroup(titleGrpCtx);
  });
});
