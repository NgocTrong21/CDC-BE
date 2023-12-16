const { version } = require("../../package.json");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "node-express-boilerplate API documentation",
    version,
    license: {
      name: "MIT",
      url: "https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE",
    },
  },
  components: {
    securitySchemas: {
      bearerAuth: {
        type: "https",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: `http://localhost:${process.env.PORT}/v1`,
    },
  ],
  apis: ["./src/routes/*.route.js"],
};

module.exports = swaggerDef;
