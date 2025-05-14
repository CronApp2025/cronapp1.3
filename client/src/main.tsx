import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set document title
document.title = "Aplicación de Salud";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Aplicación para profesionales de la salud. Gestione pacientes, condiciones médicas y tratamientos de forma eficiente.';
document.head.appendChild(metaDescription);

// Add Open Graph tags
const ogTitle = document.createElement('meta');
ogTitle.setAttribute('property', 'og:title');
ogTitle.content = 'Aplicación de Salud';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.setAttribute('property', 'og:description');
ogDescription.content = 'Aplicación para profesionales de la salud. Gestione pacientes, condiciones médicas y tratamientos.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.setAttribute('property', 'og:type');
ogType.content = 'website';
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(<App />);
