#!/usr/bin/env node
/**
 * 解析厦门大学干实验文档 → web-console/src/data/xmuDeviceStream.json
 * 用法: node scripts/parse-xmu-docx.mjs [厦大.docx路径]
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docxPath = process.argv[2] ?? "/Users/huangrong/Downloads/厦大.docx";
const outPath = resolve(__dirname, "../web-console/src/data/xmuDeviceStream.json");

const script = `
import zipfile, json, re
from pathlib import Path
from xml.etree import ElementTree as ET
from datetime import datetime, timedelta

docx = Path(${JSON.stringify(docxPath)})
with zipfile.ZipFile(docx) as z:
    xml = z.read('word/document.xml')
root = ET.fromstring(xml)
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
paras = []
for para in root.iter(f'{W}p'):
    texts = [t.text or '' for t in para.iter(f'{W}t')]
    line = ''.join(texts)
    if line.strip():
        paras.append(line)

def strip_json_prefix(s):
    s = s.strip()
    if s.startswith('JSONcurl'):
        m = re.search(r'(\\{.*\\})\\s*$', s, re.DOTALL)
        return m.group(1) if m else s[4:]
    if s.startswith('JSON'):
        return s[4:].strip()
    return s

def parse_iso(ts):
    return ts.replace('T', ' ')[:19]

def human_instruction(cmd):
    if not cmd.startswith('S '):
        return '实验平台', cmd
    body = cmd[2:].strip()
    m = re.match(r'(\\w+)\\((.*)\\)', body)
    if not m:
        return '反应器1', body
    name, args = m.group(1), m.group(2)
    parts = [a.strip() for a in args.split(',')]
    labels = {
        'START_STIR': ('反应器1', lambda p: f'启动搅拌 · {p[1]} rpm'),
        'REACTOR_SOLUTION_ADD': ('反应器1', lambda p: f'加液 · 通道 {p[0]} · {p[1]} ml'),
        'REACTOR_N2_ON': ('反应器1', lambda p: '开启 N₂ 保护'),
        'REACTOR_N2_OFF': ('反应器1', lambda p: '关闭 N₂ 保护'),
        'REACTOR_AIR_ON': ('反应器1', lambda p: '切换至空气氛围'),
        'REACTOR_AIR_OFF': ('反应器1', lambda p: '关闭空气进气'),
        'TEMP_SET': ('反应器1', lambda p: f'设定温度 · {p[1]} ℃'),
        'WAIT': ('工艺流程', lambda p: f'等待 · {int(float(p[0]))} s'),
    }
    if name in labels:
        dev, fn = labels[name]
        try:
            return dev, fn(parts)
        except Exception:
            return '反应器1', body
    return '反应器1', body

ins_data = json.loads(strip_json_prefix(paras[4]))
instructions = ins_data['instructions']
exec_resp = json.loads(strip_json_prefix(paras[7]))
status_resps = [json.loads(strip_json_prefix(paras[10])), json.loads(strip_json_prefix(paras[12])), json.loads(strip_json_prefix(paras[14]))]

started = '2026-05-22 08:10:00'
finished = parse_iso(status_resps[-1].get('generated_at', '2026-05-22T08:24:11.034409'))
full_log = []

def add(ts, device, message, phase_id, phase_title):
    full_log.append({'timestamp': ts, 'message': message, 'device': device, 'phaseId': phase_id, 'phaseTitle': phase_title})

add('2026-05-22 08:10:00', 'API网关', 'POST /api/v1/experiment/generate · request_id=test-008', 'step_generate', '实验方案生成')
add('2026-05-22 08:10:01', '实验平台', '实验方案：1号反应器 · 二氧六环 10.0 ml · AIBME/二氧六环 4.2 ml · 70 ℃ · 12 h', 'step_generate', '实验方案生成')
add(parse_iso(ins_data['timestamp']), '指令解析', ins_data['message'], 'step_parse', '干实验指令转换')
add('2026-05-22 08:10:04', '指令解析', f'已生成本地控制指令 {len(instructions)} 条', 'step_parse', '干实验指令转换')
add(parse_iso(exec_resp['timestamp']), 'API网关', 'POST /api/v1/experiment/execute · EXECUTE_PROCESS_FILE', 'step_execute', '指令输入/执行')
add(parse_iso(exec_resp['timestamp']), '工艺流程', exec_resp['message'], 'step_execute', '指令输入/执行')
udp = exec_resp.get('udp_ack') or {}
if udp.get('message'):
    add(parse_iso(exec_resp['timestamp']), '工艺流程', udp['message'], 'step_execute', '指令输入/执行')

for st in status_resps:
    ts = parse_iso(st.get('generated_at', '2026-05-22 08:11:17'))
    detail = st.get('detail', '')
    status = st.get('status', '')
    cmd = st.get('current_command', '')
    msg = f'GET /status · {status}'
    if detail:
        msg += f' · {detail}'
    add(ts, '状态服务', msg, 'step_poll', '状态轮询')
    if cmd:
        add(ts, '反应器1', f'当前指令 · {cmd}', 'step_poll', '状态轮询')

t0 = datetime(2026, 5, 22, 8, 11, 20)
t1 = datetime(2026, 5, 22, 8, 23, 50)
total_sec = (t1 - t0).total_seconds()
for idx, ins in enumerate(instructions):
    frac = idx / max(1, len(instructions) - 1)
    t = t0 + timedelta(seconds=total_sec * frac)
    ts = t.strftime('%Y-%m-%d %H:%M:%S')
    dev, msg = human_instruction(ins)
    add(ts, dev, msg, 'step_run', '工艺流程执行')

add(finished, '状态服务', 'GET /status · success · 流程已结束', 'step_poll', '状态轮询')
add(finished, '实验平台', '实验 test-008 执行完毕', 'step_done', '任务完成')

phases = [
    ('step_generate', '实验方案生成', 'done'),
    ('step_parse', '干实验指令转换', 'done'),
    ('step_execute', '指令输入/执行', 'done'),
    ('step_poll', '状态轮询', 'done'),
    ('step_run', '工艺流程执行', 'active'),
    ('step_done', '任务完成', 'pending'),
]
steps = []
for pid, title, status in phases:
    evs = [e for e in full_log if e['phaseId'] == pid]
    cap = evs if pid != 'step_run' else (evs[:8] + evs[-4:] if len(evs) > 12 else evs)
    steps.append({
        'id': pid,
        'title': title,
        'description': evs[-1]['message'] if evs else title,
        'status': status,
        'commandType': pid,
        'events': [{'timestamp': e['timestamp'], 'message': e['message'], 'device': e['device']} for e in cap],
    })

out = {
    'meta': {
        'startedAt': started,
        'finishedAt': finished,
        'queue': ['test-008'],
        'totalEvents': len(full_log),
        'logSource': '厦大.docx · 干实验',
        'experimentLabel': '光刻胶聚合 · 1号反应器干实验',
        'requestId': 'test-008',
        'results': ['process_output/test-008_20260522'],
    },
    'steps': steps,
    'fullLog': [{'timestamp': e['timestamp'], 'message': e['message'], 'device': e['device']} for e in full_log],
}
print(json.dumps(out, ensure_ascii=False))
`;

const json = execSync(`python3 -c ${JSON.stringify(script)}`, { encoding: "utf-8" });
writeFileSync(outPath, json);
console.log(`Wrote ${outPath}`);
