// types/next-auth.d.ts
// Estende os tipos padrão do Auth.js pra incluir nossos campos customizados

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}