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

export type CvSkillGroup = {
  category: string;
  items: string[];
};

export type CvData = {
  personal: CvPersonal;
  summary: string;
  skills: CvSkillGroup[];
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
    "I'm a web programming enthusiast with a passion for music and computers. I have a professional background in the automotive industry as a painter and bodybuilder specialist. I've developed my skills in precision, patience, and attention to detail for over 10 years. Known for my dark humor and energetic personality. I look forward to collaborating with professionals who share my enthusiasm for growing in this industry like a mushroom.\n\nFollowing the white rabbit, choosing the right Morpheus pill, and eating the Oracle cookie. (Hope you get the reference!)",

  skills: [
    { category: "Programming",  items: ["HTML", "CSS", "SCSS", "JavaScript", "TypeScript", "Java", "PHP", "MySQL"] },
    { category: "Frameworks",   items: ["Angular", "Laravel", "Tailwind", "Astro"] },
    { category: "Tools",        items: ["Android Studio", "Windows", "Linux"] },
    { category: "Expertise",    items: ["Mobile & Web App Development", "API Integration", "UI/UX Design", "Version Control & Deployment", "Performance Optimization"] },
    { category: "Soft Skills",  items: ["Project Management", "Teamwork", "Time Management", "Leadership", "Communication", "Critical Thinking", "Public Relations"] },
  ],

  experience: [
    {
      company: "GesinFlot",
      role: "Development team",
      period: "2025",
      location: "Orihuela, Spain",
      bullets: [
        "Mobile app development (Android Studio), UI/UX design, API integration, and APK deployment.",
      ],
    },
    {
      company: "Grupo Marcos",
      role: "Body and Paint Technician",
      period: "2017 – 2024",
      location: "Orihuela, Spain",
      bullets: [
        "Automotive body repair and refinishing with high attention to detail and team coordination.",
      ],
    },
    {
      company: "Renault Trucks, La Basca and others",
      role: "Mechanic, Body and Paint Technician",
      period: "2012 – 2017",
      location: "Alicante, Spain",
      bullets: [
        "Commercial vehicle repair, painting, and mechanical diagnostics across multiple brands.",
      ],
    },
  ],

  projects: [
    {
      name: "Personal Homelab",
      status: "Active",
      bullets: [
        "Built and manage a NAS with TrueNAS SCALE running 25+ Docker services (Jellyfin, Immich, Arr Stack, Portainer, Uptime Kuma) orchestrated with Docker Compose and Dockge.",
        "Implemented secure remote access via Tailscale (mesh VPN) and Cloudflare Tunnels with zero open ports.",
        "Full automation pipeline: download, extraction, and classification by language/quality using custom formats and profiles.",
      ],
    },
    {
      name: "Portfolio — nastymur.com",
      status: "Production",
      bullets: [
        "Built with Astro + Tailwind CSS. Self-hosted on Raspberry Pi with Nginx, served via own Cloudflare Tunnel.",
      ],
    },
  ],

  education: [
    {
      school: "EFA El Campico",
      degree: "Advanced Technical Certificate in Web App Development",
      period: "2023 – 2025",
    },
    {
      school: "IES El Palmeral",
      degree: "Technical Qualification in Automotive Bodywork and Refinishing",
      period: "2008 – 2011",
    },
  ],

  languages: [
    { name: "English", level: "Intermediate" },
    { name: "Russian", level: "Native" },
    { name: "Ukrainian", level: "Native" },
    { name: "Spanish", level: "Fluent" },
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
