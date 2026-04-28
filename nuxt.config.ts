// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://prizegacha.id'
const siteName = 'Prize Gacha'
const title = 'Prize Gacha — Roll Your Fortune, Menangkan Hadiah Gacha Virtual'
const description =
  'Prize Gacha adalah game gacha keberuntungan online: putar mesin gachapon, raih hadiah dari rarity Common, Rare, Epic, Legendary, hingga Mythic, lalu bagikan kemenanganmu. Gratis, seru, dan langsung dimainkan di browser tanpa perlu unduh.'
const keywords =
  'prize gacha, prizegacha, gacha online, gachapon online, game gacha indonesia, gacha simulator, roll fortune, hadiah virtual, game keberuntungan, lucky draw online, undian online, gacha gratis browser, mesin gacha, mythic gacha'
const ogImage = `${siteUrl}/og-image.png`
const ogImageAlt = 'Prize Gacha — Roll Your Fortune. Mesin gachapon dengan hadiah Common hingga Mythic.'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      siteUrl,
      siteName,
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml', '/robots.txt'],
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },

  app: {
    head: {
      title,
      titleTemplate: '%s',
      htmlAttrs: { lang: 'id' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { name: 'author', content: siteName },
        { name: 'publisher', content: siteName },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
        { name: 'bingbot', content: 'index, follow' },
        { name: 'theme-color', content: '#1a0b2e' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'rating', content: 'general' },
        { 'http-equiv': 'content-language', content: 'id-ID' },

        // Apple PWA
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: siteName },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'application-name', content: siteName },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: siteUrl },
        { property: 'og:locale', content: 'id_ID' },
        { property: 'og:locale:alternate', content: 'en_US' },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:secure_url', content: ogImage },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: ogImageAlt },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
        { name: 'twitter:image:alt', content: ogImageAlt },
      ],
      link: [
        { rel: 'canonical', href: siteUrl },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icon-512.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'mask-icon', href: '/favicon.svg', color: '#ffd24a' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bungee&family=Poppins:wght@400;600;800;900&display=swap' },
        { rel: 'alternate', hreflang: 'id-ID', href: siteUrl },
        { rel: 'alternate', hreflang: 'x-default', href: siteUrl },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/tailwind.config.ts',
  },
})
