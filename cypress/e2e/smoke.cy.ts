describe("smoke tests", () => {
  it("Should load home page", () => {
    cy.visitAndCheck("/");
  });
});
