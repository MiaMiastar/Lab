import type {
  DeviceLogEvent,
  ExperimentIntro,
  ExperimentResultItem,
  ExperimentScenario,
  JiaxingObserveMeta,
  JiaxingObserveQueueBundle,
  Lab,
  SessionInfo,
  WorkbenchExperimentListItem,
} from "../types";
import {
  jiaxingObserveFullLog,
  jiaxingObserveMeta,
  jiaxingObserveSteps,
} from "./jiaxingDeviceStream";
import {
  xmuObserveFullLog,
  xmuObserveMeta,
  xmuObserveSteps,
} from "./xmuDeviceStream";
import { DEFAULT_LAB_STREAM } from "../lib/streams";

export const CURRENT_USER = "张老师";
export const MAX_COMPLETED_EXPERIMENTS = 5;

export const DISCIPLINE_LABELS: Record<Lab["discipline"], string> = {
  electronics: "电子学",
  chemistry: "化学",
  physics: "物理",
  biology: "生物",
  engineering: "工科",
};

/** 卡片状态文案（与设计稿一致） */
export const CARD_STATUS_LABELS: Record<Lab["status"], string> = {
  idle: "空闲",
  busy: "实验中",
  maintenance: "维护中",
  offline: "离线",
  awaiting: "待接入",
};

export const STATUS_LABELS: Record<Lab["status"], string> = {
  idle: "空闲",
  busy: "占用中",
  maintenance: "维护中",
  offline: "离线",
  awaiting: "待接入",
};

/** 平台已上架实验场景（与实验室卡片主标题一一对应） */
export const experimentScenarios: ExperimentScenario[] = [
  { id: "scenario_ata_optimization", title: "ATA 反应条件优化" },
  { id: "scenario_polymer_design", title: "光刻胶 / 聚合反应自动化设计" },
  { id: "scenario_synthetic_biology", title: "合成生物学自动化流程设计与执行" },
  { id: "scenario_small_molecule_screen", title: "小分子候选物筛选实验" },
  { id: "scenario_electrochem_deposit", title: "电化学沉积 / 电催化材料制备实验" },
  { id: "scenario_ceramic_autonomy", title: "陶瓷材料智能自主实验" },
  { id: "scenario_electrocatalysis_eval", title: "电催化材料制备与活性评价实验" },
  { id: "scenario_protein_evolution", title: "蛋白质定向进化筛选实验" },
  { id: "scenario_ai_synthesis", title: "AI 驱动小分子合成路线优化" },
  { id: "scenario_sequencing_lib", title: "高通量测序文库构建与质控" },
];

