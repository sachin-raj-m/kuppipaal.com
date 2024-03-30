# Kuppipaal.com

Kuppipaal.com is a web application built with Vite + React and JavaScriptX, serving as a flexible solution for invoice creation, milk supply management, and daily statistical analysis. It features a user-friendly dashboard, a secure login page, and an admin dashboard with extensive tools for efficient invoice handling. Tailored for users with limited database expertise, the application prioritizes privacy protection and avoids hardcoding API keys or sheet IDs. Suppliers are required to update sheets daily to ensure current status information.

## Features

- **Dashboard**: Offers an intuitive interface for users to access invoice details, milk supply data, and daily statistics.
- **Login Page**: Provides secure authentication for accessing the platform for admin.
- **Admin Dashboard**: Enables administrators to effectively manage invoices, including viewing, searching, and downloading individual invoices or all invoices as a zip file.
- **Search Functionality**: Allows users to search for their data based on various criteria.
- **Download Options**: Provides flexibility for admin to download individual invoices or all invoices packaged as a zip file.

## Technologies Used

- **Vite**: Fast frontend build tool for modern web development.
- **React**: JavaScript library for building user interfaces.
- **JavaScriptX**: A variant of JavaScript with JSX syntax for React components.
- **Axios**: Promise-based HTTP client for making API requests.
- **JSZip**: Library for creating and manipulating ZIP files.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sachin-raj-m/kuppipaal.com.git
   ```

2. Navigate to the project directory:

   ```bash
   cd kuppipaal.com
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory of the project:

   ```plaintext
   // .env
    VITE_REACT_APP_SHEET_ID='your_sheet_id'
    VITE_REACT_APP_GOOGLE_SHEET_API='your_sheets_api'
    VITE_REACT_APP_USERNAME='username'
    VITE_REACT_APP_PASSWORD='password'
    VITE_REACT_APP_DASHBOARD_SHEET_NAME="sheet_name"
    VITE_REACT_APP_ADMIN_SHEET_NAME="sheet_name"
   ```
    Note: I have used different sheets for Users Dashboard for milk suplly tracking and another sheet for invoice generation which is referenced from original one. So, env file contains two sheet names, one for dashboard and another for admin dashboard where invoice is generated.

5. Start the development server:

   ```bash
   npm run dev
   ```

## Usage

1. Access the login page and enter your credentials to log in and access the admin dashboard.
2. Use the ADMIN dashboard to view invoice details, milk supply data, and bill generation.
3. Generate invoices as needed and utilize the search functionality to find specific invoices.
4. Download individual invoices or all invoices as a zip file for convenience.
5. The Home screen does have a search bar and can search and find the details by searching with consumer name. By default, the home page will be empty.
6. If you type "showall", it would trigger the system to show all the contents of the sheet including all the details.

## Sheet Structure

![Dashboard Sheet](https://github.com/sachin-raj-m/kuppipaal.com/assets/78268005/ae1857a8-d53e-448e-a898-7ff342163707)
This sheet is used to show the details to the user in home screen. The data from this sheet will be taken via axios and displayed. The suplier can update it daily when the milk is supllied. The 66 and 33 here are the price of the milk. If a consuer doesn't buy on certain day, it can be changed to 0.

![Admin Dashboard Sheet](https://github.com/sachin-raj-m/kuppipaal.com/assets/78268005/c8c00dee-ae8e-48be-9c28-97b9109ab846)
This sheet is referenced using certain formulas from the first one. The Consumer Name, Quantity, Days, Individual Bill etc are referenced to make it apt for bill format.

## Contributors

- **Sachin Raj M**: [GitHub Profile](https://github.com/sachin-raj-m)

## License

This project is licensed under the [MIT License](LICENSE).

---

