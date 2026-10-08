# CSIT214_Assignment

## Instruction guide to run the application

## Backend Setup

**Required software**: Node.js v22.5+

Install dependencies using `npm install` in both the `backend` and `frontend` folders. From `backend`, run `npm run setup` to initialise the database and `npm run fab` to add the fictional demonstration data.

Run `npm start` in `backend` to build the Vite frontend, compile the backend and serve the complete application through Express at `http://localhost:3000`.

---

## Frontend Setup

**Required software**: NODEJS v20+

For frontend development, run `npm run dev` in `frontend` while the backend is running on port 3000. Vite proxies API requests to Express automatically.
