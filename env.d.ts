declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly DATABASE_PATH?: string;
    readonly NEXT_PUBLIC_API_URL?: string;
  }
}
