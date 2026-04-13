import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from './models/Exercise.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

const exerciciosIniciais = [
  { name: "Supino Reto", subtitle: "Barra Livre", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/embed/72UUJVBuT7o", idealRest: 90 },
  { name: "Supino Inclinado", subtitle: "Halteres", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/embed/Ap6zcbhE3M4", idealRest: 90 },
  { name: "Crucifixo Máquina", subtitle: "Peck Deck", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/embed/cZ75YmWYTgQ", idealRest: 60 },
  { name: "Tríceps Pulley", subtitle: "Cabo com Corda", muscleGroup: "Tríceps", videoUrl: "https://www.youtube.com/embed/UwDwI6hOuS8", idealRest: 60 },
  
  { name: "Puxada Frente", subtitle: "Polia Alta", muscleGroup: "Costas", videoUrl: "https://www.youtube.com/embed/mPmfwbc_svw", idealRest: 90 },
  { name: "Remada Curvada", subtitle: "Barra Livre", muscleGroup: "Costas", videoUrl: "https://www.youtube.com/embed/FcRXb6C7myI", idealRest: 90 },
  { name: "Rosca Direta", subtitle: "Barra W", muscleGroup: "Bíceps", videoUrl: "https://www.youtube.com/embed/kwG2ipFRgfo", idealRest: 60 },
  
  { name: "Agachamento Livre", subtitle: "Barra Livre", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/embed/gcNh17Ckjgg", idealRest: 120 },
  { name: "Leg Press 45", subtitle: "Máquina", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/embed/IZxyjW7XnGQ", idealRest: 120 },
  { name: "Cadeira Extensora", subtitle: "Máquina", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/embed/YyvSfVjQeL0", idealRest: 60 },
  
  { name: "Desenvolvimento", subtitle: "Halteres", muscleGroup: "Ombros", videoUrl: "https://www.youtube.com/embed/qEwKCR5JCog", idealRest: 90 },
  { name: "Elevação Lateral", subtitle: "Halteres", muscleGroup: "Ombros", videoUrl: "https://www.youtube.com/embed/3VcKaXpzqRo", idealRest: 60 },
  { name: "Abdominal Máquina", subtitle: "Máquina", muscleGroup: "Abdômen", videoUrl: "https://www.youtube.com/embed/2_eAuJ3P32Y", idealRest: 60 },
  
  { name: "Levantamento Terra", subtitle: "Barra Livre", muscleGroup: "Costas/Pernas", videoUrl: "https://www.youtube.com/embed/op9kVnSso6Q", idealRest: 120 },
  { name: "Mesa Flexora", subtitle: "Máquina", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/embed/1Tq3QdYUuHs", idealRest: 60 },
  { name: "Panturrilha Sentado", subtitle: "Máquina", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/embed/JbyjNymZOt0", idealRest: 60 },
  { name: "Tríceps Testa", subtitle: "Barra W", muscleGroup: "Tríceps", videoUrl: "https://www.youtube.com/embed/d_KZxkY_0cM", idealRest: 60 },
  { name: "Rosca Martelo", subtitle: "Halteres", muscleGroup: "Bíceps", videoUrl: "https://www.youtube.com/embed/zC3nLlEvin4", idealRest: 60 },
  { name: "Barra Fixa", subtitle: "Peso Corporal", muscleGroup: "Costas", videoUrl: "https://www.youtube.com/embed/eGo4IYIlzbc", idealRest: 90 },
  { name: "Encolhimento", subtitle: "Halteres", muscleGroup: "Ombros", videoUrl: "https://www.youtube.com/embed/cJRVVxmytaM", idealRest: 60 }
];

async function seedDatabase() {
  try {
    if (!MONGO_URI) throw new Error("A URL do MongoDB não foi encontrada no ficheiro .env");

    await mongoose.connect(MONGO_URI);
    console.log("🔥 Ligado ao MongoDB com sucesso!");

    await Exercise.deleteMany({});
    console.log("Catálogo antigo removido.");

    await Exercise.insertMany(exerciciosIniciais);
    console.log("✅ 20 Exercícios inseridos no banco de dados!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao popular o banco:", err.message);
    process.exit(1);
  }
}

seedDatabase();