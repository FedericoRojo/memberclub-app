const {Client} = require("pg");
require('dotenv').config();

const SQL = `
-- Creating the session table
CREATE TABLE IF NOT EXISTS user_sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,        
  username VARCHAR(255) NOT NULL, 
  name VARCHAR(255) NOT NULL,
  hash TEXT NOT NULL,            -- Hash of the password
  salt TEXT NOT NULL,             -- Salt used for hashing
  status INTEGER NOT NULL         -- (0 = base, 1 = member of club, 2 = admin)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  iduser INTEGER,        
  title VARCHAR(255) NOT NULL,
  text VARCHAR(255) NOT NULL,            
  creation TIMESTAMP NOT NULL,
  FOREIGN KEY (idUser) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS writen (
  idMessage INTEGER,             
  idUser INTEGER, 
  PRIMARY KEY (idMessage, idUser),  
  FOREIGN KEY (idMessage) REFERENCES messages (id) ON DELETE CASCADE,
  FOREIGN KEY (idUser) REFERENCES users (id) ON DELETE CASCADE
);
`;



async function main (){
    console.log("seeding..");
    const client = new Client({
        connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
}

main(); 

