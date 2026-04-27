// prisma/cleanup.ts
// Script de limpeza: apaga a Barbearia do Eren (seed) e personaliza a barbearia
// do Pedro Henrique (PH Barbearia) com serviços, barbeiros e horários bonitos.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PEDRO_EMAIL = "castropaizante1@gmail.com"; // teu email do Google
const NEW_NAME = "PH Barbearia";
const NEW_SLUG = "ph-barbearia";
const NEW_DESCRIPTION =
  "Barbearia premium em São Paulo. Cortes modernos, atendimento personalizado e ambiente acolhedor.";
const NEW_PHONE = "(11) 98765-4321";
const NEW_ADDRESS = "Rua das Palmeiras, 250 — São Paulo, SP";

async function main() {
  console.log("🧹 Iniciando cleanup...\n");

  // ==========================================
  // 1. APAGAR A BARBEARIA DO EREN (do seed)
  // ==========================================
  const erenUser = await db.user.findUnique({
    where: { email: "eren@barbershop.dev" },
    include: { barbershop: true },
  });

  if (erenUser) {
    console.log(`🗑️  Apagando dados antigos: ${erenUser.name}`);
    // Cascade: apagar User → apaga Barbershop → apaga Services, Barbers, Hours, Customers, Appointments
    await db.user.delete({
      where: { id: erenUser.id },
    });
    console.log("   ✅ Barbearia do Eren e tudo associado foi apagado\n");
  } else {
    console.log("ℹ️  Barbearia do Eren já não existia\n");
  }

  // ==========================================
  // 2. ENCONTRAR A SUA BARBEARIA
  // ==========================================
  const pedroUser = await db.user.findUnique({
    where: { email: PEDRO_EMAIL },
    include: { barbershop: true },
  });

  if (!pedroUser) {
    console.error(`❌ Usuário ${PEDRO_EMAIL} não encontrado.`);
    console.error("   Verifique se você logou pelo menos uma vez no sistema.");
    process.exit(1);
  }

  if (!pedroUser.barbershop) {
    console.error("❌ Sua conta existe mas não tem barbearia.");
    console.error("   Vá em /onboarding e crie uma primeiro.");
    process.exit(1);
  }

  console.log(`👤 Usuário encontrado: ${pedroUser.name} (${pedroUser.email})`);
  console.log(`✂️  Barbearia atual: ${pedroUser.barbershop.name} (slug: ${pedroUser.barbershop.slug})\n`);

  const barbershopId = pedroUser.barbershop.id;

  // ==========================================
  // 3. LIMPAR DADOS ANTIGOS DA SUA BARBEARIA
  // ==========================================
  console.log("🧹 Limpando dados antigos da sua barbearia...");

  await db.appointment.deleteMany({ where: { barbershopId } });
  await db.customer.deleteMany({ where: { barbershopId } });
  await db.businessHours.deleteMany({ where: { barbershopId } });
  await db.barber.deleteMany({ where: { barbershopId } });
  await db.service.deleteMany({ where: { barbershopId } });

  console.log("   ✅ Limpos: agendamentos, clientes, horários, barbeiros, serviços\n");

  // ==========================================
  // 4. ATUALIZAR DADOS DA BARBEARIA
  // ==========================================
  console.log("✏️  Atualizando informações...");

  await db.barbershop.update({
    where: { id: barbershopId },
    data: {
      name: NEW_NAME,
      slug: NEW_SLUG,
      description: NEW_DESCRIPTION,
      phone: NEW_PHONE,
      address: NEW_ADDRESS,
    },
  });

  console.log(`   ✅ Nome: ${NEW_NAME}`);
  console.log(`   ✅ Slug: ${NEW_SLUG}`);
  console.log(`   ✅ Descrição, telefone e endereço configurados\n`);

  // ==========================================
  // 5. CRIAR SERVIÇOS (pacote clássico)
  // ==========================================
  console.log("💈 Criando serviços...");

  await db.service.createMany({
    data: [
      {
        barbershopId,
        name: "Corte masculino",
        description: "Corte tradicional na tesoura e máquina, finalização com produto",
        priceInCents: 5000,
        durationMin: 30,
      },
      {
        barbershopId,
        name: "Barba",
        description: "Barba completa na navalha com toalha quente e óleo essencial",
        priceInCents: 3500,
        durationMin: 20,
      },
      {
        barbershopId,
        name: "Combo Corte + Barba",
        description: "Os dois serviços juntos com desconto. A escolha mais procurada.",
        priceInCents: 7500,
        durationMin: 45,
      },
    ],
  });

  console.log("   ✅ 3 serviços criados\n");

  // ==========================================
  // 6. CRIAR BARBEIROS
  // ==========================================
  console.log("👥 Criando barbeiros...");

  await db.barber.createMany({
    data: [
      {
        barbershopId,
        name: "Marcos Silva",
        bio: "10 anos de experiência. Especialista em cortes clássicos e modernos.",
      },
      {
        barbershopId,
        name: "Rafael Costa",
        bio: "Mestre em barba e degradê. Atendimento desde 2018.",
      },
    ],
  });

  console.log("   ✅ 2 barbeiros criados\n");

  // ==========================================
  // 7. CRIAR HORÁRIOS DE FUNCIONAMENTO
  // ==========================================
  console.log("🕐 Configurando horários...");

  await db.businessHours.createMany({
    data: [
      { barbershopId, dayOfWeek: 0, isClosed: true, openTime: "00:00", closeTime: "00:00" },
      { barbershopId, dayOfWeek: 1, isClosed: false, openTime: "09:00", closeTime: "19:00" },
      { barbershopId, dayOfWeek: 2, isClosed: false, openTime: "09:00", closeTime: "19:00" },
      { barbershopId, dayOfWeek: 3, isClosed: false, openTime: "09:00", closeTime: "19:00" },
      { barbershopId, dayOfWeek: 4, isClosed: false, openTime: "09:00", closeTime: "19:00" },
      { barbershopId, dayOfWeek: 5, isClosed: false, openTime: "09:00", closeTime: "20:00" },
      { barbershopId, dayOfWeek: 6, isClosed: false, openTime: "08:00", closeTime: "18:00" },
    ],
  });

  console.log("   ✅ Horários configurados (Seg-Sex 9-19, Sex até 20, Sáb 8-18, Dom fechado)\n");

  // ==========================================
  // RESUMO
  // ==========================================
  console.log("═══════════════════════════════════════");
  console.log("✅ Cleanup concluído com sucesso!");
  console.log("═══════════════════════════════════════\n");
  console.log(`🔗 Sua página pública agora é:`);
  console.log(`   http://localhost:3000/b/${NEW_SLUG}\n`);
  console.log(`👀 Veja o resultado:`);
  console.log(`   - Dashboard: http://localhost:3000/dashboard`);
  console.log(`   - Prisma Studio: rode \`pnpm prisma studio\``);
}

main()
  .catch((e) => {
    console.error("❌ Erro no cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
  