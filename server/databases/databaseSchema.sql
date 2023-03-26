CREATE DATABASE info_world_pharmacy;
USE info_world_pharmacy;


CREATE TABLE users (
    userID INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL  --ADMIN or USER
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    cnp VARCHAR(13) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    secondAddress TEXT
);

CREATE TABLE products (
    productID INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    price FLOAT NOT NULL,
    quantity integer NOT NULL,
    pillShape VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    prescription BOOLEAN NOT NULL,
    expirationDate DATE NOT NULL,
    supply INTEGER NOT NULL

);

CREATE TABLE orders (
    orderID INTEGER PRIMARY KEY AUTO_INCREMENT,
    customerID INTEGER NOT NULL,
    productID INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    totalPrice FLOAT NOT NULL,
    orderDate DATE NOT NULL,
    orderState BOOLEAN NOT NULL,
    FOREIGN KEY (customerID) REFERENCES users(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (productID) REFERENCES products(productID)
        ON DELETE CASCADE
        ON UPDATE CASCADE

);

CREATE TABLE tokens (
    tokenID INTEGER PRIMARY KEY AUTO_INCREMENT,
    userID INTEGER NOT NULL UNIQUE,
    refreshToken VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (userID) REFERENCES users(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO orders (customerID, productID, quantity, totalPrice, orderDate, orderState) 
VALUES
(
6,
32,
2,
48,
'2023-03-24',
0
);

INSERT INTO orders (customerID, productID, quantity, totalPrice, orderDate, orderState) 
VALUES
(
8,
31,
3,
58.69,
'2023-03-24',
0
);

INSERT INTO users (username, password, firstName, lastName, cnp, phone, email, address) 
VALUES 
('alexluca',
'1234',
'Alexandru', 
'Luca',
'1990406046266', 
'0743568097', 
'lucaalexandru06@yahoo.com',
'Bucuresti, Romania'
);

INSERT INTO users (username, password, firstName, lastName, cnp, phone, email, address) 
VALUES 
('andreea',
'1234',
'Andreea', 
'Luca',
'2540406046266', 
'0742957149', 
'andreea@yahoo.com',
'Bacau, Romania'
);

INSERT INTO products (name, price, quantity, pillShape, description, prescription, expirationDate, supply) 
VALUES 
('Nurofen',
24,
20, 
'comprimate',
'Impotriva durerilor de cap si dentare', 
false,
'2024-12-01', 
100
);

INSERT INTO products (name, price, quantity, pillShape, description, expirationDate, supply)
VALUES 
('Parasinus',
12,
15, 
'comprimate',
'Impotriva racelii si gripei', 
'2025-10-11', 
50
);