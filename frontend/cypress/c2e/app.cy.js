describe('Testy aplikacji', () => {
    it('Sprawdza tytuł strony', () => {
      cy.visit('http://localhost:3000');
      cy.title().should('include', 'Sklep z winami');
    });
  
    // ...i tak dalej (dodaj 20 testów)
  });