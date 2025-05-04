/// <reference types="cypress" />

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      logout(): Chainable<void>;
      createTestUser(): Chainable<void>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      task(event: "customTask"): Chainable<any[]>;
    }
  }
}
