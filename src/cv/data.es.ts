import type { CvData } from "./data";

export const cvDataEs: CvData = {
  personal: {
    name: "Tymur Bogach",
    title: "Desarrollador Full Stack",
    location: "Orihuela, Alicante",
    phone: "+34 658 440 125",
    email: "Timurnator@gmail.com",
    website: "nastymur.com",
    github: "github.com/TimurTwerKing",
  },

  labels: {
    profile:    "Perfil",
    skills:     "Habilidades",
    experience: "Experiencia Profesional",
    projects:   "Proyectos Personales",
    education:  "Educación",
    languages:  "Idiomas",
    references: "Referencias",
  },

  summary:
    "Entusiasta de la programación web con pasión por la música y la informática. Tengo experiencia profesional en el sector de la automoción como especialista en carrocería y pintura. He desarrollado mis habilidades en precisión, paciencia y atención al detalle durante más de 10 años. Conocido por mi sentido del humor y personalidad enérgica. Espero colaborar con profesionales que compartan mi entusiasmo por crecer en esta industria como un hongo.\n\nSiguiendo al conejo blanco, eligiendo la píldora correcta de Morpheus y comiendo la galleta del Oráculo. (¡Espero que pilles la referencia!)",

  skills: [
    { category: "Programación",   items: ["HTML", "CSS", "SCSS", "JavaScript", "TypeScript", "Java", "PHP", "MySQL"] },
    { category: "Frameworks",     items: ["Angular", "Laravel", "Tailwind", "Astro"] },
    { category: "Herramientas",   items: ["Android Studio", "Windows", "Linux"] },
    { category: "Especialización", items: ["Desarrollo Mobile & Web", "Integración de APIs", "Diseño UI/UX", "Control de Versiones", "Optimización de Rendimiento"] },
    { category: "Habilidades",    items: ["Gestión de Proyectos", "Trabajo en Equipo", "Gestión del Tiempo", "Liderazgo", "Comunicación", "Pensamiento Crítico"] },
  ],

  experience: [
    {
      company: "GesinFlot",
      role: "Equipo de Desarrollo",
      period: "2025",
      location: "Orihuela, España",
      bullets: [
        "Desarrollo de aplicaciones móviles (Android Studio), diseño UI/UX, integración de APIs y flujo de despliegue de APK.",
      ],
    },
    {
      company: "Grupo Marcos",
      role: "Técnico de Carrocería y Pintura",
      period: "2017 – 2024",
      location: "Orihuela, España",
      bullets: [
        "Reparación de carrocería y pintura con alta precisión y coordinación de equipos de trabajo.",
      ],
    },
    {
      company: "Renault Trucks, La Basca y otros",
      role: "Mecánico, Técnico de Carrocería y Pintura",
      period: "2012 – 2017",
      location: "Alicante, España",
      bullets: [
        "Reparación, pintura y diagnóstico mecánico de vehículos comerciales de múltiples marcas.",
      ],
    },
  ],

  projects: [
    {
      name: "Homelab Personal",
      status: "Activo",
      bullets: [
        "Diseño y administración de un NAS con TrueNAS SCALE con +25 servicios Docker orquestados con Docker Compose y Dockge.",
        "Acceso remoto seguro mediante Tailscale (VPN mesh) y Cloudflare Tunnels sin puertos abiertos.",
        "Pipeline de automatización completo: descarga, extracción y clasificación por idioma y calidad.",
      ],
    },
    {
      name: "Portfolio — nastymur.com",
      status: "Producción",
      bullets: [
        "Construido con Astro + Tailwind CSS. Alojado en Raspberry Pi con Nginx, servido mediante Cloudflare Tunnel propio.",
      ],
    },
  ],

  education: [
    {
      school: "EFA El Campico",
      degree: "CFGS Desarrollo de Aplicaciones Web (DAW)",
      period: "2023 – 2025",
    },
    {
      school: "IES El Palmeral",
      degree: "Técnico en Carrocería de Vehículos Automóviles",
      period: "2008 – 2011",
    },
  ],

  languages: [
    { name: "Inglés",    level: "Intermedio" },
    { name: "Ruso",      level: "Nativo" },
    { name: "Ucraniano", level: "Nativo" },
    { name: "Español",   level: "Fluido" },
  ],

  references: [
    {
      name: "Tatiana Pérez Zamora",
      role: "Senior Developer / Team Lead",
      phone: "+34 655 84 35 05",
      email: "Tatiana.perez@tdi-data.com",
    },
    {
      name: "Sergio Murcia Mateo",
      role: "Developer / System Admin",
      phone: "+34 601 23 45 05",
      email: "Sergio.murcia@tdi-data.com",
    },
  ],
};
