import LoginValidation from "../support/pageobjects/loginValidation";
const loginObjValidation: LoginValidation = new LoginValidation();
import { requestLeave, approveReject } from "../support/help";
import { addEmployee } from "../support/pageobjects/EmployeePage";
import { checkDataInTable } from "../support/Utils/checkDataInTable";
let empNumber = 0;
let username = `Israa${Math.floor((Math.random() * 1000))}`;
let password = "Israaa123";
let vacancyId = 0;
describe("Login Home Page", () => {
    beforeEach(function () {
        cy.fixture('login').as('data')
        cy.fixture('employeeInfo').as('EmpInfo')

        cy.visit("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login");
        //Admin login
        cy.get('@data').then((infoData: any) => {
            loginObjValidation.fillData(infoData.valid.name, infoData.valid.password)
            loginObjValidation.checkPage(infoData.valid.message)
        })

        cy.get('@EmpInfo').then(async (infoData: any) => {
            addEmployee(infoData.user.firstName, infoData.user.middleName, infoData.user.lastName, infoData.user.id).then((response) => {
                empNumber = response.body.data.empNumber
                cy.request({
                    method: 'POST',
                    url: 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users',
                    body: {
                        username: username,
                        password: password,
                        status: true,
                        userRoleId: 2,
                        empNumber: empNumber
                    }
                }).then((response) => {
                    expect(response).property('status').to.eq(200);
                });
            })
        })

    });

    it("logout and then login", () => {
        cy.logout();
        cy.get('@data').then((infoData: any) => {
            //employee login
            loginObjValidation.fillData(username, password)
            loginObjValidation.checkPage(infoData.valid.message)
        }).then(() => {
            cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/time/viewMyTimesheet')
            cy.api({
                method: 'GET',
                url: 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/timesheets/default?date=2023-10-28',
            }).then((response) => {
                let sheetId = response.body.data.id
                console.log(response)
                cy.api({
                    method: 'PUT',
                    url: `https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/timesheets/${sheetId}/entries`,
                    body: {
                        "entries": [
                            {
                                projectId: 2,
                                activityId: 11,
                                dates: {
                                    "2023-10-28": { "duration": "09:00" }
                                }
                            }
                        ],
                        deletedEntries: []
                    }
                }).then(() => {
                    cy.api({
                        method: 'PUT',
                        url: `https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/timesheets/${sheetId}`,
                        body: { "action": "SUBMIT" }
                    })
                }).then(() => {
                    cy.logout();

                    cy.wait(1000)
                    //Admin login
                    cy.get('@data').then((infoData: any) => {
                        loginObjValidation.fillData(infoData.valid.name, infoData.valid.password)
                        loginObjValidation.checkPage(infoData.valid.message)
                    })
                    cy.get('.oxd-sidepanel-body').contains('Time').click();
                    cy.get('li.oxd-topbar-body-nav-tab.--parent.--visited span.oxd-topbar-body-nav-tab-item:contains("Timesheets")').click();
                    cy.contains('Employee Timesheet').click({ force: true })
                    // assertion the data exist in the table
                    cy.get('@EmpInfo').then((infoData: any) => {
                        checkDataInTable('.oxd-table', [`${infoData.user.firstName} ${infoData.user.middleName} ${infoData.user.lastName}`]);

                    })


                })
            })

        })
    })

})
