import express from "express";

const routes = express.Router();

routes.get("/", (request, response) => {
  return response.json({
    messaage: "Hello, Jovens...",
  });
});

export default routes;
