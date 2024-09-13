describe('cast test, tests', () => {
    beforeEach(() => {
       cy.visit('http://localhost:3000/screening/cast')
     })
     it('should have a main header', () => {
       cy.get('.castText').should('exist')
       .and('contain', 'Childhood Autism Spectrum Test (CAST)')
     })
     it('should have a disclaimer message', () => {
       cy.get('.castParagraph').should('exist')
       .and('contain', 'This test is for children 4 and older. It is a simple test that can help you determine if your child may have autism. Please keep in mind that this test is not a substitute for an official diagnosis. Please seek a certified healthcare professional for an official diagnosis.')
     })
     it('should have a message stating how many questions there are', () => {
       cy.get('.castQuestionMessage').should('exist')
       .and('contain', 'This test consists of 39 questions. Please answer each question to the best of your ability.')
     })
     it('should have a progress bar', () => {
       cy.get('.progressBar').should('exist')
     })
     it('should have a form with questions', () => {
       cy.get('.castForm').should('exist')
       cy.get('.castQuestion').should('exist')
       .and('have.length', 39)
     })
     it('should click through the questions', () => {
       const numQuestions = 39; 
       const numOptionsPerQuestion = 2; 
   
       cy.get('.castQuestion').should('have.length', numQuestions);
   
       cy.get('.castQuestion').each(($question, index) => {
         cy.wrap($question).find('.castQuestionNumber').should('contain', `${index + 1}.`);
         cy.wrap($question).find('.castLabel').should('exist');
         cy.wrap($question).find('.castOption').should('have.length', numOptionsPerQuestion);
       });
     });
   
     it('should allow selecting answers for all questions', () => {
       cy.get('.castQuestion').each(($question, index) => {
         cy.wrap($question)
           .find(`#option-${index}-0`)
           .check({ force: true })
           .should('be.checked');
         
         cy.wrap($question)
           .find(`#option-${index}-1`)
           .check({ force: true })
           .should('be.checked');
       });
     });
   
     it('should have a submit button', () => {
       cy.get('.castSubmit').should('exist')
         .and('contain', 'Submit');
     });
   
     it('should submit the form successfully', () => {
       cy.get('.castQuestion').each(($question, index) => {
         cy.wrap($question)
           .find(`#option-${index}-0`)
           .check({ force: true });
       });
   
       cy.get('.castSubmit').click();
   
     });
   
     it('should not submit the form if any question is unanswered', () => {
       cy.get('.castQuestion').first().find('input[type="radio"]');
       cy.get('.castSubmit').click();
       cy.get('.scoreContainer').should('not.exist');
     });
   })