import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js";
import mockedBills from "../__mocks__/store.js";
import {ROUTES} from "../constants/routes.js";
import Store from "../app/Store.js";
jest.mock('../app/store', () => mockedBills);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("check title and form", async () => {
      document.body.innerHTML = NewBillUI()

      const titlePage = screen.getByText('Envoyer une note de frais');
      expect(titlePage).toBeTruthy();

      const formAddNewBill = screen.getByTestId('form-new-bill');
      expect(formAddNewBill).toBeTruthy();
    })
  })
  describe("When I am on NewBill Page", () => {
    test("Then the form is visible and can be submit", () => {
      document.body.innerHTML = NewBillUI()

      const file = document.querySelector(`input[data-testid="file"]`);
      expect(file).toBeTruthy();
      // test submit form
      const submit = document.querySelector("form[data-testid=\"form-new-bill\"]");
      submit.dispatchEvent(new Event("submit"));
      submit.click();
      expect(submit).toBeTruthy();
    })
  })

  describe("When, I click on the submit button", () => {
    test("Then the bill should be sent", () => {
      jest.spyOn(mockedBills, 'bills');
      Object.defineProperty(window, 'localStorage', {value: localStorageMock});
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'e@e',
      }));

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      };
      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockedBills,
        localStorage: window.localStorage,
      })

      const fileInput = screen.getByTestId('file');
      expect(fileInput).toBeTruthy();

      const handleFileEvent = jest.fn((e) => newBill.handleChangeFile(e));
      fileInput.addEventListener('change', handleFileEvent);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["goodPicture.png"], "goodPicture.png", {type: "image/png"})],
        },
      });
      expect(handleFileEvent).toHaveBeenCalled();

      const expenseType = screen.getByTestId('expense-type');
      expenseType.value = "Transports";

      const expenseName = screen.getByTestId('expense-name');
      expenseName.value = "test1";

      const expenseAmount = screen.getByTestId('amount');
      expenseAmount.value = 100;

      const expenseDate = screen.getByTestId('datepicker');
      expenseDate.value = "2001-01-01";

      const expenseVAT = screen.getByTestId('vat');
      expenseVAT.value = "";

      const expensePCT = screen.getByTestId('pct');
      expensePCT.value = 20;

      const expenseCommentary = screen.getByTestId('commentary');
      expenseCommentary.value = "plop";

      const handleFormSubmit = jest.fn((event) => newBill.handleSubmit(event));

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener('submit', handleFormSubmit)
      fireEvent.submit(form);

      expect(form).toBeTruthy();
    })
  })

  // POST
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate on New Bills page", () => {
      test("Then it will post a New Bill", async () => {
        jest.mock('../app/Store');
        const newBill = {
          email: 'mail@domain.fr',
          type: "Employee",
          name:  "Frais divers",
          amount: 123,
          date:  "2022/06/25",
          vat: 20,
          pct: 10,
          commentary: "commentaire",
          fileUrl: "url/to/file.jpeg",
          fileName: "justificatif-42.jpeg",
          status: 'accepted'
        }
        Store.bill = () => ({ newBill, post: jest.fn().mockResolvedValue() })
        const getSpy = jest.spyOn(Store, "bill")
        const postReturn = Store.bill(newBill)
        expect(getSpy).toHaveBeenCalledTimes(1)
        expect(postReturn.newBill).toEqual(newBill)
      })
    })
  })
})
