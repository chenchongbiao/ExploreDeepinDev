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
        text: '技术星图',
        items: [
          { text: "chroot：从原理到实践", link: '/code-spectrum/chroot' }
        ]
      },
      {
        text: '工具及网站的介绍',
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
          { text: '深入理解 Linux 系统的核心', link: '/system/linux' },
          { text: 'Linux 系统与发行版的关系——从安卓到 deepin 的多样性', link: '/system/linux-distro' },
          { text: 'U-Boot与GRUB引导机制', link: '/system/uboot-grub' },
          { text: 'UEFI vs 传统 BIOS对比', link: '/system/uefi-and-legacy' },
          { text: 'ISO与IMG镜像的全面对比', link: '/system/iso-img' },
          { text: '虚拟机软件', link: '/system/CodeVM-Lab' },
          { text: '安装 deepin 系统', link: '/system/install-deepin' },
          {
            text: '系统移植',
            items: [
              { text: '树莓派移植 deepin 系统', link: '/system/system-porting/deepin-raspberrypi' },
              { text: 'RDK-X5 移植 deepin 系统', link: '/system/system-porting/rdk-x5' },
              { text: '随身WIFI安装 deepin 流程', link: '/system/system-porting/Qualcomm410' },
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
            text: 'C',
            items: [
              { text: '还在用VC6写C语言吗？', link: '/dev-environment-guide/languages/C/Goodbye-VC6-Hello-GCC-On-deepin' },
              { text: '配置环境', link: '/dev-environment-guide/languages/C/deepin-c' },
              { text: '基础语法', link: '...' },
            ]
          },
          {
            text: 'C++',
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
              { text: '配置环境', link: '/dev-environment-guide/languages/Python/deepin-python' },
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
            { text: '树莓派移植 deepin 系统', link: '/system/system-porting/deepin-raspberrypi' },
            { text: 'RDK X5 移植 deepin 系统', link: '/system/system-porting/rdk-x5' },
            { text: '随身WIFI安装 deepin 流程', link: '/system/system-porting/Qualcomm410' },
            { text: '翡丽 F12 平板移植 deepin 流程', link: '/system/system-porting/fily-f12pad' },
          ]
        }
      ],
      '/dev-environment-guide/languages/C': [
        {
          text: 'C',
          items: [
            { text: '还在用VC6写C语言吗？', link: '/dev-environment-guide/languages/C/Goodbye-VC6-Hello-GCC-On-deepin' },
            { text: '配置环境', link: '/dev-environment-guide/languages/C/deepin-c' },
          ]
        }
      ],
      '/dev-environment-guide/languages/Python': [
        {
          text: 'Python',
          items: [
            { text: '配置环境', link: '/dev-environment-guide/languages/Python/deepin-python' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chenchongbiao/' }
    ]
  }
})
