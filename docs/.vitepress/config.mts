import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/ExploreDeepinDev/',
  title: "Explore deepin dev",
  description: "记录使用 deepin 操作系统进行学习和开发的过程与经验分享。通过 deepin 系统进行更便捷的开发和搭建环境。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: '工具的介绍',
        items: [
          {
            text: '代码管理',
            items: [
              { text: 'Github', link: '...' }
            ]
          },
        ]
      },
      {
        text: '操作系统',
        items: [
          { text: 'Linux 系统', link: '/system/linux.md' },
          { text: '虚拟机软件', link: '...' },
          {
            text: '系统移植',
            items: [
              { text: '树莓派移植 deepin 系统', link: '/system/system-porting/deepin-raspberrypi.md' },
              { text: 'RDK-X5 移植 deepin 系统', link: '/system/system-porting/rdk-x5.md' },
            ]
          },
        ]
      },
      {
        text: '编程语言',
        items: [
          {
            text: 'Shell',
            items: [
              { text: '基础语法', link: '...' },
            ]
          },
          {
            text: 'C/C++',
            items: [
              { text: '基础语法', link: '...' },
            ]
          },
          {
            text: 'Java',
            items: [
              { text: '基础语法', link: '...' },
            ]
          },
          {
            text: 'JavaScript/TypeScript',
            items: [
              { text: '基础语法', link: '...' },
            ]
          },
          {
            text: 'Python',
            items: [
              { text: '基础语法', link: '...' },
            ]
          },
        ]
      }
    ],

    sidebar: {
      '/system/system-porting/': [
        {
          text: '系统移植',
          items: [
            { text: '树莓派移植 deepin 系统', link: '/system/system-porting/deepin-raspberrypi.md' },
            { text: 'RDK X5 移植 deepin 系统', link: '/system/system-porting/rdk-x5.md' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chenchongbiao/' }
    ]
  }
})
