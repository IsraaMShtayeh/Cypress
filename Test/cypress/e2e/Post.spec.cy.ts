import LoginValidation from "../support/pageobjects/loginValidation";
const loginObjValidation: LoginValidation = new LoginValidation();
describe("upload file ", () => {
    beforeEach(() => {
        cy.fixture('login').as('data')
        cy.visit("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login");
        //Admin login
        cy.get('@data').then((infoData: any) => {
            loginObjValidation.fillData(infoData.valid.name, infoData.valid.password)
            loginObjValidation.checkPage(infoData.valid.message)
        })

        cy.get('.oxd-sidepanel-body').contains('Buzz').click();
        cy.writeFile('file.txt', 'Hello');

    })

    it("", () => {
        cy.fixture('file.txt').then((post) => {
            cy.get('.oxd-buzz-post-input').type(post);
            cy.get('.oxd-buzz-post-slot > .oxd-button').click({ force: true });
        });
        cy.contains('Hello');
    })


})
