# CSIT214_Assignment

## Installing/First time setup

**Prerequisite software**
- Node.js v22.5+ (Available via https://nodejs.org/en/download)

---

**FrontEnd Setup**
(Note some actions may require waiting between commands)

- Run `cmd` (command prompt) with raised permissions (admin privelledges)
- (Navigate) `CD` into the frontend folder 
(example `cd C:\Users\USER\Downloads\CSIT214_Assignment-main\frontend`)
- `npm i` (install dependencies)

**BackEnd Setup**
(Note some actions may require waiting between commands)

- Run `cmd` (command prompt) with raised permissions (admin privelledges)
- (Navigate) `CD` into the backend folder
(example `cd C:\Users\USER\Downloads\CSIT214_Assignment-main\backend`)
- `npm i` (Install dependencies)
- `npm run setup` (Initialise database)
- `npm run fab` (Add fabricated/test data for testing)

## Usage
**Startup**
- Run `cmd` (command prompt) with raised permissions (admin privelledges)
- (Navigate) `CD` into the backend folder
(example `cd C:\Users\USER\Downloads\CSIT214_Assignment-main\backend`)
- `npm start` (To build the Vite `frontend`, start the `backend` and display on `http://localhost:7070`)

---

**Front end Development**
- Ensure `backend` is running on `port 7070` (Test `http://localhost:7070` in browser)
- (Navigate) `CD` into the frontend folder
- (example `cd C:\Users\USER\Downloads\CSIT214_Assignment-main\frontend`)
- `npm run dev` (Vite proxies API requests to the backend automatically)

**For local testing on seperate devices**

---

- Host device connected to the same `local network` as devices
- Host device running `backend`
- Retrieve host device `IPV4 address`
- e.g `192.168.25.145`
- Add `:7070` onto the end to get example (`192.168.50.165:7070`)
- Paste into browser

