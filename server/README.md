# INFO WORLD PHARMACY

## Descriere:
    Pentru a putea gestiona mai bine cantitatea de date si buna functionare a backend-ului, acesta 
    dispune de de doua servere: unul se ocupa de logarea si autentificarea utilizatorilor, iar celalalt
    de accesarea bazei de date.

    Procesul de logare si autentificare incepe prin extragerea username-ului si parolei din request.
    Primul pas este verificarea parolei, daca hash-ul acesteia corespunde cu cel din baza de data.
    Odata indeplinita aceasta conditie, sunt generate doua token-uri folosind JWT: accessToken si
    refreshToken. Primul token este folosit pe mai departe la accesarea tuturor functionalitatilor
    puse la dispozitie de catre server, iar al doilea este folosit la obtinerea unui nou accessToken
    dupa expirare. Dupa generare, aceastea sunt transmise catre utilizator, care le salveaza pe localStorage.
    Dupa obtinerea accesului, utilizatorul poate accesa functionalitatile puse la dispozitie de celalat
    server pentru accesarea bazei de date folosind acel token de access.

    In baza de date, exista 4 tabele: unul pentru retinerea informatiilor necesare despre 
    utilizatori(users); pentru produsele listate de farmacie(products); unul pentru a tine evidenta tuturor
    comenzilor efectuate de utilizatori(orders); iar ultimul tabel este pentru retinerea refreshToken
    -urilor pentru a putea valida existenta acestor token-uri(tokens).

    La delogarea unui utilizator de pe server, refresh token-ul este eliminat din baza de date, astfel
    utilizatorul nu-si mai poate crea token-uri de access dupa expirare.



## Functionalitati implementate:

    1. Serverul suporta adaugarea/ modificarea sau stergerea de utilizatori;
    
    2. Adaugarea, modificarea si stergerea medicamentelor/produselor doar de catre utilizatorii
    ce sunt setat de catre administratorul bazei de date, rolul de "ADMIN" (default = "USER"). Utilizatorii
    doar pot vedea toate produsele sau sa le acceseze separat pe baza productID;
    
    3. Un utilizator poate face mai multe comenzi si poate sa le si vizualizeze, sa le modifice sau
    sa le steaga, dar nu are access la comenzile celorlalti. Adminii pot face comenzi in numele altor
    utilizatori, sa le modifice, sa le stearga sau sa le confirme. De asemenea, ei pot vedea si
    toate comenzile date de utilizatorii platformei.

    4. Se pot sterge una sau mai multe comenzi/ utilizatori sau produse;

    5. Aplicatia ofera suport pentru intregistrarea si autentificarea utilizatorilor pe server prin
    intermediul JWT(JSON Web Token);

    6. Aplicatia dispune de doua tipuri de utilizatori cu drepturi diferite: "USER" si "ADMIN";

    7. Serverul face validarea datelor primite de la utilizator in timpul operatiei de SIGN UP si de
    update a datelor: verificare CNP, adresa E-mail, telefon;


    
## Rulare:

    * Instalare NodeJS, MYSQL si dependente(verificati fisierul package.json!)
    
    * Creare fisier .env unde trebuiesc puse datele de logare catre MYSQL

    * Deschidere terminal:
        - mysql -u <username> -p 
        - Deschide fisierul de la calea /server/databases/databaseSchema.sql;
        - ruleaza comenzile din fisier in mysql pentru a crea infrastructura;
    
    * Deschidere 2 terminale:
        - term(1): 
            * cd server/
            * node index.js

        - term(2): 
            * cd server/auth
            * node authenticationServer.js

    * Pentru testare am folosit extensia REST Client din VS Code: se pot folosi fisierele *.rest deja
    facute de mine pentru a vedea toate functionalitatile.


