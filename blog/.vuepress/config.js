module.exports = {
  title: "えいむーさんは明日も頑張るよ",
  theme: "blog-vuetify",
  themeConfig: {
    components: {
      afterPage: "Amazon",
      beforePageSection: "Amazon",
    },
  },
  head: [
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  ],
  plugins: [
    [
      "@vuepress/google-analytics",
      {
        ga: "UA-111335437-2",
      },
    ],
  ],
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/katex.min.css",
      },
    ],
  ],
  markdown: {
    extendMarkdown: (md) => {
      md.use(require("@iktakahiro/markdown-it-katex"), {
        throwOnError: false,
        errorColor: "#cc0000",
        macros: {
          "\\Z": "\\mathbb{Z}",
          "*": "\\times",
        },
      });
    },
  },
};
