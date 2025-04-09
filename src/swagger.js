import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";



const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Express API with Swagger of Threadly",
            version: "1.0.0",
            description: "API for Threadly Typescript",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8500}`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        }
    },
    apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
