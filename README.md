
# E2EE RSA Encryption
## Project Structure
```

root
├── frontend     # Client-side code (React)
└── server       # Server-side code (Node.js)

````

## Installation and Usage

### Frontend
```bash
cd frontend
npm i
npm run dev
````

* Access the app at `http://localhost:3000`

### Backend

```bash
cd server
npm i
node server.js
```

* Server will start on the default port (usually 4000)

## How to Use

1. Generate your RSA key pair (Public/Private).
2. Place the key files in the `keys` folder inside the server directory.
3. Use the frontend to interact with the backend APIs for encrypting and decrypting messages.

## Common Scripts

* Frontend

  * `npm run dev` — run in development mode
  * `npm run build` — build for production

* Backend

  * `node server.js` — start the server

## Notes

* This project implements end-to-end RSA encryption.
* Keep your private key secure and do not expose it publicly.

## License

MIT License

```
https://github.com/lsakl/e2ee_reactjs_nodejs
```
