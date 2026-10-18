# Header / Footer · EzGit

> 综合规范：[../../SITE-CONSISTENCY.md](../../SITE-CONSISTENCY.md)
> 状态：✅ 已对齐（2026-10-18）

## Header

- 全宽 `sticky top:0`，984px 容器；桌面 64px。
- 品牌纯文字 `EzGit`；中间搜索框；右侧主题 / 登录 / 添加仓库。
- ≤640px 折成两行：品牌 + 动作一行，搜索框第二行（有意例外）。

## Footer

- 全宽 top-border；纯文字 `EzGit` + 「EzGit · 管理和发现有价值的 GitHub 仓库」。
- 右侧：导出备份 / 导入备份 / GitHub / 反馈问题 / **主站 ↗** / © 2026 Kiang。
- 与 Header 无重复导航。

## 主题

- `data-theme` + `localStorage["kiang-theme"]`；跟随系统，可手动切换。

## 关键文件

- `ezgit/index.html`：Header / Footer / 主题逻辑均内联。

## 验证

```bash
cd ezgit && python3 -m http.server 8766
# 检查：Footer 主站入口、28px 纵向 padding、移动端 20px 边距、主题切换
```
