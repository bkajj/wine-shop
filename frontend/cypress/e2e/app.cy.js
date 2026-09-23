const api = 'http://localhost:8000';

function createUser() {
  const username = `user_${Date.now()}`;
  const password = 'haslo123';
  return cy
    .request('POST', `${api}/register`, {
      username,
      email: `${username}@test.pl`,
      password,
    })
    .then(() => ({ username, password }));
}

function loginAndVisit(user, path = '/') {
  return cy
    .request('POST', `${api}/login`, {
      username: user.username,
      password: user.password,
    })
    .then((res) => {
      cy.visit(path, {
        onBeforeLoad: (win) => win.sessionStorage.setItem('token', res.body.token),
      });
    });
}

describe('Access and authentication', () => {
  it('redirects an unauthenticated visitor to the login page', () => {
    cy.visit('/');
    cy.contains('Zaloguj się').should('be.visible');
  });

  it('shows a confirmation on the login page after registration', () => {
    const username = `user_${Date.now()}`;

    cy.visit('/register');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(`${username}@test.pl`);
    cy.get('input[name="password"]').type('haslo123');
    cy.get('form').submit();

    cy.url().should('include', 'registered=1');
    cy.contains('Rejestracja zakończona sukcesem').should('be.visible');
  });

  it('rejects a login with a wrong password', () => {
    createUser().then((user) => {
      cy.visit('/login');
      cy.get('input[name="username"]').type(user.username);
      cy.get('input[name="password"]').type('wrong-password');
      cy.get('form').submit();

      cy.get('.error').should('contain', 'Nieprawidłowe dane logowania');
      cy.contains('Zaloguj się').should('be.visible');
    });
  });

  it('lets a registered user in', () => {
    createUser().then((user) => {
      cy.visit('/login');
      cy.get('input[name="username"]').type(user.username);
      cy.get('input[name="password"]').type(user.password);
      cy.get('form').submit();

      cy.contains('Nasze Wina').should('be.visible');
      cy.contains('Wyloguj').should('be.visible');
    });
  });
});

describe('Shopping', () => {
  beforeEach(() => {
    createUser().then((user) => loginAndVisit(user));
  });

  it('lists the wines fetched from the API', () => {
    cy.get('.product-card').should('have.length', 3);
    cy.contains('Wino Czerwone').should('be.visible');
  });

  it('adds a product to the cart', () => {
    cy.get('.product-card').first().contains('Dodaj do koszyka').click();
    cy.contains('Koszyk (1)').click();

    cy.get('.product-name').should('contain', 'Wino Czerwone');
    cy.contains('Łączna cena: 49.99 zł').should('be.visible');
  });

  it('increases the quantity when the same wine is added twice', () => {
    cy.get('.product-card').first().contains('Dodaj do koszyka').click().click();
    cy.contains('Koszyk (1)').click();

    cy.contains('Ilość: 2').should('be.visible');
    cy.contains('Łączna cena: 99.98 zł').should('be.visible');
  });

  it('shows an empty cart', () => {
    cy.contains('Koszyk (0)').click();
    cy.contains('Twój koszyk jest pusty').should('be.visible');
  });
});