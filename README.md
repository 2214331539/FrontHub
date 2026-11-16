<div align="center">

# FrontHub

**一起发现、体验与维护值得学习的 Web 设计。**

一个由社区共同维护的 Web 设计合集，收录官网、在线应用、页面模板、组件文档、数据可视化与交互实验。

[在线体验](https://fronthub.vercel.app) · [推荐网站](https://github.com/2214331539/FrontHub/issues/new?template=site.yml) · [参与贡献](CONTRIBUTING.md) · [报告问题](https://github.com/2214331539/FrontHub/issues/new?template=bug.yml)

[![CI](https://github.com/2214331539/FrontHub/actions/workflows/ci.yml/badge.svg)](https://github.com/2214331539/FrontHub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-111111.svg)](LICENSE)
[![Contributions welcome](https://img.shields.io/badge/Contributions-welcome-555555.svg)](CONTRIBUTING.md)

</div>

## 为什么做 FrontHub

好的设计参考不应该只是一串书签。FrontHub 希望让每个案例都能被看见、体验和理解：浏览真实页面画面，尝试原站交互，了解它值得学习的细节，再找到相关源码。

这个项目面向设计师、前端开发者、产品团队与学习者。我们欢迎大家共同推荐作品、修正失效链接、完善描述和改进浏览体验，让它成为持续维护的公共参考库。

收录代表设计参考价值，不代表商业推荐、质量认证或与原站存在合作关系。

## 在线体验

**正式体验地址：[fronthub.vercel.app](https://fronthub.vercel.app)**

当前目录包含 **528 个页面、471 张真实封面、156 条公开仓库链接**，覆盖 7 种资源类型。数字对应当前内置数据快照，页面及第三方站点状态会随维护变化。

| 类型 | 可以找到什么 |
| --- | --- |
| 产品与机构官网 | 产品品牌、商业服务、文化机构与公共服务 |
| 页面模板 | 管理后台、博客、作品集与静态 HTML 模板 |
| 文档与组件 | 设计系统、组件库与文档主题 |
| 图表与地图 | 数据可视化、图编辑与地理信息案例 |
| 在线应用 | 编辑器、开发工具、绘图与文件处理 |
| 交互实验 | 创意编程、浏览器游戏与交互叙事 |
| 资源集合 | 设计灵感目录、模板库与实验合集 |

## 浏览方式

- **发现案例**：按领域、资源类型、风格搜索筛选，在网格与列表之间切换。
- **体验页面**：悬停允许内嵌的卡片，或手动开启交互预览；支持放大与返回封面。
- **追溯来源**：打开原页或关联仓库；明确区分页面源码与相关产品 / 库仓库。
- **整理参考**：收藏、记录笔记、自定义收录，并用 JSON / CSV 导入导出。
- **离线浏览**：已打包截图与单文件版本可以离线查看；原站交互需要网络。

收藏、笔记和自定义记录保存在当前浏览器，不会自动提交到社区目录，也不会跨设备同步。更换域名或浏览器前，请先导出备份。

第三方站点可能限制 iframe、要求登录或在所在网络不可达。FrontHub 尊重原站安全策略，无法保证每个页面都能内嵌；此时保留封面和原页入口。Vercel 地址在部分网络下的可用性也可能变化。

## 本地运行

需要 **Node.js 22+**。运行网站无需安装前端依赖。

```bash
git clone https://github.com/2214331539/FrontHub.git
cd FrontHub
npm run dev
```

打开 [localhost:4173](http://localhost:4173)。Windows 用户也可以双击根目录的 `启动 FrontHub.bat`。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地服务与实时预览状态接口 |
| `npm test` | 检查嵌入策略与状态检查逻辑 |
| `python tools/make_catalog.py` | 从可编辑目录生成页面数据，需要 Python 3.9+ |
| `npm run single` | 重新生成可离线打开的单文件版本 |
| `npm run capture -- --only="站点名称"` | 采集指定页面截图，需要 Chrome / Chromium |
| `npm run audit:embeds -- --only="站点名称"` | 更新指定页面的嵌入策略记录 |

直接打开 `site-atlas-standalone.html` 也能浏览；本地服务提供更完整的预览检查功能。

## 参与共建

不必先会写代码。你可以从以下方式开始：

- **推荐一个案例**：提交[网站推荐](https://github.com/2214331539/FrontHub/issues/new?template=site.yml)，说明入口和值得参考的细节。
- **维护已有案例**：报告失效地址、错误分类、无效截图或停止维护的项目。
- **完善项目**：改进交互、可访问性、性能、文档或检查工具。
- **直接提交 PR**：阅读 [贡献指南](CONTRIBUTING.md)，按 [收录标准](docs/curation.md) 准备内容。

协作流程为 **Issue / 小范围提案 → Fork 与分支 → 修改和验证 → Pull Request → 维护者审阅 → 合并**。小型修正可直接发 PR；较大的功能或结构调整请先用 Issue 对齐范围。CI 会检查测试、目录生成结果与单文件构建是否同步。

推荐进入审核不保证一定收录。我们重视可访问的原始入口、具体的参考价值、真实画面与准确来源，避免重复、推广堆砌和失效内容。

所有参与者请遵守 [社区行为规范](CODE_OF_CONDUCT.md)。安全问题请参考 [安全反馈说明](SECURITY.md)。

## 仓库结构

```text
FrontHub/
├── src/                    # 页面、样式、预览逻辑及生成数据
├── api/                    # Vercel 实时预览状态接口
├── tools/                  # 本地服务、目录生成、截图与检查工具
│   ├── catalog.txt         # 内置合集的可编辑来源
│   ├── catalog-meta.json   # 类型、批次、日期及来源信息
│   └── research/           # 分批核查证据与维护记录
├── docs/                   # 收录标准、维护操作与部署说明
├── .github/                # Issue / PR 模板与 CI
├── CONTRIBUTING.md         # 贡献流程与验证要求
├── index.html              # 多文件入口
└── site-atlas-standalone.html  # 离线单文件入口
```

技术栈为原生 HTML / CSS / JavaScript，配合 Node.js 工具与 Python 目录生成器。为了便于维护，手工编辑来源文件，再生成对应产物；不要直接修改生成数据。

## 部署与维护

线上体验版托管在 Vercel。你也可以 Fork 后部署自己的实例；项目已提供静态资源构建和 Serverless 状态检查接口。

- [Vercel 部署说明](docs/deployment.md)
- [目录收录标准](docs/curation.md)
- [截图、预览与历史维护操作](docs/maintenance.md)
- [最近一批目录核查记录](tools/research/2026-10-19-community-maintenance.md)

GitHub Actions 负责代码与数据一致性检查。当前线上实例使用 Vercel CLI 发布；自动跟随 GitHub 推送部署需要在 Vercel 中另行关联仓库。

## 接下来的方向

以下是欢迎讨论和贡献的方向，不代表已确定的交付计划：

- 更多语言、地区与行业的优质案例。
- 更容易参与的站点核查与截图更新流程。
- 更完整的键盘操作、移动端体验与可访问性。
- 降低截图载荷，改善首次加载与大目录浏览性能。

欢迎通过 [Issues](https://github.com/2214331539/FrontHub/issues) 讨论需求，也欢迎认领已有问题。仓库当前由 [@2214331539](https://github.com/2214331539) 维护，合并由维护者审阅决定。

## 许可与致谢

FrontHub 项目代码以 [MIT License](LICENSE) 开源。提交贡献即表示你有权贡献这些内容，并同意项目代码贡献按 MIT 许可证分发。

第三方网站、截图、品牌、商标、字体与其他外部内容仍由各自权利人享有权利，不因本仓库开源而获得额外授权。相关开源项目的代码复用应遵循各自许可证。涉及归属错误或需要调整展示内容，请提交 [Issue](https://github.com/2214331539/FrontHub/issues)。

感谢每个被收录作品的创作者、开源社区与参与维护的贡献者。
