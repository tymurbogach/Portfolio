# Homelab Inventory

## NAS — TrueNAS SCALE (192.168.18.4)

**Host:** TrueNAS SCALE · ZFS storage · Raspberry Pi connected via LAN  
**Total contenedores activos:** 32  
**Stacks:** cloud, ia, media, network, system

### Stack: cloud
| Contenedor | Imagen | Función |
|-----------|--------|---------|
| immich_server | immich-app/immich-server | Servidor de fotos/vídeos (alternativa Google Photos) |
| immich_machine_learning | immich-app/immich-machine-learning | Reconocimiento facial y de objetos con ML |
| immich_postgres | tensorchord/pgvecto-rs:pg14 | PostgreSQL + extensión vectorial para búsqueda ML |
| immich_redis | redis:7-alpine | Caché y colas para Immich |

### Stack: ia
| Contenedor | Imagen | Función |
|-----------|--------|---------|
| ollama | ollama/ollama | Inferencia LLM local (Llama, Mistral, etc.) |
| open-webui | open-webui/open-webui | UI web para chatear con Ollama |

### Stack: media
| Contenedor | Imagen | Función |
|-----------|--------|---------|
| jellyfin | linuxserver/jellyfin | Servidor de streaming multimedia |
| sonarr | linuxserver/sonarr | Automatización descarga de series |
| radarr | linuxserver/radarr | Automatización descarga de películas |
| lidarr | linuxserver/lidarr | Automatización descarga de música |
| prowlarr | linuxserver/prowlarr | Gestor centralizado de indexers |
| jackett | linuxserver/jackett | Proxy de indexers torrent |
| transmission | linuxserver/transmission | Cliente torrent |
| seerr | seerr-team/seerr | Solicitudes de contenido multimedia |
| navidrome | deluan/navidrome | Servidor de música en streaming |
| picard | jlesage/musicbrainz-picard | Etiquetado automático de música (MusicBrainz) |
| maintainerr | jorenn92/maintainerr | Limpieza automática de medios según reglas |
| profilarr | santiagosayshey/profilarr | Sincronización de perfiles de calidad (*arr) |
| unpackerr | golift/unpackerr | Descompresión automática de descargas |
| flaresolverr | flaresolverr/flaresolverr | Bypass de Cloudflare para indexers |

### Stack: network
| Contenedor | Imagen | Función |
|-----------|--------|---------|
| gluetun | qmcgaw/gluetun | Cliente VPN (enruta tráfico torrent por VPN) |
| vpn-rotator | alpine | Rotación automática de VPN |
| ix-cloudflared | cloudflare/cloudflared | Túnel Cloudflare (exposición segura sin IP pública) |
| ix-tailscale | tailscale/tailscale | Nodo VPN Mesh (acceso remoto a la LAN) |

### Stack: system
| Contenedor | Imagen | Función |
|-----------|--------|---------|
| portainer | portainer-ce | UI gestión Docker |
| dockge | louislam/dockge | Gestor de Docker Compose stacks |
| uptime-kuma | louislam/uptime-kuma | Monitorización uptime de servicios |
| dozzle | amir20/dozzle | Visor de logs de contenedores en tiempo real |
| scrutiny | analogj/scrutiny | Monitorización salud HDD/SSD (S.M.A.R.T.) |
| watchtower | containrrr/watchtower | Actualizaciones automáticas de contenedores |
| homarr | ajnart/homarr | Dashboard centralizado de todos los servicios |
| filebrowser | filebrowser/filebrowser | Explorador de archivos web |
| nextexplorer | nxzai/explorer | Explorador adicional |
| searxng | searxng/searxng | Motor de búsqueda self-hosted (privado) |

---

## Pi — Raspberry Pi (192.168.18.18)

**Host:** Raspberry Pi OS · punto de entrada público del homelab  
**Total contenedores activos:** 8  
**Stacks:** web, system, network

### Stack: web
| Contenedor | Imagen | Función |
|-----------|--------|---------|
| portfolio | web-portfolio | Portfolio personal (nastymur.com) |
| lazytrip-frontend | web-lazytrip-frontend | Frontend Angular de LazyTrip |
| lazytrip-backend | web-lazytrip-backend | Backend Laravel de LazyTrip |
| lazytrip-worker | web-lazytrip-worker | Worker de colas Laravel |
| lazytrip-db | mariadb:11.4 | Base de datos MariaDB de LazyTrip |
| chat-api | web-chat-api | API del chat widget del portfolio |

### Stack: system
| Contenedor | Imagen | Función |
|-----------|--------|---------|
| portainer | portainer-ce | UI gestión Docker |
| dockge | louislam/dockge | Gestor de Docker Compose stacks |

### Servicios nativos (systemd)
| Servicio | Función |
|---------|---------|
| cloudflared | Túnel Cloudflare — expone nastymur.com sin IP pública |
| tailscaled | Nodo VPN Mesh Tailscale |
| pihole* | DNS blocker / ad-blocker de red (*stack network, parado) |

---

## Resumen

| | NAS | Pi | Total |
|--|-----|-----|-------|
| Contenedores activos | 32 | 8 | **40** |
| Stacks | 5 | 3 | **8** |

**Tecnologías clave:** TrueNAS SCALE, ZFS, Docker, Nginx, Cloudflare Tunnels, Tailscale, Gluetun VPN, Ollama, Immich, Jellyfin, *arr stack, MariaDB, Redis, PostgreSQL+pgvecto-rs, Scrutiny, Uptime-Kuma, Watchtower
