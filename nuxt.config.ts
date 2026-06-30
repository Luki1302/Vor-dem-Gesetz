export default defineNuxtConfig({
  devServer: {
    port: 3002,
    host: '0.0.0.0',
  },
  vite: {
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
    },
  },
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
  },

  content: {
    highlight: false,
  },


  app: {
    pageTransition: { name: 'fade', mode: 'out-in' },
    head: {
      title: 'Vor dem Gesetz',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
    },
  },

  devtools: { enabled: true },

  compatibilityDate: '2024-11-01',
})
