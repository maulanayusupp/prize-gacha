// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://moneygacha.id'
const siteName = 'Money Gacha'
const title = 'Money Gacha — Roll Your Fortune & Menangkan Hadiah Virtual'
const description =
  'Money Gacha adalah game gacha keberuntungan: putar mesin, dapatkan hadiah uang virtual mulai Common hingga Mythic, lalu bagikan hasilmu ke teman. Gratis, seru, dan bisa dimainkan langsung di browser.'
const ogImage = `${siteUrl}/og-image.png`

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
        { name: 'keywords', content: 'money gacha, gacha online, game keberuntungan, gacha indonesia, roll fortune, hadiah virtual, game gratis browser, gacha simulator, lucky draw, undian online' },
        { name: 'author', content: siteName },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'theme-color', content: '#1a0b2e' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'format-detection', content: 'telephone=no' },

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
        { property: 'og:image', content: ogImage },
        { property: 'og:image:secure_url', content: ogImage },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Money Gacha — Roll Your Fortune' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
        { name: 'twitter:image:alt', content: 'Money Gacha — Roll Your Fortune' },
      ],
      link: [
        { rel: 'canonical', href: siteUrl },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
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
