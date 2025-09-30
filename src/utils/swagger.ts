import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "postToP API",
      version: "1.0.0",
    },
  },
  apis: ["./src/api/routes/index.ts"],
});
