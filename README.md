//Clean CSS client
//HEBERGER

Paris Janitor (PJ) est une chaîne de conciergeries immobilières assurant une offre de gestion locative
saisonnière (type AirBnB), créée à Paris en 2018. 

RUN BACKEND
1) cd backend

2) npm install

3) docker compose up -d

4) npm run start:dev

5) stripe listen --forward-to localhost:3000/api/payment/webhook

RUN CLIENT
1) cd client

2) npm install

3) npm run dev

RUN BACKOFFICE
1) cd backoffice

2) npm install

3) npm run dev