import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  try {
    // Create initial test user
    const existingUser = await db.query.users.findFirst({
      where: (users) => schema.eq(users.email, "juan@email.com")
    });

    if (!existingUser) {
      // Hash password for test user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("123456", saltRounds);
      
      // Insert test user
      const [user] = await db.insert(schema.users).values({
        nombre: "Juan",
        apellido: "Pérez",
        email: "juan@email.com",
        password: hashedPassword,
        fecha_nacimiento: new Date("1990-01-01"),
      }).returning();
      
      console.log("Test user created successfully:", user.email);
      
      // Create conditions for the test user
      const [diabetesCondition] = await db.insert(schema.conditions).values({
        user_id: user.id,
        name: "Diabetes",
        type: "Crónica • Tipo 2",
        diagnosed_date: new Date("2023-05-03"),
      }).returning();
      
      const [hypertensionCondition] = await db.insert(schema.conditions).values({
        user_id: user.id,
        name: "Hipertensión",
        type: "Mapa Vascular",
        diagnosed_date: new Date("2023-06-01"),
      }).returning();
      
      console.log("Test conditions created successfully");
      
      // Create metrics for diabetes
      await db.insert(schema.metrics).values([
        {
          condition_id: diabetesCondition.id,
          key: "A1C",
          value: "7.25",
          date_recorded: new Date("2023-05-03"),
        },
        {
          condition_id: diabetesCondition.id,
          key: "Órgano Afectado",
          value: "Riñón y Páncreas",
          date_recorded: new Date("2023-05-03"),
        },
        {
          condition_id: diabetesCondition.id,
          key: "ResultA/C",
          value: "615",
          date_recorded: new Date("2023-05-03"),
        },
      ]);
      
      // Create metrics for hypertension
      await db.insert(schema.metrics).values([
        {
          condition_id: hypertensionCondition.id,
          key: "PA",
          value: "142/92",
          date_recorded: new Date("2023-06-01"),
        },
        {
          condition_id: hypertensionCondition.id,
          key: "Control",
          value: "Medicación Semanal",
          date_recorded: new Date("2023-06-01"),
        },
        {
          condition_id: hypertensionCondition.id,
          key: "Carga",
          value: "235",
          date_recorded: new Date("2023-06-01"),
        },
      ]);
      
      console.log("Test metrics created successfully");
    } else {
      console.log("Test user already exists");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
