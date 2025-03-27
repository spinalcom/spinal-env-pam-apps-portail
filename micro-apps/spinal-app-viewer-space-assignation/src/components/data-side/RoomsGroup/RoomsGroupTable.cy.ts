import RoomsGroupTable from "./RoomsGroupTable.vue";

describe("RoomsGroupTable", () => {
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
    cy.mount(RoomsGroupTable);
  });

  // it("Can add a Group of context", () => {
  //   const titleGrpCtx = "My context group";

  //   cy.mount(RoomsGroupTable);
  // });
});
