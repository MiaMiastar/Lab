# 智慧实验室（Smart Lab Hub）产品需求文档（PRD）

| 属性 | 值 |
|------|-----|
| 产品名称 | 智慧实验室（Smart Lab Hub） |
| 文档版本 | v2.0 |
| 更新日期 | 2026-05-24 |
| 文档状态 | 评审稿 |
| 产品形态 | Web 控制台（大厅 + 实验工作台）+ 中心 API + 边缘 Agent + 媒体服务 |
| 读者 | 产品、研发、测试、实施 |

---

## 目录

1. [产品概述](#1-产品概述)
2. [术语与枚举](#2-术语与枚举)
3. [数据模型与属性字典](#3-数据模型与属性字典)
4. [页面与交互规格](#4-页面与交互规格)
5. [接口规格](#5-接口规格)
6. [功能需求清单](#6-功能需求清单)
7. [状态机与业务规则](#7-状态机与业务规则)
8. [非功能需求](#8-非功能需求)
9. [版本规划](#9-版本规划)

---

## 1. 产品概述

### 1.1 产品定位

智慧实验室是面向教育科研、企业研发与检测机构的**远程实验室联邦平台**。用户在中心控制台浏览多个物理实验室、选择目标实验室、按标准化流程下发操作指令；边缘侧执行并回传**结构化结果**与**实时/回放视频**，形成闭环：

**选实验室 → 发指令 → 看过程 → 拿结果**

### 1.2 核心价值

| 价值点 | 说明 |
|--------|------|
| 资源联邦 | 多校区、多机构实验室统一目录与状态可见 |
| 标准指令 | 平台与边缘以统一指令契约交互，可编排、可审计 |
| 双通道回传 | 结构化数据 + 视频直播/录像同步关联 |
| 安全可控 | 权限、审批、急停与现场联锁优先 |

### 1.3 产品目标与 KPI

| 目标 ID | 描述 | 验收指标 |
|---------|------|----------|
| G1 | 快速找到可用实验室 | 从打开首页到进入工作台 ≤ 3 次点击，首屏加载 P95 < 2s |
| G2 | 实验过程可观测 | 单次会话至少 1 路视频可播放 + 步骤或设备日志可见 |
| G3 | 过程可留痕 | 每条结果可关联 `commandId` 与可选录像片段 |
| G4 | 安全可保障 | 急停请求响应 < 1s；硬件联锁不可被远程绕过 |

| KPI | 目标值 |
|-----|--------|
| 注册实验室月活连接率 | ≥ 80% |
| 指令成功率（不含用户取消） | ≥ 95% |
| 会话级视频卡顿率 | < 5% |
| 远程误操作导致的安全事故 | 0 |

### 1.4 用户角色

| 角色代码 | 角色名称 | 说明 |
|----------|----------|------|
| `student` | 学生 | 完成教师分配的任务，在剧本范围内操作 |
| `teacher` | 教师 | 监控课堂、观察占用实验室、编排任务（后续） |
| `operator` | 实验员 | 现场维护、响应告警、必要时物理介入 |
| `lab_admin` | 实验室管理员 | 注册实验室、配置设备与机位、配额 |
| `platform_ops` | 平台运营 | 多租户、审计、SLA、计费（后续） |

---

## 2. 术语与枚举

### 2.1 术语表

| 术语 | 英文 | 定义 |
|------|------|------|
| 租户 | Tenant | 平台最顶层隔离单位，如学校、企业 |
| 实验室 | Lab | 一个物理站点在平台上的注册与调度单元 |
| 实验场景 | Experiment Scenario | 可在平台上编排、下发与复用的标准化实验流程单元，如「ATA 反应条件优化」 |
| 会话 | Session | 用户在某实验室上的一次实验占用周期 |
| 指令 | Command | 平台下发给边缘的一条可执行动作 |
| 实验步骤 | Experiment Step | 剧本或会话内的逻辑步骤，可映射到指令 |
| 机位 | Stream / Camera Angle | 一路视频采集视角 |
| 工作台 | Workbench | 单实验室详情页，含信息、视频、步骤/日志 |
| 观察模式 | Observe Mode | 对占用中实验室的只读查看，URL 参数 `observe=1` |
| 联邦 | Federation | 多实验室统一接入与治理 |

### 2.2 枚举：LabStatus（实验室状态）

| 枚举值 | 中文展示 | 说明 | 是否可进入工作台 |
|--------|----------|------|------------------|
| `idle` | 空闲 | 在线且无活跃会话，可新建占用 | 是（操作态） |
| `busy` | 实验中 | 至少一个活跃会话 | 是（仅观察态 `observe=1`） |
| `maintenance` | 维护中 | 管理员置为维护，不接受新会话 | 否 |
| `offline` | 离线 | 边缘心跳超时或网关不可达 | 否 |
| `awaiting` | 待接入 | 已登记但未完成边缘注册/联调 | 否 |

### 2.3 枚举：Discipline（学科）

| 枚举值 | 中文 | 默认机位数量（参考） |
|--------|------|----------------------|
| `electronics` | 电子学 | 5（1 全景 + 4 仪器） |
| `chemistry` | 化学 | 5 |
| `physics` | 物理 | 4 |
| `biology` | 生物 | 4 |
| `engineering` | 工科 | 6 |

### 2.4 枚举：StepStatus（步骤状态）

| 枚举值 | 中文 | 说明 |
|--------|------|------|
| `pending` | 未开始 | 前置步骤未完成 |
| `active` | 进行中 | 当前可执行步骤 |
| `done` | 已完成 | 指令已成功或人工确认 |
| `error` | 失败 | 指令失败或校验不通过 |

### 2.5 枚举：CommandStatus（指令状态）

| 枚举值 | 说明 |
|--------|------|
| `draft` | 草稿，未下发 |
| `dispatched` | 已下发，等待边缘接收 |
| `received` | 边缘已 ACK |
| `running` | 执行中 |
| `succeeded` | 成功完成 |
| `failed` | 执行失败 |
| `timeout` | 超时 |
| `cancelled` | 用户或系统取消 |
| `archived` | 结果已归档 |

### 2.6 枚举：StreamProtocol（流协议）

| 枚举值 | 说明 | 播放器 |
|--------|------|--------|
| `hls` | HTTP Live Streaming | hls.js |
| `mp4` | 渐进式 MP4 | 原生 video |
| `webrtc` | 低延迟实时 | WebRTC（Phase 2） |
| `auto` | 由平台根据环境选择 | 前端自动 |

### 2.7 枚举：StreamConnectionStatus（前端连接状态）

| 枚举值 | 说明 |
|--------|------|
| `idle` | 未连接 |
| `connecting` | 正在连接 |
| `playing` | 播放中 |
| `error` | 连接或解码失败 |

### 2.8 枚举：WorkbenchExperimentStatus（工作台实验队列项状态）

| 枚举值 | 说明 |
|--------|------|
| `running` | 进行中 |
| `queued` | 排队等待 |
| `completed` | 已完成，可回放 |

### 2.9 枚举：ExperimentResultStatus（结果项状态）

| 枚举值 | 说明 |
|--------|------|
| `ready` | 已就绪可展示 |
| `pending` | 等待采集或计算 |
| `failed` | 采集或判分失败 |

### 2.10 枚举：InstitutionLogoVariant（机构 Logo 展示样式）

| 枚举值 | 说明 |
|--------|------|
| `default` | 默认圆形裁剪 |
| `red` | 红色主题圆形 |
| `wide` | 宽版横向 Logo（如企业品牌条） |

---

## 3. 数据模型与属性字典

> **约定**：下表列「必填」= 创建/展示时是否必须有值；「可空」= 允许 null/省略。  
> **API 字段**= REST/JSON 对外名称；**前端字段**= 当前 TypeScript 类型字段（若一致则合并为一列）。

---

### 3.1 实体：Tenant（租户）

| 属性名 | API 字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|----------|------|------|------|------------|
| 租户 ID | `tenantId` | string | 是 | 全局唯一标识 | 格式 `tnt_{slug}`，如 `tnt_fudan` |
| 租户名称 | `name` | string | 是 | 显示名称 | 1～128 字符 |
| 状态 | `status` | enum | 是 | `active` / `suspended` | 停用后下属实验室不可操作 |
| 创建时间 | `createdAt` | datetime (ISO8601) | 是 | UTC 时间戳 | — |
| 配额：最大实验室数 | `quota.maxLabs` | integer | 否 | 0 表示不限制 | ≥ 0 |
| 配额：月录像存储 GB | `quota.storageGbMonth` | integer | 否 | 媒资用量上限 | ≥ 0 |

---

### 3.2 实体：Lab（实验室）

用于大厅卡片、工作台上下文、权限校验与流/指令路由。

| 属性名 | API/前端字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|--------------|------|------|------|------------|
| 实验室 ID | `id` / `labId` | string | 是 | 全局唯一 | `lab_{org}_{slug}`，如 `lab_fudan_ata` |
| 所属租户 | `tenantId` | string | 是 | 外键 → Tenant | — |
| 实验室名称 | `name` | string | 是 | 完整展示名 | 如「复旦大学 · 智能合成工作站」 |
| 校区/城市 | `campus` | string | 是 | 地理位置短名 | 如「上海」「杭州」 |
| 学科 | `discipline` | Discipline | 是 | 决定默认机位目录 | 见 §2.3 |
| 运行状态 | `status` | LabStatus | 是 | 实时状态 | 见 §2.2，由边缘心跳 + 会话推导 |
| 机位数量 | `cameras` | integer | 是 | 已配置视频机位数 | ≥ 1，与 streams 列表一致 |
| 排队实验数 | `queueLength` | integer | 是 | 等待执行的实验任务数 | ≥ 0，大厅「排队中」展示 |
| 累计完成实验数 | `completedExperimentCount` | integer | 是 | 历史完成计数 | ≥ 0，大厅「已完成」展示 |
| 最大并发会话 | `maxConcurrent` | integer | 是 | 同时占用上限 | ≥ 1，超额任务进入排队 |
| 当前占用人数 | `currentUsers` | integer | 是 | 活跃会话数 | 0～maxConcurrent |
| 能力标签 | `tags` | string[] | 是 | 搜索与筛选 | 每项 1～32 字符，最多 20 项 |
| 最后心跳描述 | `lastHeartbeat` | string | 是 | 人类可读时间 | 如「6 秒前」；离线时为「—」或「待接入」 |
| 最后心跳时间 | `lastHeartbeatAt` | datetime | 否 | 机器可读，用于排序 | ISO8601 |
| 实验场景 ID | `experimentScenarioId` | string | 是 | 外键 → ExperimentScenario | 如 `scenario_ata_optimization` |
| 实验场景标题 | `workflowTitle` | string | 是 | 卡片主标题 | 与关联 `ExperimentScenario.title` 一致，如「ATA 反应条件优化」 |
| 卡片简介 | `cardDescription` | string | 是 | 卡片正文描述 | 建议 ≤ 500 字 |
| 机构名称 | `institutionName` | string | 是 | 主办/承建方 | 如「复旦大学」 |
| 机构副标题 | `institutionSubtitle` | string | 是 | 机构下一行说明 | — |
| 机构 Logo | `institutionLogo` | string | 是 | 图片 URL 或单字后备 | `/images/institutions/*.png` 或「浦」 |
| Logo 样式变体 | `institutionLogoVariant` | InstitutionLogoVariant | 否 | 控制裁剪样式 | 默认 `default` |
| 预览流开关 | `previewStreamEnabled` | boolean | 否 | 大厅卡片是否拉预览流 | 默认 false |
| 预览流地址 | `previewStreamUrl` | string \| null | 否 | HLS/MP4 URL | 开关为 true 时建议必填 |
| 开放时段 | `openHours` | object | 否 | 可预约/可用时段 | Phase 2；cron 或每日时间段 |
| 经度 | `geo.lng` | number | 否 | 地图展示 | -180～180 |
| 纬度 | `geo.lat` | number | 否 | 地图展示 | -90～90 |
| 边缘 Agent 版本 | `edgeAgentVersion` | string | 否 | 运维可见 |  semver |
| 注册时间 | `registeredAt` | datetime | 是 | 首次接入时间 | — |

---

### 3.2.1 实体：ExperimentScenario（实验场景）

平台侧可检索、可复用的标准实验流程定义；实验室卡片主标题展示当前/典型实验场景名称。

| 属性名 | API/前端字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|--------------|------|------|------|------------|
| 场景 ID | `id` / `scenarioId` | string | 是 | 全局唯一 | 如 `scenario_ata_optimization` |
| 场景名称 | `title` | string | 是 | 人类可读名称 | 如「ATA 反应条件优化」 |
| 场景简介 | `description` | string | 否 | 场景说明 | Phase 2 |
| 关联学科 | `discipline` | Discipline | 否 | 默认筛选 | 见 §2.3 |
| 上架状态 | `status` | enum | 否 | `published` / `draft` | Phase 2；MVP 默认已上架 |

**大厅统计派生（HallStats，非持久化实体）**

| 属性名 | 类型 | 说明 | 计算规则 |
|--------|------|------|----------|
| `total` | integer | 实验室总数 | 已注册物理实验室数，**统计口径为 `labs.length`，当前 Mock 为 10** |
| `scenarios` | integer | 实验场景总数 | 各实验室 `experimentScenarioId` 去重计数 |
| `busy` | integer | 实验中数量 | `status === 'busy'` 计数 |
| `idle` | integer | 空闲数量 | `status === 'idle'` |
| `maintenance` | integer | 维护中 | `status === 'maintenance'` |
| `offline` | integer | 离线 | `status === 'offline'` |
| `awaiting` | integer | 待接入 | `status === 'awaiting'` |
| `queued` | integer | 排队任务总和 | Σ `queueLength` |
| `completed` | integer | 完成实验总和 | Σ `completedExperimentCount` |

---

### 3.3 实体：Session（实验会话）

| 属性名 | API 字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|----------|------|------|------|------------|
| 会话 ID | `sessionId` | string | 是 | 全局唯一 | `sess_{uuid}` |
| 实验室 ID | `labId` | string | 是 | 外键 → Lab | — |
| 实验名称 | `experimentName` | string | 是 | 工作台标题 | 如「ATA 反应条件优化」 |
| 剧本 ID | `scriptId` | string | 否 | 关联 ExperimentScript | Phase 2 |
| 发起人用户 ID | `userId` | string | 是 | 创建会话的用户 | — |
| 会话状态 | `status` | enum | 是 | `active` / `queued` / `completed` / `aborted` | — |
| 是否只读观察 | `observeOnly` | boolean | 是 | 不占用写锁 | 观察模式为 true |
| 提交时间 | `submittedAt` | datetime | 否 | 任务入队或开始时间 | — |
| 完成时间 | `completedAt` | datetime | 否 | 实验结束时间 | 进行中为空 |
| 实验介绍 | `intro` | ExperimentIntro | 是 | 见 §3.4 | — |
| 步骤列表 | `steps` | ExperimentStep[] | 是 | 见 §3.5 | 至少 1 项 |
| 观察日志包 | `observeLog` | ObserveLogBundle | 否 | 设备流全量日志 | 观察模式专用 |

---

### 3.4 对象：ExperimentIntro（实验信息）

工作台左侧「实验信息」面板数据源。

| 属性名 | 前端字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|----------|------|------|------|------------|
| 原始目标 | `originalGoal` | string | 否 | 用户/智能体提出的实验目标 | 长文本 |
| 已确认条件 | `confirmedConditions` | string[] | 否 | 经确认的参数列表 | 每项一行展示 |
| 指令草稿 | `instructionDraft` | InstructionDraftLine[] | 否 | 待下发操作序列预览 | 见 §3.4.1 |
| 单方案 | `plan` | ExperimentPlanBlock | 否 | 当前选用方案 | 与 `plans` 二选一或并存 |
| 多方案 | `plans` | ExperimentPlanBlock[] | 否 | 候选方案列表 | — |
| 试剂表 | `reagents` | ExperimentReagent[] | 否 | 化学/生物场景 | 见 §3.4.2 |
| 安全检查项 | `safetyChecks` | string[] | 否 | 执行前勾选（后续） | — |
| 实验结果 | `results` | ExperimentResultItem[] | 否 | 结果摘要表 | 见 §3.4.3 |
| 结果备注 | `resultsNote` | string | 否 | 结果区脚注 | — |
| 摘要 | `summary` | string | 否 | 通用实验简介 | 教学类实验常用 |
| 教学目标 | `objectives` | string[] | 否 | 列表展示 | — |
| 设备清单 | `equipment` | string[] | 否 | 所需设备 | — |
| 安全须知 | `safetyNotes` | string[] | 否 | 红色警示类文案 | — |
| 预计时长 | `estimatedDuration` | string | 否 | 人类可读 | 如「约 45 分钟」 |

#### 3.4.1 对象：InstructionDraftLine（指令草稿行）

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 操作码 | `op` | string | 是 | 机器可读操作类型，如 `glovebox: prepare_environment` |
| 详情 | `detail` | string | 是 | 人类可读描述或参数摘要 |

#### 3.4.2 对象：ExperimentReagent（试剂）

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 名称 | `name` | string | 是 | 化学品名称 |
| 角色 | `role` | string | 是 | 如 substrate、catalyst |
| 用量 | `amount` | string | 是 | 如 `11.0 μL` |
| 计算过程 | `calculation` | string | 是 | 物质的量推导 |
| 当量 | `equiv` | string | 是 | 如 `1.0 / 0.100 mmol / liquid` |

#### 3.4.3 对象：ExperimentPlanBlock（实验方案块）

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 标题 | `title` | string | 是 | 方案名 |
| 条件 | `conditions` | string | 是 | 温度、时间、溶剂等 |
| 依据 | `rationale` | string | 是 | 选型理由 |
| 合规注意 | `compliance` | string | 是 | 安全与规范提示 |

#### 3.4.4 对象：ExperimentResultItem（结果项）

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 指标名 | `label` | string | 是 | 如「转化率」 |
| 值 | `value` | string | 是 | 展示值，含单位 |
| 状态 | `status` | ExperimentResultStatus | 否 | 默认 `ready` |

---

### 3.5 对象：ExperimentStep（实验步骤）

| 属性名 | 字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|------|------|------|------|------------|
| 步骤 ID | `id` | string | 是 | 会话内唯一 | 如 `step_connect` |
| 标题 | `title` | string | 是 | 短标题 | ≤ 64 字 |
| 描述 | `description` | string | 是 | 操作说明 | — |
| 状态 | `status` | StepStatus | 是 | 见 §2.4 | — |
| 指令类型 | `commandType` | string | 是 | 下发时映射到 Command.type | 如 `device.power_on` |
| 步骤参数 | `params` | object | 否 | 下发 payload | JSON，依 commandType  schema |
| 步骤内设备事件 | `events` | DeviceLogEvent[] | 否 | 观察模式按步骤聚合日志 | — |

---

### 3.6 对象：DeviceLogEvent（设备日志事件）

| 属性名 | 字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|------|------|------|------|------------|
| 时间戳 | `timestamp` | string | 是 | 展示用时间 | `HH:mm:ss` 或 ISO8601 |
| 消息 | `message` | string | 是 | 日志正文 | — |
| 设备 | `device` | string | 是 | 设备标识 | 如 `Robot-1` |
| 阶段 ID | `phaseId` | string | 否 | 关联步骤 | — |
| 阶段标题 | `phaseTitle` | string | 否 | 阶段展示名 | — |

---

### 3.7 对象：ObserveLogBundle（观察日志包）

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 元信息 | `meta` | JiaxingObserveMeta | 是 | 见 §3.7.1 |
| 全量日志 | `fullLog` | DeviceLogEvent[] | 是 | 按时间排序 |

#### 3.7.1 对象：JiaxingObserveMeta（观察元信息）

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 开始时间 | `startedAt` | string | 是 | 实验开始 |
| 结束时间 | `finishedAt` | string | 是 | 实验结束 |
| 队列快照 | `queue` | string[] | 是 | 排队实验名称列表 |
| 事件总数 | `totalEvents` | integer | 是 | 日志条数 |
| 日志来源 | `logSource` | string | 是 | 文件或 Agent 标识 |
| 实验标签 | `experimentLabel` | string | 否 | 展示用 |
| 结果摘要 | `results` | string[] | 否 | 文本结果列表 |

---

### 3.8 对象：WorkbenchExperimentListItem（工作台实验列表项）

顶栏「实验列表」下拉中的每一项。

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 项 ID | `id` | string | 是 | 列表内唯一 |
| 实验名称 | `experimentName` | string | 是 | 主文案 |
| 状态 | `status` | WorkbenchExperimentStatus | 是 | running / queued / completed |
| 副标题 | `subtitle` | string | 否 | 如条件摘要 |
| 提交时间 | `submittedAt` | datetime | 否 | — |
| 完成时间 | `completedAt` | datetime | 否 | completed 时填写 |

---

### 3.9 对象：JiaxingObserveQueueBundle（观察模式队列包）

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 进行中 | `running` | WorkbenchExperimentListItem | 是 | 当前占用实验 |
| 排队中 | `queued` | WorkbenchExperimentListItem[] | 是 | 可为空数组 |
| 已完成 | `completed` | WorkbenchExperimentListItem[] | 是 | 可为空数组 |

---

### 3.10 实体：Command（指令）

| 属性名 | API 字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|----------|------|------|------|------------|
| 指令 ID | `commandId` | string | 是 | 全局唯一，幂等键 | `cmd_{date}_{seq}` |
| 会话 ID | `sessionId` | string | 是 | 外键 | — |
| 实验室 ID | `labId` | string | 是 | 路由到边缘 | — |
| 步骤 ID | `stepId` | string | 否 | 关联 ExperimentStep | — |
| 指令类型 | `type` | string | 是 | 契约类型名 | 如 `experiment.run_step` |
| 载荷 | `payload` | object | 是 | 类型相关参数 | — |
| 优先级 | `priority` | enum | 否 | `low` / `normal` / `high` | 默认 normal |
| 超时秒数 | `timeoutSec` | integer | 是 | 超时转 `timeout` | 1～3600，默认 300 |
| 是否需要录像 | `requireVideo` | boolean | 否 | 触发时段录像 | 默认 true |
| 状态 | `status` | CommandStatus | 是 | 见 §2.5 | — |
| 下发人 | `issuedBy` | string | 是 | userId | — |
| 下发时间 | `issuedAt` | datetime | 是 | — | — |
| 完成时间 | `finishedAt` | datetime | 否 | — | — |
| 错误码 | `error.code` | string | 否 | 失败时 | — |
| 错误信息 | `error.message` | string | 否 | 失败时 | — |
| 回调 URL | `callbackUrl` | string | 否 | 异步通知 | HTTPS |

**MVP 原子指令类型（type 枚举建议）**

| type | 说明 | payload 主要属性 |
|------|------|------------------|
| `device.power_on` | 设备上电 | `deviceId`, `voltageLimit`, `currentLimit` |
| `device.power_off` | 设备下电 | `deviceId` |
| `device.read_measurement` | 读取测量值 | `deviceId`, `channel` |
| `camera.switch` | 切换机位 | `streamId` |
| `media.capture_snapshot` | 截图 | `streamId` |
| `experiment.run_step` | 执行剧本步骤 | `stepId`, `params` |
| `system.estop` | 急停 | `reason` |

---

### 3.11 实体：Result（结构化结果）

| 属性名 | API 字段 | 类型 | 必填 | 说明 |
|--------|----------|------|------|------|
| 结果 ID | `resultId` | string | 是 | 全局唯一 |
| 指令 ID | `commandId` | string | 是 | 强绑定 |
| 会话 ID | `sessionId` | string | 是 | — |
| 类型 | `kind` | enum | 是 | `scalar` / `table` / `json` / `file` / `image` |
| 标签 | `label` | string | 是 | 展示名 |
| 值 | `value` | string \| number \| object | 否 | 标量或 JSON |
| 文件 URL | `fileUrl` | string | 否 | 大对象存储地址 |
| 时间轴偏移秒 | `offsetSec` | number | 否 | 关联录像打点 |
| 创建时间 | `createdAt` | datetime | 是 | — |

---

### 3.12 对象：LabStream（视频机位）

| 属性名 | API/前端字段 | 类型 | 必填 | 说明 | 约束与示例 |
|--------|--------------|------|------|------|------------|
| 机位 ID | `id` | string | 是 | 实验室内唯一 | 如 `panorama`、`oscilloscope` |
| 展示标签 | `label` | string | 是 | UI 显示 | 如「全景 · 实验台」 |
| 协议 | `protocol` | StreamProtocol | 是 | 播放协议 | hls / mp4 / webrtc |
| 播放地址 | `playUrl` | string | 是 | 限时 URL | HTTPS，有效期由 `expiresAt` 约束 |
| 是否主画面默认 | `isDefaultPrimary` | boolean | 否 | 全景一般为 true | — |

**响应包装：LabStreamsResponse**

| 属性名 | 字段 | 类型 | 必填 | 说明 |
|--------|------|------|------|------|
| 实验室 ID | `labId` | string | 是 | — |
| 机位列表 | `streams` | LabStream[] | 是 | 1～N |
| 过期时间 | `expiresAt` | datetime | 是 | 播放地址失效时间，需刷新 |

**按学科默认机位 ID（平台配置，边缘可覆盖）**

| discipline | 机位 id 列表（label 前缀「全景·」「仪器·」） |
|------------|-----------------------------------------------|
| electronics | panorama, oscilloscope, multimeter, power_supply, signal_gen |
| chemistry | panorama, fume_hood, titration, balance, reactor |
| physics | panorama, optical_path, laser, interferometer |
| biology | panorama, microscope, incubator, stage |
| engineering | panorama, robot_arm, plc_screen, vision, conveyor, test_station |

---

### 3.13 实体：VideoAsset（录像资产）

| 属性名 | API 字段 | 类型 | 必填 | 说明 |
|--------|----------|------|------|------|
| 资产 ID | `assetId` | string | 是 | — |
| 会话 ID | `sessionId` | string | 是 | — |
| 指令 ID | `commandId` | string | 否 | 时段录像关联 |
| 机位 ID | `streamId` | string | 是 | — |
| 回放 URL | `playbackUrl` | string | 是 | 签名 URL |
| 时长秒 | `durationSec` | number | 是 | — |
| 水印文本 | `watermark` | string | 否 | 实验室+用户+时间 |
| 创建时间 | `createdAt` | datetime | 是 | — |

---

### 3.14 实体：User（用户）

| 属性名 | API 字段 | 类型 | 必填 | 说明 |
|--------|----------|------|------|------|
| 用户 ID | `userId` | string | 是 | OIDC sub 或内部 ID |
| 显示名 | `displayName` | string | 是 | 如「张老师」 |
| 头像 URL | `avatarUrl` | string | 否 | — |
| 角色列表 | `roles` | string[] | 是 | student, teacher 等 |
| 所属租户 | `tenantId` | string | 是 | — |

---

### 3.15 实体：AuditLog（审计日志）

| 属性名 | API 字段 | 类型 | 必填 | 说明 |
|--------|----------|------|------|------|
| 日志 ID | `logId` | string | 是 | — |
| 租户 ID | `tenantId` | string | 是 | — |
| 用户 ID | `userId` | string | 是 | — |
| 动作 | `action` | string | 是 | 如 `command.dispatch` |
| 资源类型 | `resourceType` | string | 是 | lab / command / session |
| 资源 ID | `resourceId` | string | 是 | — |
| 详情 | `detail` | object | 否 | JSON 快照 |
| 时间 | `occurredAt` | datetime | 是 | — |
| 客户端 IP | `clientIp` | string | 否 | — |

---

## 4. 页面与交互规格

### 4.1 路由

| 路径 | 页面名称 | 查询参数 | 说明 |
|------|----------|----------|------|
| `/` | 首页 | — | Hero + 实验室大厅 |
| `/workbench/:labId` | 实验工作台 | — | 操作态；`labId` 对应 Lab.id |
| `/workbench/:labId` | 观察工作台 | `observe=1` | 只读；占用实验室默认入口 |

### 4.2 页面：实验大厅（路由 `/`，严格按当前 Web 实现）

> **范围**：首页 `HomePage` + 全局顶栏 `Header`（非工作台时）+ 实验室卡片 `LabCard` + 卡片预览 `LabCardPreview`。  
> **数据源**：`labs`（`mock.ts`）、`computeHallStats(labs)`、`LAB_MEANING_INTRO`（`meaning.ts`）、`CURRENT_USER`。  
> **说明**：下列「是否在页面展示」均以当前代码为准；`Lab` 中未列出的字段在本页**不展示**。

#### 4.2.1 页面结构一览

| 序号 | 页面区域 | 组件 | DOM/区块类名 |
|------|----------|------|----------------|
| 1 | 全局顶栏 | `Header` | `.app-header` |
| 2 | 产品头图 | `HomePage` | `.home-header` / `.surface--hero` |
| 3 | 实验室大厅标题区 | `HomePage` | `.section-head` |
| 4 | 大厅统计 | `HomePage` + `HallStatIcon` | `.section-head-stats` / `.section-stat` |
| 5 | 实验室卡片列表 | `LabCard` × N | `.lab-grid` / `.lab-card` |

---

#### 4.2.2 全局顶栏（首页时）

| 展示项名称 | 页面文案/内容 | 数据字段 | 字段类型 | 是否在页面展示 | 属性说明 |
|------------|---------------|----------|----------|----------------|----------|
| 品牌图标 | 「智」 | — | 静态 | 是 | 无数据绑定，装饰用 |
| 产品名称链接 | 智慧实验室 | — | 静态 | 是 | 点击跳转 `/` |
| 当前实验室上下文 | — | — | — | **否** | 仅 `/workbench/:labId` 路由展示 |
| 用户头像字 | 张 | `CURRENT_USER[0]` | string | 是 | 取显示名首字 |
| 用户显示名 | 张老师 | `CURRENT_USER` | string | 是 | `mock.ts` 常量，title 同值 |

---

#### 4.2.3 产品头图区（HOME-HERO）

| 展示项名称 | 页面文案/内容 | 数据字段 | 字段类型 | 是否在页面展示 | 属性说明 |
|------------|---------------|----------|----------|----------------|----------|
| 主标题 | 智慧实验室 | — | 静态 | 是 | `<h1 class="page-heading">`，非 `Lab.name` |
| 简介段落 | 面向科研任务的新型实验基础设施… | `LAB_MEANING_INTRO` | string | 是 | 固定单段文案，见 `meaning.ts` |

---

#### 4.2.4 实验室大厅标题区

| 展示项名称 | 页面文案/内容 | 数据字段 | 字段类型 | 是否在页面展示 | 属性说明 |
|------------|---------------|----------|----------|----------------|----------|
| 区块标题 | 实验室大厅 | — | 静态 | 是 | `<h2 id="labs-heading">` |
| 区块副标题 | 查看实验室状态与实验过程 | — | 静态 | 是 | `.section-sub` |

---

#### 4.2.5 大厅统计（HallStats）

由 `computeHallStats(labs)` 计算，**不单独占接口**。

| 展示项名称 | 页面标签文案 | 数据字段 | 字段类型 | 是否在页面展示 | 属性说明 |
|------------|--------------|----------|----------|----------------|----------|
| 实验室总数 | 实验室 | `total` | integer | **始终展示** | 已注册物理实验室数，统计口径 `labs.length`，当前为 **10** |
| 实验场景总数 | 实验场景 | `scenarios` | integer | **始终展示** | 各卡 `experimentScenarioId` 去重计数 |
| 空闲数 | 空闲 | `idle` | integer | 条件展示 | `status === 'idle'` 个数；**值为 0 时不展示** |
| 维护中数 | 维护中 | `maintenance` | integer | 条件展示 | `status === 'maintenance'` 个数；**值为 0 时不展示** |
| 离线数 | 离线 | `offline` | integer | 条件展示 | `status === 'offline'` 个数；**值为 0 时不展示** |
| 排队任务合计 | 排队中 | `queued` | integer | **始终展示** | 各卡 `queueLength` 之和：Σ max(0, queueLength) |
| 已完成实验合计 | 已完成 | `completed` | integer | **始终展示** | 各卡 `completedExperimentCount` 之和 |
| 实验中数量 | — | `busy` | integer | **否** | 统计对象含 `busy` 字段，但页面**未配置展示项** |
| 待接入数 | — | `awaiting` | integer | **否** | 统计对象含 `awaiting` 字段，但页面**未配置展示项** |

**展示规则（代码逻辑）**

指标按 **实验场景 → 实验室 → 实验任务** 三组排列，组与组之间以竖向分隔线（`.section-head-stats-divider`）区分。

| 分组 | 包含指标 |
|------|----------|
| 实验场景 | `scenarios` |
| 实验室 | `total`；`idle` / `maintenance` / `offline`（值为 0 时不展示） |
| 实验任务 | `queued` / `completed` |

| 字段 | 展示条件 |
|------|----------|
| `total` / `scenarios` / `queued` / `completed` | 无条件，始终渲染 |
| `idle` / `maintenance` / `offline` | 仅当 `value > 0` 时渲染 |

---

#### 4.2.6 实验室卡片（LabCard）— 数据字段与页面对照

**`Lab` 类型中在本页使用的字段**

| 属性名（前端字段） | 类型 | 是否在页面展示 | 页面展示位置 | 属性说明 |
|--------------------|------|----------------|--------------|----------|
| `id` | string | 否（不渲染文案） | — | 仅用于跳转链接 `/workbench/{id}` |
| `institutionLogo` | string | 是 | 卡片机构区 | 以 `/` 开头为图片 `<img>`，否则为后备文字（如「浦」） |
| `institutionLogoVariant` | `"default"` \| `"red"` \| `"wide"` | 是（样式） | 卡片机构区 | 可选；默认 `default`，控制 Logo CSS 变体 |
| `institutionName` | string | 是 | 卡片机构区 | 机构名称，`.lab-card-org-name` |
| `institutionSubtitle` | string | 是 | 卡片机构区 | 机构副标题，`.lab-card-org-sub` |
| `status` | LabStatus | 是 | 角标/徽章/预览区/按钮 | 驱动整卡样式 `lab-card--{status}` 及交互，见下表 |
| `cameras` | integer | 条件展示 | 预览区右下角 | 仅当 `cameras > 0` 且展示预览面板时，文案「{n} 机位」 |
| `previewStreamEnabled` | boolean | 是（逻辑） | 预览区 | 与本地开关共同决定初始是否拉流；`!== false` 时 idle/busy 默认开启 |
| `previewStreamUrl` | string \| null | 是（逻辑） | 预览区 | 经 `getLabPreviewStreamUrl()` 得到播放地址；`null` 则不播 |
| `workflowTitle` | string | 是 | 实验区标题 | `.lab-card-title`，当前实验/流程名称 |
| `queueLength` | integer | 是 | 实验区元信息 | 标签「排队中」+ 数值，始终展示（含 0） |
| `completedExperimentCount` | integer | 是 | 实验区元信息 | 标签「已完成」+ 数值，始终展示 |
| `cardDescription` | string | 是 | 实验区正文 | `.lab-card-desc` 多行简介 |

**`Lab` 类型中在本页未展示的字段（数据存在但不渲染）**

| 属性名 | 说明 |
|--------|------|
| `name` | 完整实验室名，工作台/顶栏使用，大厅卡片不显示 |
| `campus` | 校区，本页不显示 |
| `discipline` | 学科，本页不显示 |
| `tags` | 标签，本页不显示 |
| `lastHeartbeat` | 心跳文案，本页不显示 |
| `maxConcurrent` | 最大并发，本页不显示 |
| `currentUsers` | 当前占用人数，本页不显示 |
| `experimentScenarioId` | 实验场景外键，本页不直接展示（标题经 `workflowTitle` 展示） |

---

#### 4.2.7 实验室卡片 — 展示项属性表（按 UI 元素）

| 展示项名称 | 页面文案示例 | 绑定字段/条件 | 属性说明 |
|------------|--------------|---------------|----------|
| 待接入角标 | 待接入 | `status === 'awaiting'` | 卡片左上角；仅待接入状态显示 |
| 机构 Logo | 图片或单字 | `institutionLogo` + `institutionLogoVariant` | `aria-hidden`，无 alt 文案 |
| 机构名称 | 复旦大学 | `institutionName` | — |
| 机构副标题 | 面向反应条件优化的… | `institutionSubtitle` | — |
| 视频预览画面 | HLS 画面 / 占位图标 | `previewStreamUrl`、`receiving` 状态 | 见 §4.2.8 |
| 预览关闭角标 | 未开启 | `receiving === false` 且展示预览面板 | 右上角徽章 |
| 预览接收角标 | 接收中 | `idle`/`busy` 且 `receiving === true` | 含绿点 + 小号开关 |
| 预览提示文案 | 打开开关即可查看 / 待接入，暂不可开启 | 由 `status` 决定 | 关闭预览时居中显示 |
| 离线/维护遮罩标题 | 离线 · 无视频 / 维护中 | `status === 'offline'` / `'maintenance'` | 覆盖在预览区上 |
| 机位数 | 4 机位 | `cameras` | `cameras > 0` 且处于预览面板模式时 |
| 实验标题 | ATA 反应条件优化 | `workflowTitle` | 实验场景名称，关联 `experimentScenarioId` |
| 状态圆点+文案 | 实验中 | `status` → `CARD_STATUS_LABELS[status]` | **`awaiting` 时不展示**状态徽章 |
| 排队中标签 | 排队中 | 静态文案 | — |
| 排队中数值 | 1 | `queueLength` | `queueLength > 0` 时高亮样式 `lab-card-queue--has` |
| 已完成标签 | 已完成 | 静态文案 | — |
| 已完成数值 | 12 | `completedExperimentCount` | — |
| 卡片简介 | 围绕 ATA 不对称反应… | `cardDescription` | — |
| 主操作按钮 | 查看实验 | 见 §4.2.9 | 维护/离线/待接入为 `disabled` |

**`status` → 卡片状态文案（`CARD_STATUS_LABELS`）**

| 字段值 `status` | 页面展示文案 | 状态徽章是否显示 |
|-----------------|--------------|------------------|
| `idle` | 空闲 | 显示 |
| `busy` | 实验中 | 显示 |
| `maintenance` | 维护中 | 显示 |
| `offline` | 离线 | 显示 |
| `awaiting` | 待接入 | **不显示徽章**（仅左上角角标） |

---

#### 4.2.8 卡片视频预览区（LabCardPreview）— 展示逻辑属性

| 属性/条件 | 类型 | 说明 |
|-----------|------|------|
| 可切换预览开关 | `status === 'idle' \|\| status === 'busy'` | 显示预览面板且可操作 `PreviewStreamSwitch` |
| 展示预览面板 | 上式成立 **或** `status === 'awaiting'` | 待接入有占位面板但开关锁定 |
| 初始拉流 `receiving` | `previewStreamEnabled !== false`（idle/busy） | 否则默认关闭 |
| 实际播放 URL | `getLabPreviewStreamUrl(previewStreamUrl)` | 有值且 `receiving` 时 `LivePlayer` 播放；`previewStreamUrl === null` 则不播 |
| 默认演示流 | `DEFAULT_HLS_STREAM` | `previewStreamUrl` 省略时使用 |
| 离屏暂停 | `IntersectionObserver` | 卡片不在视口时 `active=false` 暂停播放 |
| 播放器静音 | 固定 | `muted`，无控制条 `showControls={false}` |

| 页面展示项 | 出现条件 | 页面文案 |
|------------|----------|----------|
| 占位图标 ▣ | 未拉流 | — |
| 占位图标 ◎ | 预览面板关闭态非 streamOff | — |
| 角标「未开启」 | `receiving === false` 且显示预览面板 | 未开启 |
| 遮罩提示 | 同上 | 打开开关即可查看 / 待接入，暂不可开启 |
| 角标「接收中」 | idle/busy 且 `receiving === true` | 接收中 |
| 遮罩「离线 · 无视频」 | `status === 'offline'` | 离线 · 无视频 |
| 遮罩「维护中」 | `status === 'maintenance'` | 维护中 |
| 机位文案 | `previewPanel && cameras > 0` | `{cameras} 机位` |

**按 `status` 预览区行为汇总**

| `status` | 预览面板 | 开关 | 遮罩文案 | 可否播放 |
|----------|----------|------|----------|----------|
| `idle` | 显示 | 可用 | — | 开关开则播 |
| `busy` | 显示 | 可用 | — | 开关开则播 |
| `awaiting` | 显示 | **禁用** | 待接入，暂不可开启 | 否 |
| `offline` | 不显示切换逻辑 | — | 离线 · 无视频 | 否 |
| `maintenance` | 不显示切换逻辑 | — | 维护中 | 否 |

---

#### 4.2.9 主按钮「查看实验」— 交互属性

| `status` | 按钮状态 | 跳转路径 |
|----------|----------|----------|
| `idle` | 可点击（`Link`） | `/workbench/{id}` |
| `busy` | 可点击（`Link`） | `/workbench/{id}?observe=1` |
| `maintenance` | 禁用（`button disabled`） | — |
| `offline` | 禁用 | — |
| `awaiting` | 禁用 | — |

---

#### 4.2.10 实验大厅单卡数据示例（字段与页面一一对应）

```json
{
  "id": "lab_fudan_ata",
  "institutionLogo": "/images/institutions/fudan.png",
  "institutionLogoVariant": "default",
  "institutionName": "复旦大学",
  "institutionSubtitle": "面向反应条件优化的智能合成工作站",
  "status": "busy",
  "cameras": 4,
  "previewStreamEnabled": false,
  "previewStreamUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "experimentScenarioId": "scenario_ata_optimization",
  "workflowTitle": "ATA 反应条件优化",
  "queueLength": 1,
  "completedExperimentCount": 12,
  "cardDescription": "围绕 ATA 不对称反应，智能体生成不同底物浓度…"
}
```

**页面上可见效果（上述示例）**：机构区显示复旦 Logo 与名称；预览区默认「未开启」（`previewStreamEnabled: false`）；标题「ATA 反应条件优化」；状态徽章「实验中」；排队中 1、已完成 12；简介全文；按钮「查看实验」跳转观察模式。

### 4.3 组件：实验室卡片（LabCard）— 索引

完整属性见 **§4.2.6～§4.2.9**。以下为快速索引：

| 展示项 | 绑定属性 |
|--------|----------|
| 待接入角标 | `status === 'awaiting'` |
| 机构区 | `institutionLogo`, `institutionName`, `institutionSubtitle`, `institutionLogoVariant` |
| 预览区 | `status`, `cameras`, `previewStreamEnabled`, `previewStreamUrl` |
| 实验标题 | `workflowTitle`（实验场景名称） |
| 状态徽章 | `status` → `CARD_STATUS_LABELS`（awaiting 不显示） |
| 排队数 | `queueLength` + 文案「排队中」 |
| 已完成数 | `completedExperimentCount` + 文案「已完成」 |
| 简介 | `cardDescription` |
| 主按钮 | 由 `status` 决定禁用与 `observe=1` |

### 4.4 页面：实验工作台（Workbench）

| 区块 ID | 区块名称 | 数据实体 | 主要属性 | 交互规则 |
|---------|----------|----------|----------|----------|
| WB-INTRO | 实验信息 | SessionInfo.intro, experimentName, steps | 见 §3.4、§3.5 | 排队项显示「待开始」 |
| WB-VIDEO | 视频流 | LabStreamsResponse | streams[], expiresAt | 排队/禁用不拉流；replay 显示回放 |
| WB-STEPS | 实验步骤 / 执行日志 | steps 或 observeLog | status, events | 观察+嘉兴 lab 显示 DeviceLogStream |
| WB-HEADER | 顶栏上下文 | Lab, 队列 | name, queueLength | 实验列表下拉切换 viewIndex |

**工作台布局属性**

| 属性 | 值 | 说明 |
|------|-----|------|
| 列数 | 3 | 实验信息 \| 视频 \| 步骤/日志 |
| 宽屏容器 | `wide` | PageContainer 加宽 |
| 观察模式 class | `workbench--observe` | 可选样式区分 |

**viewIndex 语义（WorkbenchQueueContext）**

| viewIndex | 含义 | 视频 | 步骤区 |
|-----------|------|------|--------|
| 0 | 进行中实验 | 拉流（非排队） | 正常步骤或观察日志 |
| 1～queue.length | 排队中第 n 项 | disabled，不拉流 | 显示「待开始」/ 空日志 |
| > queue.length | 已完成第 m 项 | replay 模式 | 已完成状态 |

### 4.5 组件：视频流枢纽（VideoStreamHub）

| 属性名 | 类型 | 说明 |
|--------|------|------|
| labId | string | 拉取机位列表 |
| cameraCount | number | 展示机位数提示 |
| layout | `default` \| `workbench` | workbench：主上副下 |
| disabled | boolean | true 时不请求 streams、不播放 |
| queued | boolean | 头部显示「待接收」 |
| replay | boolean | 回放标签与录像 URL |
| cardHeaderEl | HTMLElement | Portal 渲染控制按钮到卡片头 |

| 用户操作 | 系统行为 |
|----------|----------|
| 进入工作台 | 调用 `GET /labs/{labId}/streams`，按 discipline 合并机位 |
| 选择副机位 | 切换 primaryStreamId，主画面切换 |
| 手动输入 URL | 调试连接，覆盖 API 地址（P1） |
| 全屏 | 对当前主画面 DOM 调用 Fullscreen API |

### 4.6 组件：顶栏（Header）

| 展示项 | 绑定属性 | 说明 |
|--------|----------|------|
| 品牌 | 静态 | 点击回 `/` |
| 实验室上下文 | Lab.name, institutionLogo | 仅工作台路由 |
| 排队下拉 | queueLength 或 ObserveQueueBundle | 有排队/已完成时可展开 |
| 用户芯片 | User.displayName | 首字头像 |

---

## 5. 接口规格

### 5.1 通用约定

| 属性 | 说明 |
|------|------|
| 基础路径 | `/api/v1` |
| 认证 | `Authorization: Bearer {token}`（MVP 后强制） |
| 时间格式 | ISO 8601 UTC，如 `2026-05-24T08:00:00.000Z` |
| 分页 | `?page=1&pageSize=20`；响应含 `total`, `items` |
| 错误体 | `{ "code": "LAB_NOT_FOUND", "message": "...", "requestId": "..." }` |

### 5.2 GET /labs — 实验室列表

**请求查询参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 否 | 匹配 name、tags、workflowTitle |
| discipline | Discipline | 否 | 学科筛选 |
| status | LabStatus | 否 | 状态筛选 |
| page | integer | 否 | 默认 1 |
| pageSize | integer | 否 | 默认 20，最大 100 |

**响应 `items[]` 元素**：完整 Lab 对象（§3.2）。

### 5.3 GET /labs/{labId} — 实验室详情

**路径参数**：`labId` — 实验室 ID。

**响应**：Lab 对象；404 `LAB_NOT_FOUND`。

### 5.4 GET /labs/{labId}/streams — 机位与播放地址

**路径参数**：`labId`。

**响应体属性**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| labId | string | 与路径一致 |
| streams | LabStream[] | §3.12 |
| expiresAt | datetime | URL 失效时间，建议 1h |

**业务规则**：`busy` 且观察模式仍可获取只读流；排队会话不调用此接口（前端 disabled）。

### 5.5 GET /labs/{labId}/sessions/current — 当前会话

**响应体属性**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| session | Session | §3.3 |
| queue | WorkbenchExperimentListItem[] | 可选，排队列表 |
| observeQueue | JiaxingObserveQueueBundle | 可选，观察模式完整队列 |

### 5.6 POST /labs/{labId}/commands — 下发指令

**请求体属性**

| 属性名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| commandId | string | 否 | 客户端生成则幂等；否则服务端生成 |
| sessionId | string | 是 | — |
| type | string | 是 | §3.10 指令类型 |
| stepId | string | 否 | — |
| payload | object | 是 | — |
| timeoutSec | integer | 否 | 默认 300 |
| requireVideo | boolean | 否 | 默认 true |

**响应**：完整 Command 对象。

### 5.7 GET /commands/{commandId} — 查询指令

**响应**：Command + 嵌套 `results[]`（若有）。

### 5.8 POST /labs/{labId}/estop — 急停

**请求体**

| 属性名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sessionId | string | 是 | — |
| reason | string | 否 | 用户填写原因 |

**响应**：`{ "accepted": true, "estopId": "..." }`；边缘必须优先执行硬件急停。

### 5.9 WebSocket /labs/{labId}/telemetry — 遥测推送

**消息体示例属性**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| type | string | `telemetry.reading` |
| sessionId | string | — |
| readings | object[] | `{ "label": "电压", "value": "3.24", "unit": "V" }` |
| timestamp | datetime | — |

### 5.10 MQTT 消息体（边缘 ↔ 平台）

**下行 CommandMessage（topic: `lab/{labId}/commands`）**

| 属性名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| commandId | string | 是 | — |
| type | string | 是 | — |
| payload | object | 是 | — |
| timeoutSec | integer | 是 | — |
| signature | string | 是 | HMAC 防篡改 |

**上行 AckMessage（topic: `lab/{labId}/commands/{commandId}/ack`）**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| commandId | string | — |
| receivedAt | datetime | 边缘接收时间 |

**上行 ResultMessage（topic: `.../result`）**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| commandId | string | — |
| status | string | succeeded / failed |
| results | Result[] | 可多条 |
| finishedAt | datetime | — |

**上行 StatusMessage（topic: `lab/{labId}/status`）**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| status | LabStatus | 边缘上报 |
| currentUsers | integer | — |
| queueLength | integer | — |
| lastHeartbeatAt | datetime | — |

---

## 6. 功能需求清单

优先级：**P0** MVP 必须；**P1** 紧随其后；**P2** 后续版本。

### 6.1 实验室大厅

| 需求 ID | 描述 | 优先级 | 关联属性/实体 |
|---------|------|--------|---------------|
| FR-LAB-01 | 首页展示产品简介 | P0 | LAB_MEANING_INTRO |
| FR-LAB-02 | 卡片展示 Lab 全部展示向属性 | P0 | §3.2 |
| FR-LAB-03 | 五态状态与入口控制 | P0 | status, §4.3 |
| FR-LAB-04 | 大厅统计 HallStats（含实验室总数、实验场景总数） | P0 | §3.2.1 派生表 |
| FR-LAB-05 | 卡片预览流 | P1 | previewStreamEnabled, previewStreamUrl |
| FR-LAB-06 | 关键词搜索 | P1 | keyword → name, tags |
| FR-LAB-07 | 学科/状态筛选 | P1 | discipline, status |
| FR-LAB-08 | 地图视图 | P2 | geo.lng, geo.lat |

### 6.2 实验工作台

| 需求 ID | 描述 | 优先级 | 关联属性/实体 |
|---------|------|--------|---------------|
| FR-WB-01 | workbench 路由与 labId 校验 | P0 | Lab.id |
| FR-WB-02 | 三栏布局 | P0 | §4.4 |
| FR-WB-03 | 实验信息面板 | P0 | ExperimentIntro |
| FR-WB-04 | 步骤列表与进度 | P0 | ExperimentStep.status |
| FR-WB-05 | 排队视图禁用视频 | P0 | viewIndex, disabled |
| FR-WB-06 | 观察模式 | P0 | observe=1, observeOnly |
| FR-WB-07 | 设备日志流展示 | P1 | DeviceLogEvent, observeLog |
| FR-WB-08 | 下发/采集/急停/联系现场 | P0 | Command, estop API |
| FR-WB-09 | 结果时间轴 | P1 | Result.offsetSec, VideoAsset |
| FR-WB-10 | 遥测读数 | P1 | telemetry WebSocket |

### 6.3 视频与媒体

| 需求 ID | 描述 | 优先级 | 关联属性/实体 |
|---------|------|--------|---------------|
| FR-MEDIA-01 | 获取机位列表 API | P0 | LabStreamsResponse |
| FR-MEDIA-02 | 主副机位布局 | P0 | LabStream.id, label |
| FR-MEDIA-03 | HLS/MP4 播放 | P0 | protocol, playUrl |
| FR-MEDIA-04 | 手动 URL 调试 | P1 | — |
| FR-MEDIA-05 | 禁用态不拉流 | P0 | disabled |
| FR-MEDIA-06 | 回放模式 | P1 | VideoAsset.playbackUrl, replay |
| FR-MEDIA-07 | 单画面全屏 | P1 | — |
| FR-MEDIA-08 | WebRTC | P2 | protocol=webrtc |
| FR-MEDIA-09 | 指令时段录像 | P1 | requireVideo, VideoAsset |

### 6.4 指令与结果

| 需求 ID | 描述 | 优先级 | 关联属性/实体 |
|---------|------|--------|---------------|
| FR-CMD-01 | 指令状态机 | P0 | CommandStatus |
| FR-CMD-02 | MVP 原子指令 5 类 | P0 | Command.type |
| FR-CMD-03 | 步骤绑定 commandType | P0 | ExperimentStep |
| FR-CMD-04 | 幂等与超时 | P0 | commandId, timeoutSec |
| FR-CMD-05 | MQTT 下发 | P0 | CommandMessage |
| FR-CMD-06 | ACK/RESULT 上行 | P0 | AckMessage, ResultMessage |
| FR-RESULT-01 | 结果与 commandId 绑定 | P0 | Result |
| FR-RESULT-02 | 大文件直传 | P1 | Result.fileUrl |
| FR-RESULT-03 | 时间轴与视频联动 | P1 | offsetSec |
| FR-RESULT-04 | 报告导出 | P2 | Session, Result |

### 6.5 安全与治理

| 需求 ID | 描述 | 优先级 | 关联属性/实体 |
|---------|------|--------|---------------|
| FR-GOV-01 | 统一认证 | P0 | User |
| FR-GOV-02 | RBAC + 实验室 ACL | P0 | roles, labId |
| FR-GOV-03 | 急停与联锁 | P0 | estop, system.estop |
| FR-GOV-04 | 审计 | P1 | AuditLog |
| FR-GOV-05 | 多租户隔离 | P2 | Tenant |
| FR-GOV-06 | 录像 retention | P2 | VideoAsset |

---

## 7. 状态机与业务规则

### 7.1 实验室状态迁移

```
awaiting --完成接入--> idle
offline --心跳恢复--> idle | maintenance
idle --创建会话--> busy
busy --所有会话结束--> idle
任意 --管理员--> maintenance
maintenance --管理员恢复--> idle
```

### 7.2 会话与排队规则

| 规则 ID | 规则描述 |
|---------|----------|
| BR-SESSION-01 | 当 `currentUsers >= maxConcurrent` 时，新任务 `status=queued` |
| BR-SESSION-02 | 同一用户对同一实验室同时最多 1 个 `active` 写会话 |
| BR-SESSION-03 | `observeOnly=true` 不增加 currentUsers |
| BR-SESSION-04 | 会话空闲超过 TTL（默认 30min）自动释放，可配置 |
| BR-SESSION-05 | 步骤必须按序：`active` 仅允许一个；`done` 之前不得跳过（除非教师强制） |

### 7.3 视频拉流规则

| 规则 ID | 规则描述 |
|---------|----------|
| BR-VIDEO-01 | `disabled=true` 或排队视图不得调用 streams API |
| BR-VIDEO-02 | `playUrl` 过期前 5 分钟前端自动刷新 |
| BR-VIDEO-03 | 全景机位 `panorama` 默认作为主画面 |
| BR-VIDEO-04 | `replay=true` 使用 VideoAsset.playbackUrl，不走直播 |

### 7.4 指令执行规则

| 规则 ID | 规则描述 |
|---------|----------|
| BR-CMD-01 | 重复 `commandId` 不重复执行 |
| BR-CMD-02 | 超出 `timeoutSec` 置 `timeout`，边缘应中止 |
| BR-CMD-03 | `system.estop` 最高优先级，清空本地指令队列 |
| BR-CMD-04 | 剧本外 `type` 拒绝，返回 403 `SCRIPT_VIOLATION` |
| BR-CMD-05 | 维护中实验室拒绝下发，返回 409 `LAB_NOT_AVAILABLE` |

---

## 8. 非功能需求

| 类别 | 属性 | 指标 |
|------|------|------|
| 性能 | 指令下发 P95 延迟 | < 2s（国内专线） |
| 性能 | HLS 端到端延迟 | < 3s（跨网） |
| 性能 | 首页首屏 LCP | < 2.5s |
| 可用性 | 中心可用性 | 99.9% |
| 可用性 | 单点实验室离线 | 不影响其他 lab |
| 可靠性 | 边缘指令队列 | 离线缓存 24h |
| 安全 | 传输 | TLS 1.2+ |
| 安全 | 指令 | HMAC-SHA256 签名 |
| 兼容 | 浏览器 | Chrome/Edge/Safari 最近 2 个大版本 |
| 无障碍 | 控件 | 关键按钮 aria-label；Esc 关闭下拉 |

---

## 9. 版本规划

### 9.1 v0.1 原型（当前 Web）

| 能力 | 数据方式 | 缺失 |
|------|----------|------|
| 大厅 + 卡片 | mock.ts 静态 Lab | 搜索筛选 API |
| 工作台三栏 | mock Session | 真实指令/遥测 |
| 视频 | mock streams API | 真实推流与录像 |
| 用户 | 硬编码 CURRENT_USER | 认证 RBAC |

### 9.2 v1.0 MVP（目标 8～12 周）

- 实体落地：Tenant, Lab, Session, Command, Result, LabStream（PostgreSQL）
- API：§5.2～5.8 全部实现
- 边缘：MQTT 指令闭环 + 1 路真实 HLS
- 前端：mock 切换为 API；FR-WB-08 操作按钮可用

### 9.3 v1.1

- 搜索筛选、结果时间轴、遥测 WebSocket、卡片预览流生产配置

### 9.4 v2.0

- 剧本 DAG 编辑器、多实验室监控墙、预约、多租户计费

---

## 附录 A：文档修订记录

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2026-05-24 | 初稿 |
| v2.0 | 2026-05-24 | 独立详细 PRD：全量属性字典、枚举、接口字段、页面绑定、业务规则；不依赖外部设计方案 |

---

*本文档为智慧实验室产品交付的单一事实来源（SSOT），研发与测试以本文属性表与需求 ID 为准进行实现与用例编写。*
