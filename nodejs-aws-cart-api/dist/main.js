"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const port = process.env.PORT || 4000;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (req, callback) => callback(null, true),
    });
    app.use((0, helmet_1.default)());
    await app.listen(port);
}
bootstrap().then(() => {
    console.log('App is running on %s port', port);
});
//# sourceMappingURL=main.js.map