import { Fragment } from "react";
import { HallStatIcon } from "../components/HallStatIcon";
import { LabCard } from "../components/LabCard";
import { PageContainer } from "../components/PageContainer";
import { computeHallStats, labs, type HallStats } from "../data/mock";
import { LAB_MEANING_INTRO } from "../data/meaning";

const ALWAYS_VISIBLE_STATS = new Set<keyof HallStats>(["total", "scenarios", "queued", "completed"]);

type HallStatTone = "busy" | "idle" | "warn" | "muted" | "queued" | "completed" | "scenario";

const HALL_STAT_GROUPS: {
  id: "scenario" | "lab" | "task";
  items: { key: keyof HallStats; label: string; tone?: HallStatTone }[];
}[] = [
  {
    id: "scenario",
    items: [{ key: "scenarios", label: "实验场景", tone: "scenario" }],
  },
  {
    id: "lab",
    items: [
      { key: "total", label: "实验室" },
      { key: "idle", label: "空闲", tone: "idle" },
      { key: "maintenance", label: "维护中", tone: "warn" },
      { key: "offline", label: "离线", tone: "muted" },
    ],
  },
  {
    id: "task",
    items: [
      { key: "queued", label: "排队中", tone: "queued" },
      { key: "completed", label: "已完成", tone: "completed" },
    ],
  },
];

const homeLabs = (() => {
  const orderedLabs = [...labs];
  const fudanIndex = orderedLabs.findIndex((lab) => lab.id === "lab_fudan_ata");
  const jiaxingIndex = orderedLabs.findIndex((lab) => lab.id === "lab_jiaxing_electrochem");

  if (fudanIndex >= 0 && jiaxingIndex >= 0) {
    [orderedLabs[fudanIndex], orderedLabs[jiaxingIndex]] = [
      orderedLabs[jiaxingIndex],
      orderedLabs[fudanIndex],
    ];
  }

  return orderedLabs;
})();

function shouldShowHallStat(key: keyof HallStats, value: number): boolean {
  return ALWAYS_VISIBLE_STATS.has(key) || value > 0;
}

export function HomePage() {
  const hallStats = computeHallStats(labs);
  const visibleGroups = HALL_STAT_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(({ key }) => shouldShowHallStat(key, hallStats[key])),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="home-page">
      <PageContainer wide className="page-section page-section--header">
        <header className="surface surface--hero home-header">
          <h1 className="page-heading">智慧实验室</h1>
          <p className="home-intro">{LAB_MEANING_INTRO}</p>
        </header>
      </PageContainer>

      <PageContainer wide className="page-section">
        <section id="labs" className="surface surface--labs" aria-labelledby="labs-heading">
          <div className="section-head">
            <div>
              <h2 id="labs-heading" className="section-title section-title--lg">
                实验室大厅
              </h2>
              <p className="section-sub">查看实验室状态与实验过程</p>
            </div>
            <div className="section-head-stats" aria-label="实验室统计">
              {visibleGroups.map((group, groupIndex) => (
                <Fragment key={group.id}>
                  {groupIndex > 0 ? (
                    <div className="section-head-stats-divider" aria-hidden="true" />
                  ) : null}
                  <div className="section-head-stat-group">
                    {group.items.map(({ key, label, tone }) => {
                      const value = hallStats[key];
                      return (
                        <div
                          key={key}
                          className={`section-stat${tone ? ` section-stat--${tone}` : ""}`}
                        >
                          <span className="section-stat-icon">
                            <HallStatIcon stat={key} />
                          </span>
                          <div className="section-stat-body">
                            <span className="section-stat-value">{value}</span>
                            <span className="section-stat-label">{label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>

          <div className="lab-grid">
            {homeLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
