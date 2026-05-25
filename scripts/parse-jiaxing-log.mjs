#!/usr/bin/env node
/**
 * 解析嘉兴电化学实验日志 → web-console/src/data/jiaxingDeviceStream.json
 * 用法: node scripts/parse-jiaxing-log.mjs [日志路径]
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logPath =
  process.argv[2] ?? "/Users/huangrong/Downloads/电催化-实验日志-完整的1次";
const outPath = resolve(__dirname, "../web-console/src/data/jiaxingDeviceStream.json");

const lines = readFileSync(logPath, "utf-8").split(/\r?\n/);

const startIdx = lines.findIndex((l) => l.includes(">>> 任务已加入实验队列"));
const endIdx = lines.findIndex(
  (l, i) => i > startIdx && l.includes("执行完毕") && l.includes("api_output")
);

if (startIdx < 0 || endIdx < 0) {
  console.error("未找到完整实验区间（入队 → 执行完毕）");
  process.exit(1);
}

/** 在实验区间内查找首个匹配行号 */
function findLine(substr, from = startIdx) {
  for (let i = from; i <= endIdx; i++) {
    if (lines[i].includes(substr)) return i;
  }
  return endIdx;
}

function parseTs(line) {
  const m = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  return m ? m[1] : "";
}

function deviceCategory(msg) {
  for (const dev of [
    "下料电机",
    "推料电机",
    "升降电机",
    "平移电机",
    "步进电机",
    "电动阀",
    "振动电机",
    "电爪",
  ]) {
    if (msg.includes(dev)) return dev;
  }
  if (msg.includes("泵")) return "蠕动泵组";
  if (/恒电流|lsv|LSV/i.test(msg)) return "电化学工作站";
  if (/加水|清洗|KOH/.test(msg)) return "液路系统";
  return "自动化平台";
}

function extractEvents(i0, i1) {
  const evs = [];
  for (let i = i0; i <= i1; i++) {
    const line = lines[i];
    if (line.includes("127.0.0.1") || line.includes("UserWarning")) continue;
    const m = line.match(/ - INFO - (.+)$/);
    if (!m) continue;
    const msg = m[1].trim();
    if (msg.startsWith("收到查询")) continue;
    evs.push({
      timestamp: parseTs(line),
      message: msg,
      device: deviceCategory(msg),
    });
  }
  const deduped = [];
  for (const e of evs) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.message === e.message && prev.timestamp === e.timestamp) continue;
    deduped.push(e);
  }
  return deduped;
}

/** 阶段定义：按日志里程碑自动定位行号 */
const phaseDefs = [
  { id: "step_queue", title: "任务入队", marker: ">>> 任务已加入" },
  { id: "step_feed", title: "取料与下料", marker: "已经推出镍片" },
  { id: "step_pick", title: "夹取样品", marker: "已经夹取镍片" },
  { id: "step_transfer", title: "测试位就位", marker: "已经到达测试位" },
  { id: "step_fill", title: "电解液加液", marker: "所有泵已加液完成" },
  { id: "step_deposit", title: "恒电流沉积", marker: "恒电流沉积已完成" },
  { id: "step_rinse1", title: "第一次水洗", marker: "第一次加水已完成" },
  { id: "step_rinse2", title: "第二次水洗", marker: "第二次加水已完成" },
  { id: "step_clean", title: "沉积液清洗", marker: "沉积液清洗完成" },
  { id: "step_koh", title: "KOH 加液", marker: "KOH已加液完成" },
  { id: "step_lsv", title: "LSV 测试", marker: "第 1 次lsv测试已完成" },
  { id: "step_discard", title: "丢弃样品", marker: "已经丢弃镍片" },
  { id: "step_finalize", title: "批后清洗收尾", marker: "清洗完成" },
  { id: "step_done", title: "任务完成", marker: "执行完毕" },
];

const boundaries = phaseDefs.map((p) => ({
  ...p,
  line: findLine(p.marker),
}));

// 去重：同一 marker 多次出现时，仅保留第一次（主流程）
const seen = new Set();
const milestones = boundaries.filter((b) => {
  const key = b.marker;
  if (seen.has(key) && /加水已完成|清洗完成/.test(key)) return false;
  seen.add(key);
  return true;
});

// 批后清洗：第二次「第一次加水」在丢弃之后
const discardLine = findLine("已经丢弃镍片");
const postRinse1 = findLine("第一次加水已完成", discardLine + 1);
if (postRinse1 > discardLine && postRinse1 < endIdx) {
  const postRinse2 = findLine("第二次加水已完成", postRinse1 + 1);
  const postClean = findLine("清洗完成", postRinse2 + 1);
  const finalizeIdx = milestones.findIndex((m) => m.id === "step_finalize");
  if (finalizeIdx >= 0) {
    milestones[finalizeIdx] = {
      ...milestones[finalizeIdx],
      line: postClean > postRinse2 ? postClean : findLine("清洗完成", discardLine + 1),
      title: "批后清洗收尾",
    };
  }
}

const steps = [];
const fullLog = [];

for (let j = 0; j < milestones.length; j++) {
  const { id, title, line: endLine } = milestones[j];
  const startLine = j > 0 ? milestones[j - 1].line : startIdx;
  const evs = extractEvents(startLine, endLine);
  for (const e of evs) {
    e.phaseId = id;
    e.phaseTitle = title;
    fullLog.push(e);
  }
  steps.push({
    id,
    title,
    description: evs.length ? evs[evs.length - 1].message : title,
    status: "done",
    commandType: id,
    events: evs,
  });
}

const queueMatch = lines[startIdx].match(/任务已加入实验队列: (\[.+?\])/);
let queue = [];
if (queueMatch) {
  try {
    queue = JSON.parse(queueMatch[1].replace(/'/g, '"'));
  } catch {
    queue = [];
  }
}

const doneMsg = lines[endIdx].match(/ - INFO - (.+)$/)?.[1] ?? "";
const resultsMatch = doneMsg.match(/api_output\/[^'\]]+/g);

const meta = {
  startedAt: parseTs(lines[startIdx]),
  finishedAt: parseTs(lines[endIdx]),
  queue,
  totalEvents: fullLog.length,
  logSource: logPath.split("/").pop() ?? "实验日志",
  experimentLabel: "电催化沉积 · 完整单次实验",
  results: resultsMatch ?? [],
};

writeFileSync(outPath, JSON.stringify({ meta, steps, fullLog }, null, 2), "utf-8");
console.log(`Wrote ${outPath}`);
console.log(meta);
for (const s of steps) console.log(`  ${s.title}: ${s.events.length} 条`);
