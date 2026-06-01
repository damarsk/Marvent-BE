import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Express } from "express";
import path from "path";
import fs from "fs";

export const swaggerDocs = (app: Express) => {
  const swaggerDocument = YAML.load(path.join(__dirname, "./swagger.yaml"));
  const css = fs
    .readFileSync(
      path.resolve(
        __dirname,
        "../../node_modules/swagger-ui-dist/swagger-ui.css",
      ),
    )
    .toString();

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCss: css,
      customSiteTitle: "Marvent API",
    }),
  );
};
