declare global {
  namespace Cypress {
    interface Chainable {
      login(
        email?: string,
        password?: string
      ): Chainable<{ token: string; email: string; password: string }>;
    }
  }
}

// To ensure this file is treated as a module and allow global augmentation,
// especially if you have strict module settings.
export {};
