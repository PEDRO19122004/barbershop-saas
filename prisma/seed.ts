// prisma/seed.ts
// Popula o banco com 1 barbearia fake pra testar o sistema.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpa dados antigos (cuidado: deleta tudo)
  await db.appointment.deleteMany();
  await db.customer.deleteMany();
  await db.businessHours.deleteMany();
  await db.barber.deleteMany();
  await db.service.deleteMany();
  await db.barbershop.deleteMany();
  await db.subscription.deleteMany();
  await db.user.deleteMany();

  console.log("🧹 Banco limpo");

  // 1. Cria o dono da barbearia
  const owner = await db.user.create({
    data: {
      name: "Eren Barbearia",
      email: "eren@barbershop.dev",
      // passwordHash será setado no Módulo 3 (auth). Por ora, fake.
      passwordHash: "fake_hash_will_be_set_by_auth_module",
    },
  });
  console.log(`👤 Dono criado: ${owner.name}`);

  // 2. Cria a barbearia
  const barbershop = await db.barbershop.create({
    data: {
      userId: owner.id,
      name: "Barbearia do Eren",
      slug: "barbearia-do-eren",
      description: "A melhor barbearia da cidade. Corte com qualidade desde 2026.",
      phone: "(11) 98765-4321",
      address: "Rua Teste, 123 - São Paulo, SP",
    },
  });
  console.log(`✂️  Barbearia criada: ${barbershop.name} (slug: ${barbershop.slug})`);

  // 3. Cria assinatura em trial
  await db.subscription.create({
    data: {
      userId: owner.id,
      status: "TRIALING",
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 dias
    },
  });
  console.log(`💳 Subscription criada (TRIALING por 14 dias)`);

  // 4. Cria serviços
  const services = await Promise.all([
    db.service.create({
      data: {
        barbershopId: barbershop.id,
        name: "Corte masculino",
        description: "Corte tradicional na tesoura e máquina",
        priceInCents: 5000, // R$ 50,00
        durationMin: 30,
      },
    }),
    db.service.create({
      data: {
        barbershopId: barbershop.id,
        name: "Barba",
        description: "Barba feita na navalha com toalha quente",
        priceInCents: 3500, // R$ 35,00
        durationMin: 20,
      },
    }),
    db.service.create({
      data: {
        barbershopId: barbershop.id,
        name: "Combo Corte + Barba",
        description: "Os dois serviços juntos com desconto",
        priceInCents: 7500, // R$ 75,00
        durationMin: 45,
      },
    }),
  ]);
  console.log(`💈 ${services.length} serviços criados`);

  // 5. Cria barbeiros
  const barbers = await Promise.all([
    db.barber.create({
      data: {
        barbershopId: barbershop.id,
        name: "João Silva",
        bio: "10 anos de experiência em barbearia clássica",
      },
    }),
    db.barber.create({
      data: {
        barbershopId: barbershop.id,
        name: "Pedro Santos",
        bio: "Especialista em barba e degradê",
      },
    }),
  ]);
  console.log(`👥 ${barbers.length} barbeiros criados`);

  // 6. Cria horário de funcionamento (seg-sáb, fechado domingo)
  const businessHoursData = [
    { dayOfWeek: 0, isClosed: true, openTime: "00:00", closeTime: "00:00" }, // domingo
    { dayOfWeek: 1, isClosed: false, openTime: "09:00", closeTime: "19:00" }, // segunda
    { dayOfWeek: 2, isClosed: false, openTime: "09:00", closeTime: "19:00" },
    { dayOfWeek: 3, isClosed: false, openTime: "09:00", closeTime: "19:00" },
    { dayOfWeek: 4, isClosed: false, openTime: "09:00", closeTime: "19:00" },
    { dayOfWeek: 5, isClosed: false, openTime: "09:00", closeTime: "20:00" }, // sexta até 20h
    { dayOfWeek: 6, isClosed: false, openTime: "08:00", closeTime: "18:00" }, // sábado
  ];

  await Promise.all(
    businessHoursData.map((hours) =>
      db.businessHours.create({
        data: { barbershopId: barbershop.id, ...hours },
      })
    )
  );
  console.log(`🕐 Horários de funcionamento configurados`);

  // 7. Cria um cliente fake
  const customer = await db.customer.create({
    data: {
      barbershopId: barbershop.id,
      name: "Cliente Teste",
      phone: "(11) 91234-5678",
      email: "cliente@teste.com",
    },
  });
  console.log(`🧑 Cliente criado: ${customer.name}`);

  // 8. Cria um agendamento de exemplo (amanhã às 10h)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const endTime = new Date(tomorrow);
  endTime.setMinutes(endTime.getMinutes() + 30);

  await db.appointment.create({
    data: {
      barbershopId: barbershop.id,
      customerId: customer.id,
      serviceId: services[0].id, // corte masculino
      barberId: barbers[0].id,    // João
      startTime: tomorrow,
      endTime: endTime,
      status: "CONFIRMED",
      priceInCents: services[0].priceInCents,
    },
  });
  console.log(`📅 Agendamento de exemplo criado`);

  console.log("\n✅ Seed concluído com sucesso!");
  console.log(`\n👀 Acesse http://localhost:5555 (Prisma Studio) pra ver os dados`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });