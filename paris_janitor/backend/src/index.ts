import express from "express";
import {initUserRoutes } from "./handlers/routes/user-routes";
import { initInvoiceRoutes } from "./handlers/routes/invoice-routes";
import { initPropertyRoutes } from "./handlers/routes/property-routes";
import { initReservationRoutes } from "./handlers/routes/reservation-routes";
import { AppDataSource } from "./database/database";
const cors = require('cors');


const main = async () => {

  const app = express(); 
    app.use(cors());

  //const port = process.env.PORT || 8080;
  const port = 3000;

  try {
    await AppDataSource.initialize();
    console.error("well connected to database");
  } catch (error) {
    console.log(error);
    console.error("Cannot contact database"); 
    process.exit(1);
  }

  app.use(express.json());
  app.use(cors());


  initUserRoutes(app);
  initInvoiceRoutes(app);
  initPropertyRoutes(app);
  initReservationRoutes(app);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

main();