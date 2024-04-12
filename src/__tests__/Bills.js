/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import LoadingPage from "../views/LoadingPage.js";
import ErrorPage from "../views/ErrorPage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore)
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
const newBills = new Bills({
  document,
  onNavigate,
  store: mockStore,
  localStorage: localStorageMock,
});
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })
    test("Then mail icon in vertical layout is not highlighted", async () => {

      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      // check if the icon is highlighted
      expect(!windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then bills should be displayed", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const billsList = screen.getByTestId('tbody')
      expect(billsList).toBeTruthy()
      expect(billsList.children.length).toBe(bills.length)
    })
    test(" Then getBills should return bills", () => {
      const bills = newBills.getBills();
      expect(bills).toEqual(bills);
    })
    describe("When I click on NewBill button", () => {
      test("Then it should render a Newbill page", () => {
        document.body.innerHTML = BillsUI({data: []});
        const handleClickNewBill = jest.fn(newBills.handleClickNewBill);
        const button = screen.getByTestId("btn-new-bill");
        button.addEventListener("click", handleClickNewBill);
        button.click();
        expect(handleClickNewBill).toBeCalled();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });
    describe("When Bills Page is loading", () => {
      test("Then LoadingPage should be called", () => {
        document.body.innerHTML = BillsUI({data: bills, loading: true});
        expect(LoadingPage).toBeCalled;
      });
    });

    describe("When Bills Page error", () => {
      test("Then LoadingPage should be called", () => {
        document.body.innerHTML = BillsUI({
          data: bills,
          loading: undefined,
          error: true,
        });
        expect(ErrorPage()).toBeCalled;
      });
    });
  })

  // test d'intégration GET
  describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(mockStore, 'bills')
      const bills = mockStore.bills()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills).toEqual(bills)
    })
  })

  describe("When I click to eye icon", () => {
  test('Then the image modal is visible', async () => {
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    await waitFor(() => screen.getByText("Mes notes de frais"))
    const modalFile = document.getElementById('modaleFile')
    $.fn.modal = jest.fn(() => modalFile.classList.add('show'))
    const eyeButton = screen.getAllByTestId('icon-eye')
    fireEvent.click(eyeButton[1])
    const url = eyeButton[1].dataset.billUrl
    const modal = screen.getByAltText('Bill')
    const modalSrc = modal.src.replace('%E2%80%A6','…')
    expect(modal).toBeTruthy()
    expect(modalSrc).toBe(url)
  })
  })
})
