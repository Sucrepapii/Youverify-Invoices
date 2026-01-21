# YouVerify Invoice Frontend

This is the frontend application for the YouVerify Invoice system, built with React and Vite.

## Setup

1.  **Install Dependencies**:


    ```bash
    npm install
    ```

2.  **Start Development Server**:
    Ensure the backend server is running on `http://localhost:8080`.
    ```bash
    npm run dev
    ```

## Authentication

The application uses specific authentication flows:

- **Login**: Access `/login` to sign in.
- **Signup**: Create a new account via the toggle on the login page.
- **Protected Routes**: All dashboard pages are protected and require authentication.

## Tech Stack

- **React**: UI Library
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **React Router**: Navigation
- **Context API**: State Management (Auth)