export const labs: Lab[] = [
  {
    id: "lab_fudan_ata",
    name: "复旦大学 · 智能合成工作站",
    campus: "上海",
    discipline: "chemistry",
    status: "busy",
    cameras: 4,
    queueLength: 1,
    completedExperimentCount: 1,
    maxConcurrent: 2,
    currentUsers: 1,
    tags: ["ATA", "不对称催化", "条件优化"],
    lastHeartbeat: "6 秒前",
    experimentScenarioId: "scenario_ata_optimization",
    workflowTitle: "ATA 反应条件优化",
    cardDescription:
      "围绕 ATA 不对称反应，智能体生成不同底物浓度、酶用量、pH、温度、反应时间等条件组合，由自动化工作站完成反应执行，并根据转化率、产率或 ee 值等结果反馈，辅助筛选最优反应条件。",
    institutionName: "复旦大学",
    institutionSubtitle: "面向反应条件优化的智能合成工作站",
    institutionLogo: "/images/institutions/fudan.png",
    previewStreamEnabled: false,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_xmu_polymer",
    name: "厦门大学 · 高分子自动化平台",
    campus: "厦门",
    discipline: "chemistry",
    status: "busy",
    cameras: 5,
    queueLength: 1,
    completedExperimentCount: 1,
    maxConcurrent: 2,
    currentUsers: 1,
    tags: ["光刻胶", "聚合反应", "温控"],
    lastHeartbeat: "9 秒前",
    experimentScenarioId: "scenario_polymer_design",
    workflowTitle: "光刻胶 / 聚合反应自动化设计",
    cardDescription:
      "围绕光刻胶材料或聚合反应需求，生成单体、引发剂、溶剂、温度、反应速率和反应时间等实验方案，并通过平台控制加液、温控、搅拌和反应流程，回传设备状态、执行进展和阶段结果。",
    institutionName: "厦门大学",
    institutionSubtitle: "面向光刻胶材料配方、聚合反应温控和加液流程的自动化实验平台",
    institutionLogo: "/images/institutions/xmu.png",
    previewStreamEnabled: true,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_zju_ibio",
    name: "浙江大学 · iBioFoundry",
    campus: "杭州",
    discipline: "biology",
    status: "busy",
    cameras: 4,
    queueLength: 0,
    completedExperimentCount: 0,
    maxConcurrent: 2,
    currentUsers: 1,
    tags: ["合成生物学", "DNA 组装", "细胞培养"],
    lastHeartbeat: "8 秒前",
    experimentScenarioId: "scenario_synthetic_biology",
    workflowTitle: "合成生物学自动化流程设计与执行",
    cardDescription:
      "围绕基因线路构建、DNA 元件组装、细胞工厂构建或蛋白/代谢通路优化等需求，平台完成 DNA 组装、转化、克隆筛选、细胞培养和检测分析等操作，并返回执行进度、设备状态和实验结果。",
    institutionName: "浙江大学 iBioFoundry",
    institutionSubtitle: "面向合成生物学样本、DNA、细胞和检测流程的自动化实验平台",
    institutionLogo: "/images/institutions/zju.png",
    previewStreamEnabled: true,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_zju_oasis",
    name: "浙江大学 · 绿洲一号",
    campus: "杭州",
    discipline: "chemistry",
    status: "busy",
    cameras: 5,
    queueLength: 2,
    completedExperimentCount: 1,
    maxConcurrent: 3,
    currentUsers: 2,
    tags: ["高通量筛选", "小分子", "候选物"],
    lastHeartbeat: "11 秒前",
    experimentScenarioId: "scenario_small_molecule_screen",
    workflowTitle: "小分子候选物筛选实验",
    cardDescription:
      "根据目标靶点或筛选需求，生成化合物板布局、样本稀释、加样、孵育和检测方案，通过自动化设备完成小分子筛选流程，并返回活性、抑制率或命中候选物等结果。",
    institutionName: "浙江大学 绿洲一号",
    institutionSubtitle: "面向小分子发现与高通量筛选的自动化实验平台",
    institutionLogo: "/images/institutions/zju.png",
    previewStreamEnabled: false,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_jiaxing_electrochem",
    name: "嘉兴大学 · 电化学工作站",
    campus: "嘉兴",
    discipline: "chemistry",
    status: "busy",
    cameras: 4,
    queueLength: 3,
    completedExperimentCount: 1,
    maxConcurrent: 2,
    currentUsers: 1,
    tags: ["电化学沉积", "电催化", "材料制备"],
    lastHeartbeat: "7 秒前",
    experimentScenarioId: "scenario_electrochem_deposit",
    workflowTitle: "电化学沉积 / 电催化材料制备实验",
    cardDescription:
      "围绕催化材料组分、前驱体浓度、沉积电位、电流密度和反应时间等参数生成实验配方，并将方案转化为设备可执行指令，完成电化学沉积或电催化材料制备，回传设备状态和实验结果。",
    institutionName: "嘉兴大学",
    institutionSubtitle: "面向催化材料设计、方案生成与设备执行闭环的自动化实验平台",
    institutionLogo: "/images/institutions/jiaxing.png",
    previewStreamEnabled: true,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_siccas_ceramic",
    name: "上硅所 · 陶瓷材料平台",
    campus: "上海",
    discipline: "engineering",
    status: "busy",
    cameras: 4,
    queueLength: 0,
    completedExperimentCount: 0,
    maxConcurrent: 2,
    currentUsers: 1,
    tags: ["陶瓷材料", "高通量", "智能实验"],
    lastHeartbeat: "10 秒前",
    experimentScenarioId: "scenario_ceramic_autonomy",
    workflowTitle: "陶瓷材料智能自主实验",
    cardDescription:
      "围绕关键陶瓷材料的设计、制备与性能评估需求，智能体/材料大模型辅助生成实验方案，并联动自动化平台完成实验执行、过程记录和结果回传。",
    institutionName: "上硅所",
    institutionSubtitle: "面向关键陶瓷材料智能研究的数据驱动高通量自动化平台",
    institutionLogo: "/images/institutions/siccas.png",
    institutionLogoVariant: "wide",
    previewStreamEnabled: false,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_pujiang_electrochem",
    name: "浦江国家实验室 · 电催化平台",
    campus: "上海",
    discipline: "chemistry",
    status: "busy",
    cameras: 4,
    queueLength: 1,
    completedExperimentCount: 1,
    maxConcurrent: 2,
    currentUsers: 1,
    tags: ["电催化", "OER", "HER"],
    lastHeartbeat: "7 秒前",
    experimentScenarioId: "scenario_electrocatalysis_eval",
    workflowTitle: "电催化材料制备与活性评价实验",
    cardDescription:
      "围绕电催化材料组分、前驱体浓度、沉积电位与反应时间等参数生成实验配方，由自动化电化学工作站完成材料制备与 OER/HER 活性测试，回传设备状态与评价结果。",
    institutionName: "浦江国家实验室",
    institutionSubtitle: "面向电催化材料设计、制备与性能评价的自动化实验平台",
    institutionLogo: "浦",
    previewStreamEnabled: true,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_pujiang_protein_evolution",
    name: "浦江国家实验室 · 蛋白质定向进化平台",
    campus: "上海",
    discipline: "biology",
    status: "busy",
    cameras: 5,
    queueLength: 0,
    completedExperimentCount: 0,
    maxConcurrent: 2,
    currentUsers: 1,
    tags: ["定向进化", "蛋白工程", "高通量筛选"],
    lastHeartbeat: "9 秒前",
    experimentScenarioId: "scenario_protein_evolution",
    workflowTitle: "蛋白质定向进化筛选实验",
    cardDescription:
      "围绕目标酶活性与稳定性需求，生成突变文库构建、表达培养与活性筛选方案，由自动化平台完成文库制备、培养与检测流程，并返回命中变体与筛选数据。",
    institutionName: "浦江国家实验室",
    institutionSubtitle: "面向蛋白质工程与定向进化的高通量自动化实验平台",
    institutionLogo: "浦",
    previewStreamEnabled: false,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_xtalpi_chemistry",
    name: "晶泰科技 · 智能化学实验室",
    campus: "深圳",
    discipline: "chemistry",
    status: "awaiting",
    cameras: 4,
    queueLength: 0,
    completedExperimentCount: 0,
    maxConcurrent: 2,
    currentUsers: 0,
    tags: ["AI 化学", "晶体结构", "自动化合成"],
    lastHeartbeat: "待接入",
    experimentScenarioId: "scenario_ai_synthesis",
    workflowTitle: "AI 驱动小分子合成路线优化",
    cardDescription:
      "围绕目标分子结构与合成可行性，智能体生成反应路线与条件组合，由自动化工作站完成固液投料、反应执行与样品分析，并回传转化率与谱图结果。",
    institutionName: "晶泰科技",
    institutionSubtitle: "面向 AI 与机器人融合的智能化合物研发自动化平台",
    institutionLogo: "/images/institutions/xtalpi.png",
    institutionLogoVariant: "wide",
    previewStreamEnabled: false,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
  {
    id: "lab_mgi_genomics",
    name: "华大智造 · 高通量基因组学平台",
    campus: "深圳",
    discipline: "biology",
    status: "awaiting",
    cameras: 5,
    queueLength: 0,
    completedExperimentCount: 0,
    maxConcurrent: 3,
    currentUsers: 0,
    tags: ["基因测序", "文库构建", "自动化"],
    lastHeartbeat: "待接入",
    experimentScenarioId: "scenario_sequencing_lib",
    workflowTitle: "高通量测序文库构建与质控",
    cardDescription:
      "围绕样本批次与测序深度需求，生成文库构建、质控与上机准备方案，由自动化平台完成核酸处理、质检与流程记录，并返回质控指标与运行状态。",
    institutionName: "华大智造",
    institutionSubtitle: "面向基因组学与生命科学的自动化实验与测序平台",
    institutionLogo: "/images/institutions/mgi.png",
    institutionLogoVariant: "wide",
    previewStreamEnabled: false,
    previewStreamUrl: DEFAULT_LAB_STREAM,
  },
];

export function getLabById(id: string): Lab | undefined {
  return labs.find((l) => l.id === id);
}

export function hasExecutionLogForLab(labId: string | undefined): boolean {
  const lab = labId ? getLabById(labId) : undefined;
  return (
    lab?.institutionName === "嘉兴大学" ||
    lab?.institutionName === "厦门大学" ||
    lab?.institutionName === "浦江国家实验室"
  );
}

export interface HallStats {
  /** 接入实验室总数 */
  total: number;
  /** 已上架实验场景数（去重） */
  scenarios: number;
  busy: number;
  idle: number;
  maintenance: number;
  offline: number;
  awaiting: number;
  /** 各实验室排队数之和 */
  queued: number;
  /** 已完成实验展示数，最多展示 MAX_COMPLETED_EXPERIMENTS 个 */
  completed: number;
}

/** 大厅汇总：实验室状态与各卡片排队/已完成字段 */
export function computeHallStats(labList: readonly Lab[]): HallStats {
  const scenarioIds = new Set<string>();

  const stats: HallStats = {
    total: labList.length,
    scenarios: 0,
    busy: 0,
    idle: 0,
    maintenance: 0,
    offline: 0,
    awaiting: 0,
    queued: 0,
    completed: 0,
  };

  for (const lab of labList) {
    stats[lab.status] += 1;
    stats.queued += Math.max(0, lab.queueLength);
    stats.completed += Math.max(0, lab.completedExperimentCount);
    scenarioIds.add(lab.experimentScenarioId);
  }

  stats.scenarios = scenarioIds.size;
  stats.completed = Math.min(MAX_COMPLETED_EXPERIMENTS, stats.completed);

  return stats;
}

const OHM_LAW_INTRO: SessionInfo["intro"] = {
  summary:
    "在远程电子学实验台上，通过可调电源与数字万用表，测量固定电阻两端电压与回路电流，验证欧姆定律 U = I·R，并比较理论值与实测误差。",
  objectives: [
    "正确完成实验台接线与通道选择",
    "掌握远程上电、读数与截图存档流程",
    "根据多组数据计算电阻并分析误差来源",
  ],
  equipment: ["直流稳压电源", "数字万用表", "标准电阻 R1（27 Ω）", "面包板与杜邦线"],
  safetyNotes: [
    "远程上电电压不得超过 5 V，电流限 0.5 A",
    "接线未完成前禁止下发上电指令",
    "异常发热或异味立即点击「急停」并联系现场",
  ],
  estimatedDuration: "约 45 分钟",
};

const ATA_INTRO: SessionInfo["intro"] = {
  originalGoal:
    "为苯乙炔与正壬醛的 ATA 反应筛选最优催化条件，在 0.1 mmol 规模下验证 CuI/Prodipine-HFIP 体系的产率与 ee 表现，形成可复现实验方案。",
  plan: {
    conditions:
      "CuI (10 mol%) + Prodipine (20 mol%), HFIP, 4A MS, 60 °C, 12 h；苯乙炔 1.2 equiv，正壬醛 1.0 equiv（0.1 mmol 标尺）。",
    rationale:
      "Cu(I)+Prodipine 体系常用于 ATA：Cu(I) 促进炔/醛转化，Prodipine 提供手性环境；HFIP 有助于反应活化与立体控制；分子筛降低含水对 Lewis 酸/中间体的干扰，兼顾转化与 ee。",
    compliance:
      "已确认：玻璃反应瓶 + PTFE 垫片盖（HFIP 不兼容部分塑料）；加入 4A 分子筛 20 mg；60 °C / 12 h 与密闭反应器耐压匹配。",
    reagents: [
    {
      name: "正壬醛",
      role: "substrate (electrophile)",
      amount: "17.3 μL",
      calculation:
        "n=0.100 mmol; m=n*MW=0.100*142.24=14.22 mg; V=m/ρ=14.22 mg / (0.823 mg/μL)=17.28 μL",
      equiv: "1.0 / 0.100 mmol / liquid",
    },
    {
      name: "苯乙炔",
      role: "substrate (nucleophile)",
      amount: "13.2 μL",
      calculation:
        "n=0.120 mmol; m=n*MW=0.120*102.13=12.26 mg; V=m/ρ=12.26 mg / (0.930 mg/μL)=13.18 μL",
      equiv: "1.2 / 0.120 mmol / liquid / 已确认",
    },
    {
      name: "CuI",
      role: "metal salt (catalyst)",
      amount: "1.90 mg",
      calculation:
        "10 mol% vs aldehyde: n=0.0100 mmol; m=n*MW=0.0100*190.45=1.90 mg",
      equiv: "0.10 / 0.0100 mmol / solid / 已确认",
    },
    {
      name: "(S)-(-)-alpha,alpha-Diphenyl-2-pyrrolidinemethanol",
      role: "chiral amine (organocatalyst)",
      amount: "5.07 mg",
      calculation:
        "20 mol% vs aldehyde: n=0.0200 mmol; m=n*MW=0.0200*253.34=5.07 mg",
      equiv: "0.20 / 0.0200 mmol / solid / 已确认",
    },
    {
      name: "HFIP",
      role: "solvent",
      amount: "0.50 mL",
      calculation:
        "目标反应浓度建议 0.2 M（以正壬醛计）：V = n/C = 0.100 mmol / 0.20 M = 0.50 mL",
      equiv: "solvent / N/A / liquid / 已确认",
    },
    {
      name: "4A molecular sieves",
      role: "additive (drying)",
      amount: "20 mg",
      calculation: "采用 planningHints.suggestedFallbacks.molecularSieves 建议值",
      equiv: "additive / N/A / solid / 已确认",
    },
    ],
  },
  resultsNote: "实验进行中 · 产率与 ee 待反应结束后回传",
};

function labelFromApiOutputPath(path: string): string {
  const base = path.replace(/^\.\//, "").replace(/^api_output\//, "");
  const parts = base.split("_");
  return parts.length >= 2 ? `${parts[0]}_${parts[1]}` : base;
}

function resultsFromObserveMeta(meta: JiaxingObserveMeta): ExperimentResultItem[] {
  return (meta.results ?? []).map((path) => ({
    label: labelFromApiOutputPath(path),
    value: path,
    status: "ready",
  }));
}

const JIAXING_INTRO: ExperimentIntro = {
  originalGoal:
    "帮我设计一个同时具有高 OER 和 HER 的催化剂配方，优先体系创新性。",
  confirmedConditions: [
    "目标：同时具备高 OER 与 HER 活性的双功能电催化剂",
    "偏好：体系创新性优先",
  ],
  instructionDraft: [
    { op: "电化学工作站: 设置模式", detail: "微流控电化学沉积" },
    { op: "电化学工作站: 设置温度", detail: "25°C" },
    { op: "电化学工作站: 设置电流密度", detail: "100 mA cm⁻²" },
    {
      op: "进液管道: 开始沉积(按候选1→4依次)",
      detail: "分别切换对应金属盐前驱液，形成目标配比沉积层",
    },
  ],
  plans: [
    {
      title: "候选 #1",
      conditions: "(Ni0.20Fe0.15Co0.15Mn0.10Mo0.10W0.10V0.10Cr0.10)(O)OH",
      rationale: "高熵多金属(氧)氢氧化物，兼顾 OER 与 HER 位点",
      compliance:
        "元素均在可用清单且无 Au/Pt/Pd；金属数=8≤8，配比步长 0.01；(O)OH 骨架，电荷自洽可行",
    },
    {
      title: "候选 #2",
      conditions: "(Ni0.30Fe0.20Co0.15Mo0.15W0.10V0.10)OH",
      rationale: "NiFe 促 OER，Mo/W/V 增强 HER 与导电",
      compliance:
        "元素均在可用清单且无 Au/Pt/Pd；金属数=6≤8，配比步长 0.01；OH 骨架，适配碱性双功能",
    },
    {
      title: "候选 #3",
      conditions: "(Ni0.25Fe0.20Co0.15Mn0.10Cr0.10Ti0.10Nb0.10)OOH",
      rationale: "引入 Ti/Nb/Cr 调电子结构，提升双功能稳定性",
      compliance:
        "元素均在可用清单且无 Au/Pt/Pd；金属数=7≤8，配比步长 0.01；OOH 骨架，价态可通过电沉积调控",
    },
    {
      title: "候选 #4",
      conditions: "(Ni0.35Fe0.20Co0.15Mo0.15Cu0.10Zn0.05)(O)OH",
      rationale: "Cu/Zn 微调 H* 吸附，Mo 提升 HER，NiFeCo 保 OER",
      compliance:
        "元素均在可用清单且无 Au/Pt/Pd；金属数=5≤8，配比步长 0.01；(O)OH 骨架，含 Cu/Zn 调氢吸附",
    },
  ],
  safetyChecks: [
    "确认电化学工作站/进液管道/相机均在线可控",
    "核对所有前驱液无禁用元素且管路无泄漏",
    "开启相机监测沉积区，异常电压/气泡及时停机",
  ],
  results: [
    { label: "候选 #1", value: "沉积与 LSV 待完成", status: "pending" },
    { label: "候选 #2", value: "沉积与 LSV 待完成", status: "pending" },
    { label: "候选 #3", value: "沉积与 LSV 待完成", status: "pending" },
    { label: "候选 #4", value: "沉积与 LSV 待完成", status: "pending" },
  ],
};

const JIAXING_STEPS: SessionInfo["steps"] = [
  {
    id: "jx1",
    title: "设备联机检查",
    description: "电化学工作站、进液管道与相机在线可控",
    status: "done",
    commandType: "safety.preflight",
  },
  {
    id: "jx2",
    title: "工作站参数设置",
    description: "微流控沉积 · 25°C · 100 mA cm⁻²",
    status: "active",
    commandType: "echem.set_parameters",
  },
  {
    id: "jx3",
    title: "候选 #1 沉积",
    description: "切换前驱液并按 (NiFeCoMnMoWVCr)(O)OH 配比沉积",
    status: "pending",
    commandType: "fluidics.deposit_candidate",
  },
  {
    id: "jx4",
    title: "候选 #2–4 沉积",
    description: "依次切换金属盐前驱液，完成其余候选沉积层",
    status: "pending",
    commandType: "fluidics.deposit_sequence",
  },
];

const XMU_INTRO: ExperimentIntro = {
  plan: {
    conditions: [
      "聚合二氧六环加液量（ml）:10.0",
      "AIBME/二氧六环加液量（ml）:4",
      "聚合升温保持温度（℃）:70",
      "聚合反应时长（h）:12",
    ].join("\n"),
    rationale: "",
    compliance: "",
  },
  safetyChecks: [
    "确认通风柜联锁和温控模块处于可用状态。",
    "确认聚合二氧六环固定加液量和 AIBME 加液量经用户 review。",
    "确认温度范围 5-90 ℃、加液量 0.5-100 ml、反应时长 6-18 h 均已满足。",
    "确认 SmartCmd 提交参数与状态轮询流程已完成校验。",
  ],
  resultsNote: `实验进行中 · ${xmuObserveMeta.startedAt.slice(11)} – 进行中`,
  results: [
    { label: "批次输出", value: xmuObserveMeta.results?.[0] ?? "process_output/test-008", status: "pending" },
  ],
};

const XMU_STEPS: SessionInfo["steps"] = [
  {
    id: "xmu1",
    title: "实验方案生成",
    description: "POST generate · 提交 1 号反应器聚合方案",
    status: "done",
    commandType: "experiment.generate",
  },
  {
    id: "xmu2",
    title: "指令解析",
    description: "本地指令 34 条已生成",
    status: "done",
    commandType: "experiment.parse_local",
  },
  {
    id: "xmu3",
    title: "工艺流程执行",
    description: "加液 · N₂ 保护 · 升温聚合",
    status: "active",
    commandType: "experiment.execute",
  },
  {
    id: "xmu4",
    title: "状态轮询",
    description: "GET status · 直至 executing=False",
    status: "pending",
    commandType: "experiment.poll_status",
  },
];

const XMU_OBSERVE_RUNNING: WorkbenchExperimentListItem = {
  id: "xmu-running",
  experimentName: "光刻胶聚合 · 1号反应器干实验",
  status: "running",
  subtitle: "test-008 · 日志实录回放",
  submittedAt: "2026-05-22 08:08:00",
};

const ATA_STEPS: SessionInfo["steps"] = [
  {
    id: "ata1",
    title: "手套箱准备",
    description: "inert-run；校验 O₂/H₂O；放置 4 个反应瓶与搅拌子",
    status: "done",
    commandType: "glovebox.prepare_environment",
  },
  {
    id: "ata2",
    title: "固体投料",
    description: "金属盐、手性胺与 4A 分子筛按候选方案分装至各瓶",
    status: "active",
    commandType: "add_solid.dose_solids",
  },
  {
    id: "ata3",
    title: "液体移液",
    description: "加入 HFIP 溶剂与底物（正壬醛、苯乙炔）至指定体积，封盖",
    status: "pending",
    commandType: "liquid_pipetting.pipette_liquids",
  },
  {
    id: "ata4",
    title: "反应搅拌",
    description: "60 °C 搅拌 12 h；记录视频与设备状态",
    status: "pending",
    commandType: "stir.run_reaction",
  },
];

export interface QueuedExperimentItem {
  id: string;
  experimentName: string;
  submittedAt?: string;
  completedAt?: string;
}

/** 工作台只读观察模式（?observe=1） */
export function isObserveMode(
  labId: string | undefined,
  searchParams: URLSearchParams
): boolean {
  return Boolean(labId) && searchParams.get("observe") === "1";
}

/** @deprecated 使用 isObserveMode */
export function isJiaxingObserveMode(
  labId: string | undefined,
  searchParams: URLSearchParams
): boolean {
  return isObserveMode(labId, searchParams);
}

const JIAXING_OBSERVE_RUNNING: WorkbenchExperimentListItem = {
  id: "jx-running",
  experimentName: "电催化沉积 · 完整单次实验",
  status: "running",
  subtitle: "Co / Fe / Ni · 日志实录回放",
  submittedAt: "2026-05-22 11:20:00",
};

const JIAXING_OBSERVE_QUEUED: WorkbenchExperimentListItem[] = [
  {
    id: "jx-q1",
    experimentName: "双功能 OER/HER · 候选 #1–#2 沉积",
    status: "queued",
    subtitle: "高熵 (NiFeCoMnMoWVCr)(O)OH + NiFeCoMoWV OH",
    submittedAt: "2026-05-22 11:05:00",
  },
  {
    id: "jx-q2",
    experimentName: "双功能 OER/HER · 候选 #3–#4 沉积",
    status: "queued",
    subtitle: "Ti/Nb/Cr 调电子结构 + Cu/Zn 调氢吸附",
    submittedAt: "2026-05-22 10:48:00",
  },
  {
    id: "jx-q3",
    experimentName: "对照组 · 二元 NiFe 微流控沉积",
    status: "queued",
    subtitle: "碱性介质 LSV 基准对照",
    submittedAt: "2026-05-22 10:30:00",
  },
];

const JIAXING_OBSERVE_COMPLETED: WorkbenchExperimentListItem[] = [
  {
    id: "jx-c1",
    experimentName: "电催化沉积 · Co / Fe / Ni",
    status: "completed",
    subtitle: "2026-05-21 14:08 – 14:24",
    submittedAt: "2026-05-21 14:08",
    completedAt: "2026-05-21 14:24",
  },
  {
    id: "jx-c2",
    experimentName: "恒电流沉积 · Mo-W-V 三元",
    status: "completed",
    subtitle: "2026-05-20 09:32 – 09:48",
    submittedAt: "2026-05-20 09:32",
    completedAt: "2026-05-20 09:48",
  },
  {
    id: "jx-c3",
    experimentName: "微流控沉积 · NiFe 高熵对照",
    status: "completed",
    subtitle: "2026-05-19 16:15 – 16:31",
    submittedAt: "2026-05-19 16:15",
    completedAt: "2026-05-19 16:31",
  },
  {
    id: "jx-c4",
    experimentName: "批后清洗 · 样品队列复检",
    status: "completed",
    subtitle: "2026-05-18 11:02 – 11:09",
    submittedAt: "2026-05-18 11:02",
    completedAt: "2026-05-18 11:09",
  },
];

const FUDAN_OBSERVE_RUNNING: WorkbenchExperimentListItem = {
  id: "fd-running",
  experimentName: "苯乙炔 + 正壬醛 · 0.1 mmol 规模",
  status: "running",
  subtitle: "苯乙炔 + 正壬醛 · 0.1 mmol 规模",
  submittedAt: "2026-05-25 17:16:32",
};

const FUDAN_OBSERVE_QUEUED: WorkbenchExperimentListItem[] = [
  {
    id: "fd-q1",
    experimentName: "ATA-2 (CuBr₂/Quinine, DMF)",
    status: "queued",
    subtitle: "Cu 系对照 · 60 °C · 12 h",
    submittedAt: "2026-05-22 07:45:00",
  },
];

const FUDAN_OBSERVE_COMPLETED: WorkbenchExperimentListItem[] = [
  {
    id: "fd-c1",
    experimentName: "ATA-1 (CuTc/Cinchonine, MeCN)",
    status: "completed",
    subtitle: "2026-05-21 09:15 – 21:20 · ee 92%",
    submittedAt: "2026-05-21 09:15",
    completedAt: "2026-05-21 21:20",
  },
  {
    id: "fd-c2",
    experimentName: "ATA-3 (CuOTf/L-Proline, TFE)",
    status: "completed",
    subtitle: "2026-05-20 14:02 – 02:05 · ee 88%",
    submittedAt: "2026-05-20 14:02",
    completedAt: "2026-05-21 02:05",
  },
  {
    id: "fd-c3",
    experimentName: "ATA-5 (CuCl₂/Quinidine, HFIP)",
    status: "completed",
    subtitle: "2026-05-19 10:30 – 22:35 · ee 85%",
    submittedAt: "2026-05-19 10:30",
    completedAt: "2026-05-19 22:35",
  },
  {
    id: "fd-c4",
    experimentName: "ATA-6 (AgBF₄/Prodipine, MeCN)",
    status: "completed",
    subtitle: "2026-05-18 08:12 – 20:18 · ee 79%",
    submittedAt: "2026-05-18 08:12",
    completedAt: "2026-05-18 20:18",
  },
];

function getCompletedExperimentDisplayCount(labId: string, fallback = 0): number {
  const lab = getLabById(labId);
  const count = lab?.completedExperimentCount ?? fallback;
  return Math.min(MAX_COMPLETED_EXPERIMENTS, Math.max(0, count));
}

export function getJiaxingObserveQueueBundle(): JiaxingObserveQueueBundle {
  return {
    running: JIAXING_OBSERVE_RUNNING,
    queued: JIAXING_OBSERVE_QUEUED,
    completed: JIAXING_OBSERVE_COMPLETED.slice(
      0,
      getCompletedExperimentDisplayCount("lab_jiaxing_electrochem", JIAXING_OBSERVE_COMPLETED.length)
    ),
  };
}

export function getObserveQueueBundle(labId: string): JiaxingObserveQueueBundle | null {
  if (labId === "lab_jiaxing_electrochem") {
    return getJiaxingObserveQueueBundle();
  }

  if (labId === "lab_xmu_polymer") {
    const lab = getLabById(labId);
    const queued = Array.from({ length: Math.max(0, lab?.queueLength ?? 0) }, (_, index) => ({
      id: `xmu-q-${index + 1}`,
      experimentName: `${lab?.workflowTitle ?? "聚合实验"} · 排队 ${index + 1}`,
      status: "queued" as const,
      submittedAt: `2026-05-22 ${String(7 - index).padStart(2, "0")}:30:00`,
    }));
    const completed = Array.from(
      { length: getCompletedExperimentDisplayCount(labId) },
      (_, index) => ({
        id: `xmu-c-${index + 1}`,
        experimentName: `光刻胶聚合 · 已完成 #${(lab?.completedExperimentCount ?? 0) - index}`,
        status: "completed" as const,
        subtitle: `2026-05-${String(21 - index).padStart(2, "0")} 批次`,
        submittedAt: `2026-05-${String(21 - index).padStart(2, "0")} 09:00`,
        completedAt: `2026-05-${String(21 - index).padStart(2, "0")} 09:24`,
      })
    );
    return {
      running: XMU_OBSERVE_RUNNING,
      queued,
      completed,
    };
  }

  if (labId === "lab_fudan_ata") {
    return {
      running: FUDAN_OBSERVE_RUNNING,
      queued: FUDAN_OBSERVE_QUEUED,
      completed: FUDAN_OBSERVE_COMPLETED.slice(
        0,
        getCompletedExperimentDisplayCount(labId, FUDAN_OBSERVE_COMPLETED.length)
      ),
    };
  }

  const lab = getLabById(labId);
  if (!lab) return null;

  const session = getSessionForLab(labId);
  const queued = Array.from({ length: Math.max(0, lab.queueLength) }, (_, index) => ({
    id: `${labId}-q-${index + 1}`,
    experimentName: `${lab.workflowTitle} · 排队 ${index + 1}`,
    status: "queued" as const,
    submittedAt: `2026-05-22 ${String(9 - index).padStart(2, "0")}:15:00`,
  }));

  const completedVisible = getCompletedExperimentDisplayCount(labId);
  const completed = Array.from({ length: completedVisible }, (_, index) => {
    const day = 22 - index;
    const dayStr = String(day).padStart(2, "0");
    return {
      id: `${labId}-c-${index + 1}`,
      experimentName: `${lab.workflowTitle} · 已完成 #${lab.completedExperimentCount - index}`,
      status: "completed" as const,
      subtitle: `批次 ${lab.completedExperimentCount - index}`,
      submittedAt: `2026-05-${dayStr} 10:00`,
      completedAt: `2026-05-${dayStr} 10:45`,
    };
  });

  return {
    running: {
      id: `${labId}-running`,
      experimentName: session.experimentName,
      status: "running",
      submittedAt: session.submittedAt ?? "2026-05-22 08:00:00",
    },
    queued,
    completed,
  };
}

function observeQueuedSession(labId: string, item: WorkbenchExperimentListItem): SessionInfo {
  const base = getSessionForLab(labId);
  const { resultsNote: _note, results: _results, ...introRest } = base.intro;
  return {
    labId,
    experimentName: item.experimentName,
    intro: introRest,
    steps: base.steps.map((step) => ({ ...step, status: "pending" as const })),
    submittedAt: item.submittedAt,
    completedAt: item.completedAt,
  };
}

function observeCompletedSession(labId: string, item: WorkbenchExperimentListItem): SessionInfo {
  const base = getSessionForLab(labId);
  return {
    labId,
    experimentName: item.experimentName,
    intro: {
      ...base.intro,
      resultsNote: item.subtitle ? `实验已完成 · ${item.subtitle}` : "实验已完成",
    },
    steps: base.steps.map((step) => ({ ...step, status: "done" as const, events: undefined })),
    submittedAt: item.submittedAt,
    completedAt: item.completedAt,
  };
}

function xmuQueuedSession(item: WorkbenchExperimentListItem): SessionInfo {
  const { resultsNote: _note, results: _results, ...introRest } = XMU_INTRO;
  return {
    labId: "lab_xmu_polymer",
    experimentName: item.experimentName,
    intro: introRest,
    steps: XMU_STEPS.map((step) => ({ ...step, status: "pending" as const })),
    submittedAt: item.submittedAt,
    completedAt: item.completedAt,
  };
}

function xmuCompletedSession(item: WorkbenchExperimentListItem): SessionInfo {
  return {
    labId: "lab_xmu_polymer",
    experimentName: item.experimentName,
    intro: {
      ...XMU_INTRO,
      resultsNote: `实验已完成 · ${item.subtitle ?? ""}`,
      results: [
        {
          label: "批次输出",
          value: `process_output/archive_${item.id}`,
          status: "ready" as const,
        },
      ],
    },
    steps: xmuObserveSteps.map((step) => ({ ...step, status: "done" as const, events: undefined })),
    submittedAt: item.submittedAt,
    completedAt: item.completedAt,
  };
}

function jiaxingQueuedSession(item: WorkbenchExperimentListItem): SessionInfo {
  const { resultsNote: _note, results: _results, ...introRest } = JIAXING_INTRO;
  return {
    labId: "lab_jiaxing_electrochem",
    experimentName: item.experimentName,
    intro: introRest,
    steps: JIAXING_STEPS.map((step) => ({ ...step, status: "pending" as const })),
    submittedAt: item.submittedAt,
    completedAt: item.completedAt,
  };
}

function jiaxingCompletedSession(item: WorkbenchExperimentListItem, index: number): SessionInfo {
  const isLatest = index === 0;
  const results = isLatest
    ? resultsFromObserveMeta(jiaxingObserveMeta)
    : [
        {
          label: "样品 A",
          value: `api_output/archive_${item.id}_0`,
          status: "ready" as const,
        },
        {
          label: "样品 B",
          value: `api_output/archive_${item.id}_1`,
          status: "ready" as const,
        },
      ];

  return {
    labId: "lab_jiaxing_electrochem",
    experimentName: item.experimentName,
    intro: {
      ...JIAXING_INTRO,
      resultsNote: `实验已完成 · ${item.subtitle ?? ""}`,
      results,
    },
    steps: jiaxingObserveSteps.map((step) => ({ ...step, status: "done" as const, events: undefined })),
    submittedAt: item.submittedAt,
    completedAt: item.completedAt,
  };
}

function formatLogTimestamp(base: string, offsetMinutes: number): string {
  const date = new Date(base.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return base;
  date.setMinutes(date.getMinutes() + offsetMinutes);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function deviceForCommand(commandType: string): string {
  if (commandType.includes("electrochem")) return "电化学工作站";
  if (commandType.includes("fluid")) return "液路系统";
  if (commandType.includes("molbio")) return "液体处理工作站";
  if (commandType.includes("incubator")) return "培养箱";
  if (commandType.includes("screen")) return "酶标仪";
  return "自动化平台";
}

function buildExecutionLogFromSession(session: SessionInfo): SessionInfo["observeLog"] {
  const startedAt = session.submittedAt ?? "2026-05-22 09:00:00";
  const executableSteps = session.steps.filter((step) => step.status !== "pending");
  const fullLog: DeviceLogEvent[] = executableSteps.flatMap((step, index) => {
    const baseOffset = index * 4;
    const device = deviceForCommand(step.commandType);
    const statusText = step.status === "done" ? "已完成" : "执行中";
    return [
      {
        timestamp: formatLogTimestamp(startedAt, baseOffset),
        device: "自动化平台",
        message: `下发指令：${step.title} · ${step.commandType}`,
        phaseId: step.id,
        phaseTitle: step.title,
      },
      {
        timestamp: formatLogTimestamp(startedAt, baseOffset + 2),
        device,
        message: `${step.description} · ${statusText}`,
        phaseId: step.id,
        phaseTitle: step.title,
      },
    ];
  });
  const finishedAt = fullLog.at(-1)?.timestamp ?? startedAt;
  const meta: JiaxingObserveMeta = {
    startedAt,
    finishedAt,
    queue: [],
    totalEvents: fullLog.length,
    logSource: "系统执行日志 · 自动化平台",
    experimentLabel: session.experimentName,
    results: session.intro.results?.map((item) => item.value) ?? [],
  };

  return { meta, fullLog };
}

/** 嘉兴观察模式：viewIndex 0=进行中，1..Q=排队，Q+1..=已完成 */
export function getJiaxingObserveSessionByViewIndex(viewIndex: number): SessionInfo {
  return getObserveSessionByViewIndex("lab_jiaxing_electrochem", viewIndex);
}

/** 观察模式：viewIndex 0=进行中，1..Q=排队，Q+1..=已完成 */
export function getObserveSessionByViewIndex(labId: string, viewIndex: number): SessionInfo {
  const bundle = getObserveQueueBundle(labId);
  if (!bundle) return getSessionForLab(labId);

  if (viewIndex <= 0) {
    return getObserveRunningSession(labId);
  }
  if (viewIndex <= bundle.queued.length) {
    const item = bundle.queued[viewIndex - 1];
    if (labId === "lab_jiaxing_electrochem") return jiaxingQueuedSession(item);
    if (labId === "lab_xmu_polymer") return xmuQueuedSession(item);
    return observeQueuedSession(labId, item);
  }
  const completedIndex = viewIndex - bundle.queued.length - 1;
  if (completedIndex < bundle.completed.length) {
    const item = bundle.completed[completedIndex];
    const completedSession =
      labId === "lab_jiaxing_electrochem"
        ? jiaxingCompletedSession(item, completedIndex)
        : labId === "lab_xmu_polymer"
          ? xmuCompletedSession(item)
          : observeCompletedSession(labId, item);
    return hasExecutionLogForLab(labId) && !completedSession.observeLog
      ? { ...completedSession, observeLog: buildExecutionLogFromSession(completedSession) }
      : completedSession;
  }
  return getObserveRunningSession(labId);
}

export function getFudanObserveSession(): SessionInfo {
  return {
    labId: "lab_fudan_ata",
    experimentName: FUDAN_OBSERVE_RUNNING.experimentName,
    submittedAt: FUDAN_OBSERVE_RUNNING.submittedAt,
    completedAt: FUDAN_OBSERVE_RUNNING.completedAt,
    intro: ATA_INTRO,
    steps: ATA_STEPS,
  };
}

export function getObserveRunningSession(labId: string): SessionInfo {
  const bundle = getObserveQueueBundle(labId);
  const base =
    labId === "lab_jiaxing_electrochem"
      ? getJiaxingObserveSession()
      : labId === "lab_xmu_polymer"
        ? getXmuObserveSession()
        : labId === "lab_fudan_ata"
          ? getFudanObserveSession()
          : getSessionForLab(labId);
  const sessionWithLog =
    hasExecutionLogForLab(labId) && !base.observeLog
      ? { ...base, observeLog: buildExecutionLogFromSession(base) }
      : base;
  if (!bundle) return sessionWithLog;
  return {
    ...sessionWithLog,
    submittedAt: bundle.running.submittedAt,
    completedAt: bundle.running.completedAt,
  };
}

/** 排队中的实验（不含当前进行中） */
export function getQueuedExperimentsForLab(labId: string): QueuedExperimentItem[] {
  if (labId === "lab_jiaxing_electrochem") {
    return getJiaxingObserveQueueBundle().queued.map((item) => ({
      id: item.id,
      experimentName: item.experimentName,
      submittedAt: item.submittedAt,
      completedAt: item.completedAt,
    }));
  }

  const bundle = getObserveQueueBundle(labId);
  if (bundle && bundle.queued.length > 0) {
    return bundle.queued.map((item) => ({
      id: item.id,
      experimentName: item.experimentName,
      submittedAt: item.submittedAt,
      completedAt: item.completedAt,
    }));
  }

  const lab = getLabById(labId);
  const pending = Math.max(0, lab?.queueLength ?? 0);

  return Array.from({ length: pending }, (_, index) => ({
    id: `${labId}-queued-${index + 1}`,
    experimentName: `${lab?.workflowTitle ?? "实验任务"} · 排队 ${index + 1}`,
    submittedAt: `2026-05-22 ${String(9 - index).padStart(2, "0")}:15:00`,
  }));
}

/** 排队项详情：步骤均为待开始，用于工作台排队视图 */
export function getQueuedExperimentView(labId: string, queuedIndex: number): SessionInfo {
  const base = getSessionForLab(labId);
  const queued = getQueuedExperimentsForLab(labId);
  const item = queued[queuedIndex];
  const { resultsNote: _note, results: _results, ...introRest } = base.intro;

  return {
    labId,
    experimentName: item?.experimentName ?? base.experimentName,
    intro: introRest,
    steps: base.steps.map((step) => ({
      ...step,
      id: `queued-${queuedIndex}-${step.id}`,
      status: "pending" as const,
    })),
    submittedAt: item?.submittedAt,
    completedAt: item?.completedAt,
  };
}

/** 厦门大学高分子 · 观察模式：干实验执行日志（来自 厦大.docx） */
export function getXmuObserveSession(): SessionInfo {
  return {
    labId: "lab_xmu_polymer",
    experimentName: XMU_OBSERVE_RUNNING.experimentName,
    submittedAt: XMU_OBSERVE_RUNNING.submittedAt,
    completedAt: XMU_OBSERVE_RUNNING.completedAt,
    intro: {
      ...XMU_INTRO,
      resultsNote: `实验进行中 · ${xmuObserveMeta.startedAt.slice(11)} – ${xmuObserveMeta.finishedAt.slice(11)}`,
      results: (xmuObserveMeta.results ?? []).map((path, i) => ({
        label: `输出 ${i + 1}`,
        value: path,
        status: "pending" as const,
      })),
    },
    steps: xmuObserveSteps,
    observeLog: {
      meta: xmuObserveMeta,
      fullLog: xmuObserveFullLog,
    },
  };
}

/** 嘉兴电化学 · 观察模式：实验步骤附带设备流事件（来自运行日志） */
export function getJiaxingObserveSession(): SessionInfo {
  return {
    labId: "lab_jiaxing_electrochem",
    experimentName: JIAXING_OBSERVE_RUNNING.experimentName,
    submittedAt: JIAXING_OBSERVE_RUNNING.submittedAt,
    completedAt: JIAXING_OBSERVE_RUNNING.completedAt,
    intro: {
      ...JIAXING_INTRO,
      resultsNote: `实验已完成 · ${jiaxingObserveMeta.startedAt.slice(11)} – ${jiaxingObserveMeta.finishedAt.slice(11)}`,
      results: resultsFromObserveMeta(jiaxingObserveMeta),
    },
    steps: jiaxingObserveSteps,
    observeLog: {
      meta: jiaxingObserveMeta,
      fullLog: jiaxingObserveFullLog,
    },
  };
}

export function getSessionForLab(labId: string): SessionInfo {
  const lab = getLabById(labId);

  if (labId === "lab_fudan_ata") {
    return {
      labId,
      experimentName: FUDAN_OBSERVE_RUNNING.experimentName,
      submittedAt: FUDAN_OBSERVE_RUNNING.submittedAt,
      completedAt: FUDAN_OBSERVE_RUNNING.completedAt,
      intro: ATA_INTRO,
      steps: ATA_STEPS,
    };
  }

  if (labId === "lab_xmu_polymer") {
    return {
      labId,
      experimentName: "光刻胶 / 聚合反应自动化设计",
      submittedAt: "2026-05-22 08:00:00",
      intro: XMU_INTRO,
      steps: XMU_STEPS,
    };
  }

  if (labId === "lab_jiaxing_electrochem") {
    return {
      labId,
      experimentName: "双功能 OER/HER 电催化剂 · 微流控电沉积",
      submittedAt: "2026-05-22 10:30:00",
      intro: JIAXING_INTRO,
      steps: JIAXING_STEPS,
    };
  }

  if (labId === "lab_pujiang_electrochem") {
    return {
      labId,
      experimentName: "电催化材料制备与活性评价实验",
      intro: {
        originalGoal:
          "设计并制备兼具 OER 与 HER 活性的电催化材料，完成活性评价与结果回传。",
        confirmedConditions: [
          "目标：碱性介质双功能电催化剂",
          "评价：LSV、过电位与稳定性",
        ],
        summary:
          "通过自动化电化学工作站完成催化剂沉积与电化学评价，同步记录设备状态与测试数据。",
        objectives: [
          "完成前驱液切换与电化学沉积",
          "采集 OER/HER 极化曲线",
          "输出活性评价报告",
        ],
        equipment: ["电化学工作站", "进液管路系统", "三电极电解池"],
        safetyNotes: ["确认电解液无泄漏", "异常电流或气泡激增立即停机"],
        estimatedDuration: "约 50 分钟",
      },
      steps: [
        {
          id: "pj-ec1",
          title: "前驱液准备",
          description: "切换金属盐前驱液并校验管路",
          status: "done",
          commandType: "fluidics.prepare_precursor",
        },
        {
          id: "pj-ec2",
          title: "电化学沉积",
          description: "按配方完成催化剂沉积",
          status: "active",
          commandType: "electrochem.deposit",
        },
        {
          id: "pj-ec3",
          title: "OER 评价",
          description: "碱性条件下采集 OER 极化曲线",
          status: "pending",
          commandType: "electrochem.oer_lsv",
        },
        {
          id: "pj-ec4",
          title: "HER 评价",
          description: "采集 HER 活性并输出对比结果",
          status: "pending",
          commandType: "electrochem.her_lsv",
        },
      ],
    };
  }

  if (labId === "lab_pujiang_protein_evolution") {
    return {
      labId,
      experimentName: "蛋白质定向进化筛选实验",
      intro: {
        originalGoal:
          "针对目标酶提升热稳定性与催化活性，开展一轮定向进化文库筛选。",
        confirmedConditions: [
          "宿主：大肠杆菌表达系统",
          "筛选：荧光底物活性读数",
        ],
        summary:
          "由自动化平台完成突变文库构建、培养与高通量活性筛选，回传命中变体序列与活性数据。",
        objectives: [
          "完成突变文库构建与转化",
          "自动化培养与诱导表达",
          "高通量活性筛选与测序送样",
        ],
        equipment: ["液体处理工作站", "培养箱", "酶标仪", "PCR 仪"],
        safetyNotes: ["生物样本按规范处置", "培养异常温度立即报警停机"],
        estimatedDuration: "约 90 分钟",
      },
      steps: [
        {
          id: "pj-pe1",
          title: "文库构建",
          description: "按方案完成点突变文库组装与转化",
          status: "done",
          commandType: "molbio.library_build",
        },
        {
          id: "pj-pe2",
          title: "表达培养",
          description: "96 孔板自动化培养与诱导表达",
          status: "active",
          commandType: "incubator.express",
        },
        {
          id: "pj-pe3",
          title: "活性筛选",
          description: "荧光底物高通量活性检测",
          status: "pending",
          commandType: "screen.fluorescence",
        },
        {
          id: "pj-pe4",
          title: "命中确认",
          description: "复测 Top 变体并生成测序清单",
          status: "pending",
          commandType: "screen.hit_confirm",
        },
      ],
    };
  }

  if (labId === "lab_xtalpi_chemistry") {
    return {
      labId,
      experimentName: "AI 驱动小分子合成路线优化",
      intro: {
        originalGoal: "为目标分子设计可执行的自动化合成路线并完成首轮验证。",
        confirmedConditions: ["规模：0.1 mmol", "输出：LC-MS 与转化率"],
        summary:
          "由 AI 生成合成方案，自动化工作站执行固液投料与反应，回传谱图与实验记录。",
        objectives: ["生成并确认合成路线", "自动投料与反应", "样品分析与结果归档"],
        equipment: ["液体处理工作站", "反应模块", "LC-MS"],
        safetyNotes: ["危化品按清单领用", "反应异常温压立即停机"],
        estimatedDuration: "约 70 分钟",
      },
      steps: [
        {
          id: "xt1",
          title: "路线确认",
          description: "确认 AI 推荐反应步骤与试剂清单",
          status: "done",
          commandType: "plan.confirm_route",
        },
        {
          id: "xt2",
          title: "自动投料",
          description: "按步骤完成固液试剂自动加样",
          status: "active",
          commandType: "synth.auto_dose",
        },
        {
          id: "xt3",
          title: "反应执行",
          description: "控温搅拌并记录过程视频",
          status: "pending",
          commandType: "synth.run_reaction",
        },
        {
          id: "xt4",
          title: "样品分析",
          description: "LC-MS 检测并输出转化率报告",
          status: "pending",
          commandType: "analysis.lcms",
        },
      ],
    };
  }

  if (labId === "lab_mgi_genomics") {
    return {
      labId,
      experimentName: "高通量测序文库构建与质控",
      intro: {
        originalGoal: "完成一批样本的测序文库构建并通过质控后上机。",
        confirmedConditions: ["样本数：96", "目标深度：30×"],
        summary:
          "自动化平台完成核酸提取、文库构建、质检与批次记录，回传 Qubit/片段分布等指标。",
        objectives: ["样本核酸质检", "文库构建与纯化", "批次质控与上机准备"],
        equipment: ["核酸提取仪", "建库仪", "片段分析仪", "测序仪"],
        safetyNotes: ["生物样本分区操作", "质控不达标批次隔离"],
        estimatedDuration: "约 120 分钟",
      },
      steps: [
        {
          id: "mg1",
          title: "核酸质检",
          description: "测定浓度与完整性",
          status: "done",
          commandType: "ngs.qc_input",
        },
        {
          id: "mg2",
          title: "文库构建",
          description: "自动化完成末端修复、接头连接与扩增",
          status: "active",
          commandType: "ngs.library_prep",
        },
        {
          id: "mg3",
          title: "文库质控",
          description: "检测片段分布与浓度",
          status: "pending",
          commandType: "ngs.library_qc",
        },
        {
          id: "mg4",
          title: "上机准备",
          description: "稀释定量并生成 Run 单",
          status: "pending",
          commandType: "ngs.sequencing_prep",
        },
      ],
    };
  }

  if (labId === "lab_sjtu_automation") {
    return {
      labId,
      experimentName: "自动化实验流程验证与数据采集",
      intro: {
        originalGoal: "验证远程自动化实验标准流程并采集全过程数据。",
        confirmedConditions: ["实验台：工科自动化演示台", "记录：视频 + 仪器数据"],
        summary:
          "按标准步骤远程下发指令，自动化实验台执行并同步回传视频与测量数据。",
        objectives: ["完成流程联调", "执行标准实验步骤", "归档数据与录像"],
        equipment: ["自动化实验台", "数据采集模块", "视频监控"],
        safetyNotes: ["急停按钮保持可用", "异常步骤立即中止流程"],
        estimatedDuration: "约 45 分钟",
      },
      steps: [
        {
          id: "sj1",
          title: "流程联调",
          description: "校验设备在线与通信链路",
          status: "done",
          commandType: "bench.check_online",
        },
        {
          id: "sj2",
          title: "步骤执行",
          description: "按剧本下发自动化操作指令",
          status: "active",
          commandType: "bench.run_sequence",
        },
        {
          id: "sj3",
          title: "数据采集",
          description: "同步采集传感器与仪器读数",
          status: "pending",
          commandType: "bench.collect_data",
        },
        {
          id: "sj4",
          title: "结果归档",
          description: "生成实验记录并关联视频片段",
          status: "pending",
          commandType: "experiment.submit",
        },
      ],
    };
  }

  return {
    labId,
    experimentName: lab?.workflowTitle ?? "欧姆定律验证实验",
    submittedAt: "2026-05-22 08:00:00",
    intro: OHM_LAW_INTRO,
    steps: [
      {
        id: "s1",
        title: "检查接线",
        description: "按图纸连接 R1、电源与测量通道",
        status: "done",
        commandType: "step.verify_wiring",
      },
      {
        id: "s2",
        title: "接通电源",
        description: "远程下发上电指令，电压上限 5V",
        status: "active",
        commandType: "device.power_on",
      },
      {
        id: "s3",
        title: "测量 R1 电压",
        description: "采集 CH1 读数并截图存档",
        status: "pending",
        commandType: "measure.voltage",
      },
      {
        id: "s4",
        title: "记录与提交",
        description: "填写数据表并关联录像片段",
        status: "pending",
        commandType: "experiment.submit",
      },
    ],
  };
}
