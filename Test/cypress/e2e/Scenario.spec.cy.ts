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
        cy.fixture('leave').as('leaveData')
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
            }).then(() => {
                cy.request({
                    method: 'POST',
                    url: 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/leave/leave-entitlements',
                    body: {
                        empNumber: empNumber,
                        leaveTypeId: 9,
                        fromDate: "2023-01-01",
                        toDate: "2024-08-31",
                        entitlement: "20"
                    }
                })
            });
        })

    });

    it("logout and then login", () => {
        cy.logout();
        cy.get('@data').then((infoData: any) => {
            loginObjValidation.fillData(username, password)
            loginObjValidation.checkPage(infoData.valid.message)
        }).then(() => {
            cy.get('@leaveData').then((infoData: any) => {
                requestLeave(infoData.requestLeave.comment,
                    infoData.requestLeave.duration,
                    infoData.requestLeave.fromDate,
                    infoData.requestLeave.leaveTypeId,
                    infoData.requestLeave.partialOption,
                    infoData.requestLeave.toDate);
            }).then(() => {

                cy.logout();
                cy.get('@data').then((infoData: any) => {
                    loginObjValidation.fillData(infoData.valid.name, infoData.valid.password)
                    loginObjValidation.checkPage(infoData.valid.message)
                })


            }).then(() => {
                approveReject();
                cy.logout();
                cy.get('@data').then((infoData: any) => {
                    loginObjValidation.fillData(username, password)
                    loginObjValidation.checkPage(infoData.valid.message)
                })
                cy.visit("https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewMyLeaveList")
                cy.get('@leaveData').then((infoData: any) => {
                    cy.get('@EmpInfo').then((infoData1: any) => {
                        checkDataInTable('.oxd-table', ["", `${infoData.requestLeave.fromDate} to ${infoData.requestLeave.toDate}`, `${infoData1.user.firstName} ${infoData1.user.middleName} ${infoData1.user.lastName}`]);

                    })
                })
            })

        }).then(() => {
            cy.logout();
            cy.get('@data').then((infoData: any) => {
                loginObjValidation.fillData(infoData.valid.name, infoData.valid.password)
                loginObjValidation.checkPage(infoData.valid.message)
            })
        }).then(() => {
            cy.request({
                method: 'POST',
                url: 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/recruitment/vacancies',
                body: {
                    "name": "vacancy",
                    "jobTitleId": 22,
                    "employeeId": empNumber,
                    "numOfPositions": null,
                    "description": "",
                    "status": true,
                    "isPublished": true
                }
            }).then((response) => {
                expect(response).property('status').to.equal(200)
                vacancyId = response.body.data.id;
                console.log(vacancyId)
            }).then(() => {
                cy.visit(`https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/addJobVacancy/${vacancyId}`)
                cy.get('.orangehrm-header-container  .oxd-button', { timeout: 30000 }).click({ force: true }).then(() => {
                    cy.get('input[type=file]').selectFile("cypress/fixtures/file.txt", { force: true }).then(() => {
                        cy.get('.oxd-table-loader > .oxd-loading-spinner-container').should("exist").then(() => {

                            cy.get('.oxd-table-loader > .oxd-loading-spinner-container').should("not.exist").then(() => {


                                cy.get('.oxd-form  .oxd-form-actions  .oxd-button--secondary').last().click({ force: true })
                                cy.get('.oxd-table-card  .oxd-table-row', { timeout: 30000 }).contains('file.txt')
                            })

                        })

                    })




                })


            })
        })






    })



})
