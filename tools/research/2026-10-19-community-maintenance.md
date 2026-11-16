# FrontHub 社区与页面扩展 · 2026-10-19

本轮共检查 140 个候选，收录 128 个，总数从 400 增至 528。保留原有全部 ID、收藏、笔记和自定义记录的存储方式。104 条新增记录关联了公开仓库；其中页面源码与相关产品 / 库仓库分别标注。

通过常规浏览器采集并逐张检查联系表，最终保留 121 张新增真实封面，目录共有 471 张有效封面。7 个新页面没有获得可用画面，保留明确缺图状态与原页入口。已清除排队验证页、骨架屏和不完整加载画面。

## 范围

| 新增领域           | 数量 |
| ------------------ | ---: |
| 后台与管理模板     |   13 |
| 博客与作品集       |   15 |
| 文档与组件库       |   19 |
| 数据可视化与地图   |   19 |
| 在线工具与开源应用 |   32 |
| 交互实验与游戏     |   15 |
| 文化与公共服务     |    8 |
| 商业与生活方式     |    7 |

资源类型与领域是两个独立维度。新增类型：页面模板 26、资源集合 3、文档与组件 20、图表与地图 14、在线应用 21、产品与机构官网 30、交互实验 14。另为 45 条既有记录补充类型。

## 检索、依据与维护决定

检索使用 GitHub 仓库搜索、公开网络搜索、仓库 README 和 About 链接，再访问实际页面核对。下表保留每一条的原页与仓库，完整 HTTP 标题、跳转、响应头和时间保存在候选报告；仓库 README 证据保存在 repositories.json，补充证据在 source-notes.json 与 repo-pages.json。

