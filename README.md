# Kuppipaal.com

Kuppipaal.com is a web application built with Vite + React and JavaScriptX. It serves as a tool for generating invoices, managing milk supply details, and presenting daily statistics. The application comprises a dashboard, a login page, and an admin dashboard with various features for efficient invoice management.

## Features

- **Dashboard**: Offers an intuitive interface for users to access invoice details, milk supply data, and daily statistics.
- **Login Page**: Provides secure authentication for accessing the platform.
- **Admin Dashboard**: Enables administrators to effectively manage invoices, including viewing, searching, and downloading individual invoices or all invoices as a zip file.
- **Invoice Generation**: Simplifies the process of generating invoices for users.
- **Search Functionality**: Allows users to search for specific invoices based on various criteria.
- **Download Options**: Provides flexibility by allowing users to download individual invoices or all invoices packaged as a zip file.

## Technologies Used

- **Vite**: Fast frontend build tool for modern web development.
- **React**: JavaScript library for building user interfaces.
- **JavaScriptX**: A variant of JavaScript with JSX syntax for React components.
- **Axios**: Promise-based HTTP client for making API requests.
- **JSZip**: Library for creating and manipulating ZIP files.
- *(Add other relevant technologies/tools)*

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

1. Access the login page and enter your credentials to log in and access the dashboard.
2. Use the dashboard to view invoice details, milk supply data, and daily statistics.
3. Administrators can access the admin dashboard to manage invoices, including searching and downloading options.
4. Generate invoices as needed and utilize the search functionality to find specific invoices.
5. Download individual invoices or all invoices as a zip file for convenience.

## Contributors

- **Sachin Raj M**: [GitHub Profile](https://github.com/sachin-raj-m)

## License

This project is licensed under the [MIT License](LICENSE).

---

