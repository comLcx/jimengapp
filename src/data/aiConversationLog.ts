export type AiConversationLogEntry = {
  timestamp: string;
  userInput: string;
  aiFinalOutput: string;
  changedFiles: string[];
  verification: string[];
};

export const aiConversationLogEntries: AiConversationLogEntry[] = [
  {
    timestamp: "2026-05-18 16:20:00 CST (+0800)",
    userInput:
      "请先阅读 AGENTS.md 和 docs/candidate-rules.md，然后按其中的答题规范完成后续需求。",
    aiFinalOutput:
      "已阅读两份规范；说明移动端 Demo 结构、双写日志要求与 verify:answer；发现本机缺少 .codex/candidate-session.json，要求候选人先明确提供真实姓名后再运行 codex:init-log；说明本地测试入口 http://127.0.0.1:5173/ 与 http://127.0.0.1:5173/sendtest；尝试运行 node scripts/setup-git-hooks.mjs（本工作区无 .git 已跳过）。",
    changedFiles: [],
    verification: ["本轮无代码改动", "未运行 pnpm verify:answer"],
  },
  {
    timestamp: "2026-05-18 18:50:00 CST (+0800)",
    userInput:
      "候选人提供姓名「廖承旭」，并口述「安排」模块的产品愿景：统一承载待办/日程/提醒等、对话识别与双向生成、合并与详情上下文、隐喻与手动创建、人/时/地呈现与日历总览、完成与自动完成、提醒形态、AI 可介入程度、焦虑与「以后再说」等；要求分版本 MVP 落地。",
    aiFinalOutput:
      "已用 node scripts/ensure-candidate-log.mjs -- --name=廖承旭 初始化个人日志与会话；实现安排模块 V1：底部导航新增「安排」页、本地持久化（localStorage）、手动新建（标题+可选时间）、进行中/已完成切换、完成与恢复，无截止时间红色施压样式；补充需求分层解读与后续迭代建议（对话识别、API Key、合并、日历、以后再说等）。",
    changedFiles: [
      ".codex/candidate-session.json",
      "docs/codex-logs/candidate-廖承旭-laptop-0i5b3eph-86158-20260518T082907-eb8afabe.md",
      "src/App.tsx",
      "src/pages/Home.tsx",
      "src/pages/Schedule.tsx",
      "src/types/schedule.ts",
      "src/hooks/useScheduleItems.ts",
      "src/settings/preferences.ts",
      "src/data/aiConversationLog.ts",
    ],
    verification: ["npm run lint 通过", "npm run build 通过", "node scripts/verify-codex-log.mjs 通过", "node scripts/verify-answer-standard.mjs 通过"],
  },
];
