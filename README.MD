# MeMe_ChatApp_Backend

## Author
- [Tu Uyen]()
- 

## Description
- MeMe ChatApp BackEnd is a server application developed using NodeJS, Express, MongoDB, Socket.io, and other technologies. It provides a RESTful API for the client application to interact with the database and Socket.io for real-time chat features.

### 1. Requirement 

- NodeJS 20+

### 2. Installation
#### Install package:
```bash
git clone https://github.com/SiZedYi/cnm-meme-be.git
cd cnm-meme-be
npm install
```

#### Run project
````bash
npm start
````

### Project structure:
```
MEME_BackEnd
├─ node_modules: holds all project dependencies
├─ .env: define mongodb connection string
├─ .gitignore
├─ README.md
├─ nodemon.json
├─ package-lock.json
├─ package.json
└─ server
   ├─ config: holds application configurations
   ├─ controllers: handle application logic
   ├─ index.js: entry point of application
   ├─ models: define application data schema
   ├─ routes: define application routes
   ├─ utils: declare apicode and pagination class for application use 
   └─ index.js
```

### 3. Usage

#### 3.1. API
1. **POST** /api/login
   - Login with username and password
   - Request Body: 
   ```json
   {
     "username": "String",
     "password": "String"
   }
   ```
   - Response:
   {
      "token": "String"
   }

2. **GET** /api/users/:id
   - Get a user by id
   - Request Params:
   ```
   id: String
   ```
   - Response:
   {
      "username": "String",
      "password": "String"
   }
  - Authorization: Bearer token

3. **PUT** /api/users/:id
   - Update a user by id

4. **DELETE** /api/users/:id
   - Delete a user by id
   
...

#### 3.2. Environment variables
- Create a `.env` file in the root directory of the project.
- Add environment-specific variables on new lines in the form of NAME=VALUE. For example:
```
PORT=3000
```

- The `.env` file is a way to store environment variables for your application. It should contain the following environment-specific variable:
   - `PORT`: The port number to run the server.

- The `.env` file is ignored by Git, so it will not be committed with your code. This is useful for configuration data like API keys and database URIs that you don't want to be committed with your code.

- **Note**: The `.env` file should not be committed to the repository. It is a good practice to define the environment variables for each environment.

#### 3.3. Nodemon
- Nodemon is a utility that will monitor for any changes in your source and automatically restart your server.

- To use nodemon, replace the `node` command in the `scripts` of `package.json` with `nodemon`. For example:
```json
"scripts": {
  "start": "nodemon --inspect server/index.js",
}
```

- You can also configure nodemon in the `nodemon.json` file. For example:
```json
{
  "watch": ["server"],
  "ext": "js json ejs css"
}
```

- By default, nodemon will look for the `server` directory. If you want to change the directory, you can add the `nod```
