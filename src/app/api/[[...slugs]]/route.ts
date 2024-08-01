import Elysia from "elysia";
import { AuthModule } from "@/server/auth";
import { compression } from "elysia-compression";
import cors from "@elysiajs/cors";
import logixlysia from "logixlysia";
import swagger from "@elysiajs/swagger";
import { OrderModule } from "@/server/order";

const app = new Elysia({ prefix: "/api" })
  .use(compression())
  .use(cors())
  .use(
    logixlysia({
      config: {
        showBanner: true,
        ip: true,
        logFilePath: "./logs/example.log",
        customLogFormat:
          "🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip} {epoch}",
        logFilter: {
          level: ["ERROR", "WARNING"],
          status: [500, 404],
          method: "GET",
        },
      },
    }),
  )
  .use(
    swagger({
      path: "/docs",
    }),
  )
  .use(AuthModule)
  .use(OrderModule)
  .listen(3000);

export const GET = app.handle;
export const POST = app.handle;

export type App = typeof app;
