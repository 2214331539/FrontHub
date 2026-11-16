# 贡献指南

感谢你参与 FrontHub。推荐网站、修正链接、改进文档和提交代码都是有价值的贡献。

## 选择贡献方式

- 推荐页面：使用网站推荐 Issue 模板，提供官方入口、类型、参考价值与来源。
- 报告问题：提供复现步骤、浏览器和预期结果。不要提交账号、令牌或个人笔记。
- 小型修复：可直接提交 PR，并说明解决的问题。
- 大型功能：先发 Issue 说明场景、范围和实现方向，避免重复工作。

先搜索现有目录和 Issues，确认没有重复。自荐可以参与，需说明与作品的关系，并遵循相同标准。

## 本地开发与分支

1. Fork 仓库并 clone 你的 Fork。
2. 从最新 `main` 创建描述性分支，例如 `content/add-example`、`fix/preview-timeout` 或 `docs/setup`。
3. 运行 `npm run dev`，在浏览器验证改动。
4. 保持 PR 范围集中，提交清晰的 commit 信息。
5. 推送分支并向上游 `main` 发起 PR，填写模板、关联 Issue 和验证结果。

维护者会检查内容质量、来源、兼容性和 CI 结果；如有修改意见，请继续提交到同一分支。合并前无需自行部署正式站点。通过检查不代表自动合并。

## 收录或修正页面

先阅读 [收录标准](docs/curation.md)。数据来源为 `tools/catalog.txt` 和 `tools/catalog-meta.json`。

目录每行格式：

```text
# 所属领域
Example|example.com/path|极简,浅色,专业|说明具体用途，以及布局或交互上值得参考的细节
```

URL 不写协议，不包含查询参数和片段。优先使用稳定的 HTTPS 官方入口。ID 由域名和路径生成：将 `/` 和 `.` 替换为 `_` 并转小写。已有 ID 关联用户收藏与笔记，修正入口时请先讨论兼容策略，不要随意删除或重建记录。

在元信息中按 ID 增加记录，例如：

```json
{
  "example_com_path": {
    "addedAt": "2026-11-16T12:00:00Z",
    "reviewedAt": "2026-11-16",
    "batchId": "2026-11-16-community",
    "kind": "template",
    "referenceUrl": "https://example.com/path",
    "source": {
      "type": "website",
      "url": "https://github.com/owner/repository"
    }
  }
}
```

`kind` 可选 `homepage`、`template`、`docs`、`visualization`、`app`、`experiment`、`collection`。缺省为 `homepage`。批次用于「本次新增」，不要修改旧条目的收录日期让其重新进入新增列表。

仅在确认对应页面 / 演示源码时使用 `source.type: website`；相关产品或库仓库使用 `product`。没有核实的仓库不要填写。仓库公开可见不代表允许任意复用。

生成并检查：

```bash
python tools/make_catalog.py
npm run audit:embeds -- --only="Example"
npm run capture -- --only="Example"
npm run single
npm test
```

截图需要 Chrome / Chromium，可通过 `CHROME_PATH` 指定路径。`--only` 按名称或域名子串匹配；批量精确更新请使用 `--ids-file=tools/research/你的批次-added-ids.json`，文件内容为 ID 数组。不要为了小修复重新抓取全目录。网络检查和截图不是 CI 的必需在线步骤；无法截图时如实说明，维护者可协助补齐。

提交生成后的目录和必要的截图 / 策略变更。检查截图是否为空白、验证码、排队页、错误页或未完成动画，不要用示意图冒充原站截图。批量收录请在 `tools/research/` 留存日期、来源、结果和暂缓理由；沿用已有记录结构，不覆盖历史证据。

## 代码与文档验证

- 运行 `npm test`，确保现有测试通过；行为修改需要有针对性的验证。
- 修改 HTML、CSS、JS 或生成数据后运行 `npm run single`，提交同步的单文件版本。
- 修改前端时检查桌面和移动端、搜索筛选、收藏笔记、预览开启与退出；UI 变化在 PR 中附画面。
- 修改 Vercel 构建时运行 `node tools/build-vercel.mjs`。
- 文档使用清晰、具体的描述，链接相对仓库位置，不加入本机绝对路径。
- 不提交 `node_modules`、`.vercel`、`dist`、密钥、个人存储或临时日志。

项目没有要求每次改动都运行远端全量采集。请注明没有验证的部分及原因。

## 审阅与发布

CI 检查测试、目录生成、单文件同步和部署构建。维护者审阅后决定是否合并，必要时将大 PR 拆分。部署权限与仓库贡献权限独立，合并 PR 不代表立即上线。涉及数据迁移或破坏兼容性的改动必须说明影响与迁移方式。
