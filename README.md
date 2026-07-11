# Campus Books

校园二手书交易平台，采用 Monorepo 统一管理前后端代码。

## 项目结构

```text
campus-books/
├── backend/   # 后端服务
└── frontend/  # Vue 前端应用
```

## 模块说明

- [`backend/`](./backend/)：校园图书平台后端服务与 API。
- [`frontend/`](./frontend/)：校园图书平台 Vue 前端应用。

各模块的依赖、环境变量和启动方式以对应目录中的配置文件为准。

## 仓库迁移

本仓库由 `campus-books-backend` 与 `campus-books-frontend` 合并而成，并保留了两个源仓库的 Git 提交历史。
