describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("Should load home page", () => {
    cy.visitAndCheck("/");
  });
});
