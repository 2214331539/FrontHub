# 部署 FrontHub

官方体验版：https://fronthub.vercel.app

## Vercel

1. Fork 仓库，在 Vercel 中导入你的 Fork 并授予相应 GitHub 访问权限。
2. Framework Preset 使用 Other。根目录为仓库根目录。
3. 仓库的 `vercel.json` 已指定构建命令 `node tools/build-vercel.mjs` 和输出目录 `dist`。
4. 部署后检查首页、截图、筛选和 `/api/preview-status?id=not-in-catalog`；未知 ID 应返回 HTTP 404 和 `{"record":null}`。

也可以在仓库目录使用 CLI：

```bash
npx vercel login
npx vercel deploy --prod
```

Vercel 首次关联时项目名称使用小写，例如 `fronthub`。`.vercel/` 保存本机项目关联信息，不要提交。当前接口不需要额外环境变量，只接受目录中的 ID；不会代理网页内容。

正式体验版当前由维护者通过 CLI 发布，未完成 GitHub 自动部署关联。你自己的实例可在 Vercel 授权仓库后启用 Git 集成。免费方案的适用范围和额度以 Vercel 当前条款为准。

## 静态托管

`index.html` 和 `src/` 可以部署到普通静态托管。静态托管不运行状态检查接口，页面会使用已有嵌入记录。单文件 `site-atlas-standalone.html` 可以单独分发。

第三方 iframe 是否可加载取决于目标站安全策略和访问者网络；部署不能解除限制。收藏和笔记按浏览器来源保存，迁移域名前提醒用户导出备份。
