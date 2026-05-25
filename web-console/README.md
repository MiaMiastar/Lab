# 智慧实验室 · Web 控制台原型

基于产品设计方案的 **C 方案**：实验室大厅 + 实验工作台。

## 功能

- **实验室大厅**：搜索、状态/学科筛选、卡片展示在线状态/排队/标签
- **实验工作台**：醒目的 **「视频流接入」** 面板、双机位播放、HLS/MP4、平台 API 演示拉流
- 步骤引导、遥测读数、下发指令（模拟）、急停、结果时间轴

## 视频流接入位置

| 文件 | 作用 |
|------|------|
| `src/components/video/VideoStreamHub.tsx` | UI 接入点：地址输入、连接/断开、从 API 拉流 |
| `src/components/video/LivePlayer.tsx` | `<video>` 播放，HLS 使用 hls.js |
| `src/lib/streamsApi.ts` | 替换为 `GET /api/v1/labs/{labId}/streams` |

## 运行

```bash
cd web-console
npm install
npm run dev
```

浏览器打开 http://localhost:5173

## 路由

| 路径 | 页面 |
|------|------|
| `/` | 首页（概览 + 实验室大厅） |
| `/workbench/:labId` | 实验工作台 |
| `/workbench/:labId?observe=1` | 只读查看（占用中的实验室） |

## 技术栈

React 19 + TypeScript + Vite + React Router

数据为 `src/data/mock.ts` 静态模拟，后续可替换为 REST / WebSocket API。
