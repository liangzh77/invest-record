# 投资记录系统

用于跟踪和管理投资信源与交易状态的 Web 应用。

## 功能

- 记录投资信息：日期、名称、方向、价格、时段、信源、逻辑
- 信源状态：进行中 → 盈利/亏损
- 交易状态：未交易 → 进行中 → 盈利/亏损
- 按信源筛选
- 交易模式开关（切换信源视图/交易视图）
- 全文搜索
- 点击字段直接编辑
- 用户登录认证

## 技术栈

- Next.js 14
- TypeScript
- PostgreSQL (Neon 云数据库)
- Prisma ORM
- Tailwind CSS

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量（复制 .env.example 并修改）
cp .env.example .env

# 同步数据库
npm run db:push

# 初始化管理员账号
npm run db:seed

# 启动
npm run dev
```

## 默认账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| admin | admin123 | 管理员 |
| liang | 123456 | 普通用户 |

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建
npm run db:push      # 同步数据库结构
npm run db:seed      # 初始化种子数据
```

## 数据备份

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/export-csv.ts
```

导出 CSV 文件到 `backup/` 目录。

## 目录结构

```
├── app/api/          接口路由
├── components/       React 组件
├── lib/              工具函数
├── prisma/           数据库配置
├── scripts/          脚本工具
└── backup/           数据备份
```

## 记录字段

| 字段 | 说明 | 示例 |
|------|------|------|
| 日期 | 记录日期 | 2026-01-21 |
| 名称 | 投资标的 | 美国中盘 IWM |
| 方向 | 多/空 | 多 |
| 价格 | 入场价格 | 262.58 |
| 时段 | 持有周期 | 26/6、长期 |
| 信源 | 信息来源 | 爆、鹤、顾 |
| 逻辑 | 投资逻辑 | 降息 |
| 信源状态 | 进行中/盈利/亏损 | - |
| 交易状态 | 未交易/进行中/盈利/亏损 | - |