- 后台模板入口参考 [Tabler](https://github.com/tabler/tabler)、[AdminLTE](https://github.com/ColorlibHQ/AdminLTE)、[CoreUI](https://github.com/coreui/coreui-free-bootstrap-admin-template) 等官方仓库。
- 内容站点参考 [Astro 主题目录](https://astro.build/themes/)、[AstroPaper](https://github.com/satnaing/astro-paper)、[Fuwari](https://github.com/saicaca/fuwari) 与官方演示。
- 开源工具与交互实验结合 [Awesome Selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted)、[Creative Coding](https://github.com/terkelg/awesome-creative-coding) 等检索结果定位项目，最终以每个官方项目来源为准。
- Hugo Book 使用仓库指向的 book.alxs.dev；Recharts 使用 recharts.github.io；Chirpy 使用 cotes2020.github.io/chirpy-demo；Soybean 使用 naive.soybeanjs.cn。
- Stirling PDF 使用重定向后的 www.stirling.com；2048 使用作者 GitHub Pages；Spotify 归入在线应用并使用 open.spotify.com。
- [Shoelace](https://shoelace.style/) 官网标明停止活跃开发，保留历史参考并补充 [Web Awesome](https://webawesome.com/)。
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) 公告 2027-05-05 结束维护，简介注明日期，补充后继 [Zensical](https://zensical.org/)。
- Vue Element Admin、Soybean、Vben 的入口包含演示登录页，简介已注明。没有创建账号或绕过登录与访问限制。
- 未从图片大小推断页面可用：长等待后重新采集 AstroWind、Gapminder、Immich、Stirling PDF 等；移除了仍不完整的画面。AdminLTE 采用常规浏览器截图；Mermaid / Shoelace 关闭可见提示后采集，Patatap 按页面提示触发交互后采集。

## 预览与实现

新增 128 页响应头检查：允许尝试 100，明确限制 26，未知 2。全目录：允许尝试 246，明确限制 245，未知 37。响应头未发现限制不保证页面可完整加载；第三方页面可能随时改变。未使用代理或移除远端安全策略。

增加 7 类资源筛选、卡片类型标记、直接仓库入口、公开仓库与页面源码两种导航；分类由数据自动生成。本次新增按 batchId 独立识别，支持同日多轮更新。修复 Windows Chrome 可执行文件识别，支持自然动画重采，并让采集标签页获得前台绘制机会。

## 验证

- 9 项既有自动测试通过。
- 目录 528 条 ID 和 URL 唯一，原 400 条 ID 全部保留。
- 浏览器检查批次 128 条、7 类筛选、分页、最近排序、公开仓库与页面源码、详情与核查日期。
- 验证旧收藏、笔记和自定义记录；检查 390 / 768 / 820 / 1024 / 1440 px 布局。
- 单文件版本同步打包，并检查 HTTP 与 file:// 下的数量、筛选和无外部静态依赖。

## 完整新增清单

“页面”表示对应页面 / 演示源码；“项目”表示产品或库仓库，不保证该官网也在仓库内。公开仓库不等于无条件授权，复用需阅读原项目许可证。

| 页面                                                                                         | 类型           | 仓库                                                                               | 封面         |
| -------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- | ------------ |
| [Tabler Demo](https://preview.tabler.io)                                                     | 页面模板       | [页面](https://github.com/tabler/tabler)                                           | 已复核       |
| [AdminLTE Demo](https://adminlte.io/themes/v3)                                               | 页面模板       | [页面](https://github.com/ColorlibHQ/AdminLTE)                                     | 已复核       |
| [CoreUI Demo](https://coreui.io/demos/bootstrap/5.0/free)                                    | 页面模板       | [页面](https://github.com/coreui/coreui-free-bootstrap-admin-template)             | 已复核       |
| [SB Admin 2](https://startbootstrap.github.io/startbootstrap-sb-admin-2)                     | 页面模板       | [页面](https://github.com/StartBootstrap/startbootstrap-sb-admin-2)                | 已复核       |
| [Sneat HTML](https://demos.themeselection.com/sneat-bootstrap-html-admin-template-free/html) | 页面模板       | [页面](https://github.com/themeselection/sneat-bootstrap-html-admin-template-free) | 已复核       |
| [Vue Element Admin](https://panjiachen.github.io/vue-element-admin)                          | 页面模板       | [页面](https://github.com/PanJiaChen/vue-element-admin)                            | 已复核       |
| [Ant Design Pro](https://preview.pro.ant.design)                                             | 页面模板       | [页面](https://github.com/ant-design/ant-design-pro)                               | 已复核       |
| [Soybean Admin](https://naive.soybeanjs.cn)                                                  | 页面模板       | [页面](https://github.com/soybeanjs/soybean-admin)                                 | 已复核       |
| [Vben Admin](https://www.vben.pro)                                                           | 页面模板       | [页面](https://github.com/vbenjs/vue-vben-admin)                                   | 已复核       |
| [shadcn Admin](https://shadcn-admin.netlify.app)                                             | 页面模板       | [页面](https://github.com/satnaing/shadcn-admin)                                   | 已复核       |
| [Vuestic Admin](https://admin.vuestic.dev)                                                   | 页面模板       | [页面](https://github.com/epicmaxco/vuestic-admin)                                 | 已复核       |
| [Gentelella](https://colorlib.com/polygon/gentelella/index.html)                             | 页面模板       | [页面](https://github.com/ColorlibHQ/gentelella)                                   | 已复核       |
| [Sakai Vue](https://sakai.primevue.org)                                                      | 页面模板       | [页面](https://github.com/primefaces/sakai-vue)                                    | 已复核       |
| [AstroPaper](https://astro-paper.pages.dev)                                                  | 页面模板       | [页面](https://github.com/satnaing/astro-paper)                                    | 已复核       |
| [Fuwari](https://fuwari.vercel.app)                                                          | 页面模板       | [页面](https://github.com/saicaca/fuwari)                                          | 已复核       |
| [AstroWind](https://astrowind.vercel.app)                                                    | 页面模板       | [页面](https://github.com/onwidget/astrowind)                                      | 已复核       |
| [Astro Cactus](https://astro-cactus.chriswilliams.dev)                                       | 页面模板       | [页面](https://github.com/chrismwilliams/astro-theme-cactus)                       | 已复核       |
| [Astro Nano](https://astro-nano-demo.vercel.app)                                             | 页面模板       | [页面](https://github.com/markhorn-dev/astro-nano)                                 | 已复核       |
| [Astro Sphere](https://astro-sphere-demo.vercel.app)                                         | 页面模板       | [页面](https://github.com/markhorn-dev/astro-sphere)                               | 已复核       |
| [Hugo PaperMod](https://adityatelange.github.io/hugo-PaperMod)                               | 页面模板       | [页面](https://github.com/adityatelange/hugo-PaperMod)                             | 已复核       |
| [Hugo Book](https://book.alxs.dev)                                                           | 页面模板       | [页面](https://github.com/alex-shpak/hugo-book)                                    | 已复核       |
| [Chirpy](https://cotes2020.github.io/chirpy-demo)                                            | 页面模板       | [页面](https://github.com/cotes2020/jekyll-theme-chirpy)                           | 已复核       |
| [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes)                             | 页面模板       | [页面](https://github.com/mmistakes/minimal-mistakes)                              | 已复核       |
| [Beautiful Jekyll](https://beautifuljekyll.com)                                              | 页面模板       | [页面](https://github.com/daattali/beautiful-jekyll)                               | 已复核       |
| [al-folio](https://alshedivat.github.io/al-folio)                                            | 页面模板       | [页面](https://github.com/alshedivat/al-folio)                                     | 已复核       |
| [Just the Docs](https://just-the-docs.github.io/just-the-docs)                               | 页面模板       | [页面](https://github.com/just-the-docs/just-the-docs)                             | 已复核       |
| [HTML5 UP](https://html5up.net)                                                              | 资源集合       | 未确认                                                                             | 已复核       |
| [Start Bootstrap](https://startbootstrap.com)                                                | 资源集合       | 未确认                                                                             | 已复核       |
| [VitePress](https://vitepress.dev)                                                           | 文档与组件     | [项目](https://github.com/vuejs/vitepress)                                         | 已复核       |
| [Nextra](https://nextra.site)                                                                | 文档与组件     | [项目](https://github.com/shuding/nextra)                                          | 已复核       |
| [Fumadocs](https://fumadocs.dev)                                                             | 文档与组件     | [项目](https://github.com/fuma-nama/fumadocs)                                      | 已复核       |
| [Material for MkDocs](https://squidfunk.github.io/mkdocs-material)                           | 文档与组件     | [项目](https://github.com/squidfunk/mkdocs-material)                               | 已复核       |
| [Docsify](https://docsify.js.org)                                                            | 文档与组件     | [项目](https://github.com/docsifyjs/docsify)                                       | 已复核       |
| [Scalar](https://scalar.com)                                                                 | 文档与组件     | [项目](https://github.com/scalar/scalar)                                           | 已复核       |
| [Storybook](https://storybook.js.org)                                                        | 文档与组件     | [项目](https://github.com/storybookjs/storybook)                                   | 已复核       |
| [Radix UI](https://www.radix-ui.com)                                                         | 文档与组件     | [项目](https://github.com/radix-ui/primitives)                                     | 已复核       |
| [Mantine](https://mantine.dev)                                                               | 文档与组件     | [项目](https://github.com/mantinedev/mantine)                                      | 已复核       |
| [Chakra UI](https://chakra-ui.com)                                                           | 文档与组件     | [项目](https://github.com/chakra-ui/chakra-ui)                                     | 已复核       |
| [Ant Design](https://ant.design)                                                             | 文档与组件     | [项目](https://github.com/ant-design/ant-design)                                   | 已复核       |
| [Element Plus](https://element-plus.org)                                                     | 文档与组件     | [项目](https://github.com/element-plus/element-plus)                               | 已复核       |
| [Naive UI](https://www.naiveui.com)                                                          | 文档与组件     | [项目](https://github.com/tusen-ai/naive-ui)                                       | 已复核       |
| [Shoelace](https://shoelace.style)                                                           | 文档与组件     | [项目](https://github.com/shoelace-style/shoelace)                                 | 已复核       |
| [DaisyUI](https://daisyui.com)                                                               | 文档与组件     | [项目](https://github.com/saadeghi/daisyui)                                        | 已复核       |
| [USWDS](https://designsystem.digital.gov)                                                    | 文档与组件     | [项目](https://github.com/uswds/uswds)                                             | 已复核       |
| [GOV.UK Design System](https://design-system.service.gov.uk)                                 | 文档与组件     | [页面](https://github.com/alphagov/govuk-design-system)                            | 已复核       |
| [Apache ECharts Examples](https://echarts.apache.org/examples/en/index.html)                 | 图表与地图     | [项目](https://github.com/apache/echarts)                                          | 已复核       |
| [D3](https://d3js.org)                                                                       | 图表与地图     | [项目](https://github.com/d3/d3)                                                   | 已复核       |
| [Vega-Lite Examples](https://vega.github.io/vega-lite/examples)                              | 图表与地图     | [项目](https://github.com/vega/vega-lite)                                          | 已复核       |
| [Chart.js Samples](https://www.chartjs.org/docs/latest/samples)                              | 图表与地图     | [项目](https://github.com/chartjs/Chart.js)                                        | 已复核       |
| [Nivo](https://nivo.rocks)                                                                   | 图表与地图     | [项目](https://github.com/plouc/nivo)                                              | 已复核       |
| [Recharts](https://recharts.github.io)                                                       | 图表与地图     | [项目](https://github.com/recharts/recharts)                                       | 已复核       |
| [AntV G2](https://g2.antv.antgroup.com)                                                      | 图表与地图     | [项目](https://github.com/antvis/G2)                                               | 已复核       |
| [AntV X6](https://x6.antv.antgroup.com)                                                      | 图表与地图     | [项目](https://github.com/antvis/X6)                                               | 已复核       |
| [React Flow](https://reactflow.dev)                                                          | 图表与地图     | [项目](https://github.com/xyflow/xyflow)                                           | 已复核       |
| [Mermaid Live Editor](https://mermaid.live)                                                  | 在线应用       | [页面](https://github.com/mermaid-js/mermaid-live-editor)                          | 已复核       |
| [Excalidraw Mermaid](https://mermaid-to-excalidraw.vercel.app)                               | 在线应用       | [页面](https://github.com/excalidraw/mermaid-to-excalidraw)                        | 已复核       |
| [Leaflet](https://leafletjs.com)                                                             | 图表与地图     | [项目](https://github.com/Leaflet/Leaflet)                                         | 已复核       |
| [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs)                                   | 图表与地图     | [项目](https://github.com/maplibre/maplibre-gl-js)                                 | 已复核       |
| [OpenLayers](https://openlayers.org)                                                         | 图表与地图     | [项目](https://github.com/openlayers/openlayers)                                   | 已复核       |
| [deck.gl](https://deck.gl)                                                                   | 图表与地图     | [项目](https://github.com/visgl/deck.gl)                                           | 已复核       |
| [Kepler.gl Demo](https://kepler.gl/demo)                                                     | 在线应用       | [页面](https://github.com/keplergl/kepler.gl)                                      | 已复核       |
| [OpenStreetMap](https://www.openstreetmap.org)                                               | 在线应用       | [页面](https://github.com/openstreetmap/openstreetmap-website)                     | 已复核       |
| [Our World in Data](https://ourworldindata.org)                                              | 图表与地图     | [项目](https://github.com/owid/owid-grapher)                                       | 已复核       |
| [Gapminder Tools](https://www.gapminder.org/tools)                                           | 在线应用       | [页面](https://github.com/Gapminder/tools-page)                                    | 已复核       |
| [Squoosh](https://squoosh.app)                                                               | 在线应用       | [页面](https://github.com/GoogleChromeLabs/squoosh)                                | 已复核       |
| [SVGOMG](https://jakearchibald.github.io/svgomg)                                             | 在线应用       | [页面](https://github.com/jakearchibald/svgomg)                                    | 已复核       |
| [Photopea](https://www.photopea.com)                                                         | 在线应用       | 未确认                                                                             | 已复核       |
| [diagrams.net](https://app.diagrams.net)                                                     | 在线应用       | [页面](https://github.com/jgraph/drawio)                                           | 已复核       |
| [JSON Crack](https://jsoncrack.com/editor)                                                   | 在线应用       | [页面](https://github.com/AykutSarac/jsoncrack.com)                                | 已复核       |
| [IT Tools](https://it-tools.tech)                                                            | 在线应用       | [页面](https://github.com/CorentinTh/it-tools)                                     | 已复核       |
| [CyberChef](https://gchq.github.io/CyberChef)                                                | 在线应用       | [页面](https://github.com/gchq/CyberChef)                                          | 已复核       |
| [Hoppscotch](https://hoppscotch.io)                                                          | 在线应用       | [页面](https://github.com/hoppscotch/hoppscotch)                                   | 已复核       |
| [Regex101](https://regex101.com)                                                             | 在线应用       | 未确认                                                                             | 已复核       |
| [RegExr](https://regexr.com)                                                                 | 在线应用       | [页面](https://github.com/gskinner/regexr)                                         | 已复核       |
| [Carbon](https://carbon.now.sh)                                                              | 在线应用       | [页面](https://github.com/carbon-app/carbon)                                       | 已复核       |
| [Ray.so](https://ray.so)                                                                     | 在线应用       | [页面](https://github.com/raycast/ray-so)                                          | 已复核       |
| [Reactive Resume](https://rxresu.me)                                                         | 在线应用       | [项目](https://github.com/AmruthPillai/Reactive-Resume)                            | 已复核       |
| [OpenResume](https://www.open-resume.com)                                                    | 在线应用       | [页面](https://github.com/xitanggg/open-resume)                                    | 已复核       |
| [PairDrop](https://pairdrop.net)                                                             | 在线应用       | [页面](https://github.com/schlagmichdoch/PairDrop)                                 | 已复核       |
| [LocalSend](https://localsend.org)                                                           | 产品与机构官网 | [项目](https://github.com/localsend/localsend)                                     | 已复核       |
| [Stirling PDF](https://www.stirling.com)                                                     | 产品与机构官网 | [项目](https://github.com/Stirling-Tools/Stirling-PDF)                             | 已复核       |
| [HedgeDoc](https://hedgedoc.org)                                                             | 产品与机构官网 | [项目](https://github.com/hedgedoc/hedgedoc)                                       | 已复核       |
| [Karakeep](https://karakeep.app)                                                             | 产品与机构官网 | [项目](https://github.com/karakeep-app/karakeep)                                   | 已复核       |
| [Mealie](https://mealie.io)                                                                  | 文档与组件     | [项目](https://github.com/mealie-recipes/mealie)                                   | 已复核       |
| [Immich](https://immich.app)                                                                 | 产品与机构官网 | [项目](https://github.com/immich-app/immich)                                       | 已复核       |
| [Jellyfin](https://jellyfin.org)                                                             | 产品与机构官网 | [项目](https://github.com/jellyfin/jellyfin)                                       | 已复核       |
| [Home Assistant](https://www.home-assistant.io)                                              | 产品与机构官网 | [项目](https://github.com/home-assistant/frontend)                                 | 已复核       |
| [Actual Budget](https://actualbudget.org)                                                    | 产品与机构官网 | [项目](https://github.com/actualbudget/actual)                                     | 已复核       |
| [Formbricks](https://formbricks.com)                                                         | 产品与机构官网 | [项目](https://github.com/formbricks/formbricks)                                   | 已复核       |
| [Appsmith](https://www.appsmith.com)                                                         | 产品与机构官网 | [项目](https://github.com/appsmithorg/appsmith)                                    | 已复核       |
| [ToolJet](https://www.tooljet.com)                                                           | 产品与机构官网 | [项目](https://github.com/ToolJet/ToolJet)                                         | 已复核       |
| [Budibase](https://budibase.com)                                                             | 产品与机构官网 | [项目](https://github.com/Budibase/budibase)                                       | 已复核       |
| [NocoDB](https://nocodb.com)                                                                 | 产品与机构官网 | [项目](https://github.com/nocodb/nocodb)                                           | 已复核       |
| [Baserow](https://baserow.io)                                                                | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [ERPNext](https://frappe.io/erpnext)                                                         | 产品与机构官网 | [项目](https://github.com/frappe/erpnext)                                          | 已复核       |
| [Odoo](https://www.odoo.com)                                                                 | 产品与机构官网 | [项目](https://github.com/odoo/odoo)                                               | 暂无可用封面 |
| [WebGL Fluid Simulation](https://paveldogreat.github.io/WebGL-Fluid-Simulation)              | 交互实验       | [页面](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)                     | 已复核       |
| [WebGL Water](https://madebyevan.com/webgl-water)                                            | 交互实验       | [页面](https://github.com/evanw/webgl-water)                                       | 已复核       |
| [The Book of Shaders](https://thebookofshaders.com)                                          | 交互实验       | [页面](https://github.com/patriciogonzalezvivo/thebookofshaders)                   | 暂无可用封面 |
| [p5.js Examples](https://p5js.org/examples)                                                  | 交互实验       | [项目](https://github.com/processing/p5.js)                                        | 已复核       |
| [Hydra](https://hydra.ojack.xyz)                                                             | 交互实验       | [页面](https://github.com/hydra-synth/hydra)                                       | 已复核       |
| [Patatap](https://patatap.com)                                                               | 交互实验       | 未确认                                                                             | 已复核       |
| [Chrome Music Lab](https://musiclab.chromeexperiments.com)                                   | 交互实验       | [项目](https://github.com/googlecreativelab/chrome-music-lab)                      | 已复核       |
| [Chrome Music Lab Song Maker](https://musiclab.chromeexperiments.com/Song-Maker)             | 交互实验       | 未确认                                                                             | 已复核       |
| [2048](https://gabrielecirulli.github.io/2048)                                               | 交互实验       | [页面](https://github.com/gabrielecirulli/2048)                                    | 已复核       |
| [Sandspiel](https://sandspiel.club)                                                          | 交互实验       | [页面](https://github.com/MaxBittker/sandspiel)                                    | 已复核       |
| [Little Alchemy 2](https://littlealchemy2.com)                                               | 交互实验       | 未确认                                                                             | 已复核       |
| [Nicky Case](https://ncase.me)                                                               | 资源集合       | [页面](https://github.com/ncase/ncase.github.io)                                   | 已复核       |
| [The Evolution of Trust](https://ncase.me/trust)                                             | 交互实验       | [页面](https://github.com/ncase/trust)                                             | 暂无可用封面 |
| [LOOPY](https://ncase.me/loopy)                                                              | 交互实验       | [页面](https://github.com/ncase/loopy)                                             | 已复核       |
| [Red Blob Games](https://www.redblobgames.com)                                               | 交互实验       | 未确认                                                                             | 已复核       |
| [NASA](https://www.nasa.gov)                                                                 | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [European Space Agency](https://www.esa.int)                                                 | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [CERN](https://home.cern)                                                                    | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [Rijksmuseum](https://www.rijksmuseum.nl/en)                                                 | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [Victoria and Albert Museum](https://www.vam.ac.uk)                                          | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [GOV.UK](https://www.gov.uk)                                                                 | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [Internet Archive](https://archive.org)                                                      | 产品与机构官网 | 未确认                                                                             | 暂无可用封面 |
| [Wikimedia Commons](https://commons.wikimedia.org/wiki/Main_Page)                            | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [Airbnb](https://www.airbnb.com)                                                             | 产品与机构官网 | 未确认                                                                             | 暂无可用封面 |
| [Patagonia](https://www.patagonia.com)                                                       | 产品与机构官网 | 未确认                                                                             | 暂无可用封面 |
| [MUJI](https://www.muji.com)                                                                 | 产品与机构官网 | 未确认                                                                             | 暂无可用封面 |
| [IKEA](https://www.ikea.com)                                                                 | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [Spotify Web](https://open.spotify.com)                                                      | 在线应用       | 未确认                                                                             | 已复核       |
| [Wise](https://wise.com)                                                                     | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [Headspace](https://www.headspace.com)                                                       | 产品与机构官网 | 未确认                                                                             | 已复核       |
| [Web Awesome](https://webawesome.com)                                                        | 文档与组件     | [项目](https://github.com/shoelace-style/webawesome)                               | 已复核       |
| [Zensical](https://zensical.org)                                                             | 文档与组件     | [项目](https://github.com/zensical/zensical)                                       | 已复核       |

## 暂缓收录的候选

| 候选                                                                                         | 本轮检查                                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------- |
| [Flowbite Admin](https://flowbite-admin-dashboard.vercel.app)                                | 429 · Vercel Security Checkpoint                              |
| [Volt Dashboard](https://demo.themesberg.com/volt)                                           | 429 · Vercel Security Checkpoint                              |
| [Material Dashboard](https://demos.creative-tim.com/material-dashboard/pages/dashboard.html) | 404 · The page you were looking for doesn't exist (404 demos) |
| [Observable Plot](https://observablehq.com/plot)                                             | 429 · Vercel Security Checkpoint                              |
| [Shadertoy](https://www.shadertoy.com)                                                       | 403 · 没有取得完整页面                                        |
| [Hextris](https://hextris.io)                                                                | fetch failed · 没有取得完整页面                               |
| [Neal.fun](https://neal.fun)                                                                 | 403 · Just a moment...                                        |
| [Smithsonian](https://www.si.edu)                                                            | 403 · Smithsonian request verification                        |
| [The Met](https://www.metmuseum.org)                                                         | 429 · Vercel Security Checkpoint                              |
| [Booking.com](https://www.booking.com)                                                       | 202 · 没有取得完整页面                                        |
| [Aesop](https://www.aesop.com)                                                               | 403 · Just a moment...                                        |
| [Revolut](https://www.revolut.com)                                                           | 403 · Just a quick security check                             | Revolut |

## 未取得可用封面的新增页面

| 页面                   | 原因                               |
| ---------------------- | ---------------------------------- |
| Odoo                   | 浏览器访问要求验证                 |
| The Book of Shaders    | 顶部图形区域未完整渲染             |
| The Evolution of Trust | 资源仍在加载，未作为成品画面       |
| Internet Archive       | 主体内容未完成加载                 |
| Airbnb                 | 未完整加载住宿内容，只有导航和页脚 |
| Patagonia              | 访问排队页，不作为封面             |
| MUJI                   | 浏览器网络协议错误                 |
