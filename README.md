# SEBA-Backend
Our glorious web server.

## Installation
First install MongoDB and run it with
`mongod` or `sudo mongod`

Then clone the project and run
```
$npm install
$npm start
```

## Testing with Postman
- Use urls like `http://localhost:8000/api/customer/<controller-name>`
- Use hears `Content-Type: application/json` and `Authorization: token`
(Authorization is necessary only if you use login-requiring features)

## Code Base Notes
- MongoDB models live in `models` folder
- API endpoints and their validators live in `controllers` folder (check `/controllers/customer.js` for examples)
- `services` folder contain system-wide shared utilities like API validation and authentication
- `api-route` folder contain two routers for customer and owner (excluding admistrative features for ourself at the moment). 
Simply use `addRoute` and `addAuthRoute` functions to add bind controllers to REST API routes.
- Exporting functions and objects from `index.js` files allow folders to be used as modules.
