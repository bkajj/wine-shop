const api = 'http://localhost:8000';

describe('API', () => {
  it('returns the product list', () => {
    cy.request(`${api}/products`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.length(3);
    });
  });

  it('registers a user and logs them in', () => {
    const username = `user_${Date.now()}`;

    cy.request('POST', `${api}/register`, {
      username,
      email: `${username}@test.pl`,
      password: 'haslo123',
    })
      .its('body.status')
      .should('eq', 'success');

    cy.request('POST', `${api}/login`, { username, password: 'haslo123' })
      .its('body.token')
      .should('be.a', 'string');
  });

  it('rejects a payment without a token', () => {
    cy.request({
      method: 'POST',
      url: `${api}/payment`,
      body: {},
      failOnStatusCode: false,
    })
      .its('status')
      .should('eq', 401);
  });
});