export type CvPersonal = {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  github: string;
};

export type CvExperience = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
};

export type CvProject = {
  name: string;
  status: string;
  bullets: string[];
};

export type CvEducation = {
  school: string;
  degree: string;
  period: string;
};

export type CvReference = {
  name: string;
  role: string;
  phone: string;
  email: string;
};

export type CvData = {
  personal: CvPersonal;
  summary: string;
  experience: CvExperience[];
  projects: CvProject[];
  education: CvEducation[];
  languages: Array<{ name: string; level: string }>;
  references: CvReference[];
};

export const cvData: CvData = {
  personal: {
    name: "Tymur Bogach",
    title: "Full Stack Developer",
    location: "Orihuela, Alicante",
    phone: "+34 658 440 125",
    email: "Timurnator@gmail.com",
    website: "nastymur.com",
    github: "github.com/TimurTwerKing",
  },

  summary:
    "Desarrollador web con formación en DAW y más de 10 años de experiencia profesional previa en automoción, donde desarrollé precisión, disciplina y atención al detalle. Administro un homelab con más de 25 servicios Docker automatizados. Busco aplicar mis habilidades técnicas y capacidad de resolución de problemas en un equipo de desarrollo profesional.",

  experience: [
    {
      company: "GesinFlot (TDI Data)",
      role: "Prácticas curriculares — Desarrollo Full Stack",
      period: "2025",
      location: "Orihuela, España",
      bullets: [
        "Desarrollo de aplicaciones web con Angular y Laravel en entorno de equipo.",
        "Administración de base de datos MySQL y servidor Linux en producción.",
        "Desarrollo móvil con Android Studio, diseño UI/UX, integración de APIs REST y flujo de despliegue de APK.",
      ],
    },
    {
      company: "Grupo Marcos",
      role: "Técnico de Carrocería y Pintura",
      period: "2017 – 2024",
      location: "Orihuela, España",
      bullets: [
        "Reparación de carrocería y pintura de alta precisión durante 7 años, coordinando equipos de trabajo bajo estándares de calidad exigentes.",
        "Desarrollé habilidades de resolución de problemas, gestión del tiempo y atención al detalle directamente transferibles al desarrollo de software.",
      ],
    },
    {
      company: "Renault Trucks, La Basca y otros",
      role: "Mecánico, Técnico de Carrocería y Pintura",
      period: "2012 – 2017",
      location: "Alicante, España",
      bullets: [
        "Reparación y diagnóstico mecánico de vehículos comerciales de múltiples marcas.",
      ],
    },
  ],

  projects: [
    {
      name: "Homelab Personal",
      status: "Activo",
      bullets: [
        "Diseñé y administro un NAS con TrueNAS SCALE y +25 servicios Docker (Jellyfin, Immich, Arr Stack, Portainer, Uptime Kuma) gestionados con Docker Compose y Dockge.",
        "Implementé acceso remoto seguro con Tailscale (VPN mesh) y Cloudflare Tunnels, eliminando puertos abiertos.",
        "Automatización completa: descarga, extracción, clasificación por idioma/calidad con custom formats y perfiles personalizados.",
      ],
    },
    {
      name: "Portfolio Web — nastymur.com",
      status: "Producción",
      bullets: [
        "Construido con Astro + Tailwind CSS. Desplegado en Raspberry Pi con Nginx, accesible vía Cloudflare Tunnel propio.",
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
      degree: "Técnico en Carrocería de Vehículos",
      period: "2008 – 2011",
    },
  ],

  languages: [
    { name: "Español", level: "Fluido" },
    { name: "Ruso", level: "Nativo" },
    { name: "Ucraniano", level: "Nativo" },
    { name: "Inglés", level: "Intermedio" },
  ],

  references: [
    {
      name: "Tatiana Pérez Zamora",
      role: "Senior Developer / Team Lead — TDI Data",
      phone: "+34 655 84 35 05",
      email: "tatiana.perez@tdi-data.com",
    },
    {
      name: "Sergio Murcia Mateo",
      role: "Developer / SysAdmin — TDI Data",
      phone: "+34 601 23 45 05",
      email: "sergio.murcia@tdi-data.com",
    },
  ],
};