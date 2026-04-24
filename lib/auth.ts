// lib/auth.ts
// Configuração principal do Auth.js v5

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

// Schema de validação do login (email + senha)
const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter no mínimo 6 caracteres"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Adapter: conecta Auth.js ao Prisma (salva sessões no banco)
  adapter: PrismaAdapter(db),

  // Estratégia de sessão: JWT em cookie assinado (padrão recomendado)
  session: { strategy: "jwt" },

  // Páginas customizadas (em vez das do Auth.js)
  pages: {
    signIn: "/entrar",
  },

  providers: [
    // 1. Google OAuth
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    // 2. Email + senha (Credentials)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // Valida input com Zod
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Busca o usuário no banco
        const user = await db.user.findUnique({
          where: { email },
        });

        // Usuário não existe OU entrou só via Google (sem senha)
        if (!user || !user.passwordHash) return null;

        // Confere senha
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // Retorna o usuário (Auth.js cria a sessão)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    // Injeta o ID do usuário no token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Injeta o ID no objeto de sessão (disponível no client e server)
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});