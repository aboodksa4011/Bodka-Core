import { bodkaEmbed, truncate } from "./embeds.js";

const API = "https://api.github.com";

export class GitHubService {
  constructor(repo = process.env.GITHUB_REPO || "aboodksa4011/Bodka-Core") {
    this.repo = repo;
    this.token = process.env.GITHUB_TOKEN || "";
    this.createIssues = String(process.env.CREATE_GITHUB_ISSUES || "false").toLowerCase() === "true";
  }

  headers(extra = {}) {
    return {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Bodka-Official-Discord-Bot",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...extra,
    };
  }

  async request(path, options = {}) {
    const res = await fetch(`${API}/repos/${this.repo}${path}`, {
      ...options,
      headers: this.headers(options.headers || {}),
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GitHub API ${res.status}: ${text.slice(0, 300)}`);
    }

    if (res.status === 204) return {};
    return res.json();
  }

  async snapshot() {
    const [repo, commits, release, pulls, issues, runs] = await Promise.all([
      this.request(""),
      this.request("/commits?per_page=1"),
      this.request("/releases/latest"),
      this.request("/pulls?state=open&sort=updated&direction=desc&per_page=5"),
      this.request("/issues?state=open&sort=updated&direction=desc&per_page=10"),
      this.request("/actions/runs?per_page=1"),
    ]);

    const cleanIssues = (issues || []).filter((x) => !x.pull_request).slice(0, 5);
    return {
      repo,
      commit: commits?.[0] || null,
      release,
      pulls: pulls || [],
      issues: cleanIssues,
      run: runs?.workflow_runs?.[0] || null,
    };
  }

  async createBugIssue({ title, body, reporter }) {
    if (!this.token || !this.createIssues) return null;
    return this.request("/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `[Discord] ${title}`,
        body: `${body}\n\n---\nمرسل من Discord بواسطة: ${reporter}`,
      }),
    });
  }

  statusEmbed(snapshot) {
    const { repo, commit, release, pulls, issues, run } = snapshot;
    const embed = bodkaEmbed("حالة مشروع Bodka Core", "قراءة مباشرة من GitHub.");

    if (repo) {
      embed.addFields({
        name: "المستودع",
        value: `[${repo.full_name}](${repo.html_url}) • ⭐ ${repo.stargazers_count ?? 0} • 🍴 ${repo.forks_count ?? 0}`,
      });
    }

    if (commit) {
      embed.addFields({
        name: "آخر Commit",
        value: `[\`${commit.sha.slice(0, 7)}\`](${commit.html_url}) ${truncate(commit.commit?.message?.split("\n")[0], 160)}`,
      });
    }

    embed.addFields({
      name: "Pull Requests المفتوحة",
      value: String(pulls?.length ?? 0),
      inline: true,
    });

    embed.addFields({
      name: "Issues المفتوحة الظاهرة",
      value: String(issues?.length ?? 0),
      inline: true,
    });

    if (release) {
      embed.addFields({
        name: "آخر إصدار",
        value: `[${release.name || release.tag_name}](${release.html_url})`,
      });
    } else {
      embed.addFields({ name: "آخر إصدار", value: "لا يوجد GitHub Release منشور حاليًا." });
    }

    if (run) {
      const state = run.status === "completed" ? (run.conclusion || "completed") : run.status;
      embed.addFields({
        name: "آخر GitHub Actions",
        value: `[${run.name}](${run.html_url}) • **${state}**`,
      });
    }

    return embed;
  }
}

export function startGitHubMonitor(github, channels, roles) {
  const intervalSeconds = Math.max(60, Number(process.env.GITHUB_POLL_SECONDS || 90));
  let previous = null;

  async function tick() {
    try {
      const current = await github.snapshot();
      if (!previous) {
        previous = current;
        return;
      }

      const githubChannel = channels.get("github");
      const buildChannel = channels.get("builds");
      const releaseChannel = channels.get("releases");

      if (current.commit?.sha && previous.commit?.sha && current.commit.sha !== previous.commit.sha && githubChannel) {
        const pingRole = roles.get("githubPing");
        const ping = pingRole ? `<@&${pingRole.id}> ` : "";
        const e = bodkaEmbed("Commit جديد على GitHub")
          .setDescription(`[${current.commit.sha.slice(0, 7)}](${current.commit.html_url}) • ${truncate(current.commit.commit?.message?.split("\n")[0], 250)}`);
        await githubChannel.send({ content: ping, embeds: [e], allowedMentions: { roles: pingRole ? [pingRole.id] : [] } });
      }

      if (current.release?.id && current.release.id !== previous.release?.id && releaseChannel) {
        const pingRole = roles.get("releasePing");
        const ping = pingRole ? `<@&${pingRole.id}> ` : "";
        const e = bodkaEmbed("إصدار جديد من Bodka Core")
          .setDescription(`[${current.release.name || current.release.tag_name}](${current.release.html_url})\n${truncate(current.release.body || "بدون وصف.", 1200)}`);
        await releaseChannel.send({ content: ping, embeds: [e], allowedMentions: { roles: pingRole ? [pingRole.id] : [] } });
      }

      if (current.run?.id && current.run.id !== previous.run?.id && buildChannel) {
        const pingRole = roles.get("buildPing");
        const ping = pingRole ? `<@&${pingRole.id}> ` : "";
        const state = current.run.status === "completed" ? current.run.conclusion : current.run.status;
        const e = bodkaEmbed("تحديث حالة البناء")
          .setDescription(`[${current.run.name}](${current.run.html_url}) • **${state || "غير معروف"}**`);
        await buildChannel.send({ content: ping, embeds: [e], allowedMentions: { roles: pingRole ? [pingRole.id] : [] } });
      }

      const newestPr = current.pulls?.[0];
      const oldPr = previous.pulls?.[0];
      if (newestPr?.id && newestPr.id !== oldPr?.id && channels.get("prs")) {
        await channels.get("prs").send({
          embeds: [bodkaEmbed("Pull Request جديد أو محدث").setDescription(`[#${newestPr.number} ${truncate(newestPr.title, 180)}](${newestPr.html_url})`)],
        });
      }

      const newestIssue = current.issues?.[0];
      const oldIssue = previous.issues?.[0];
      if (newestIssue?.id && newestIssue.id !== oldIssue?.id && channels.get("issues")) {
        await channels.get("issues").send({
          embeds: [bodkaEmbed("Issue جديد أو محدث").setDescription(`[#${newestIssue.number} ${truncate(newestIssue.title, 180)}](${newestIssue.html_url})`)],
        });
      }

      previous = current;
    } catch (error) {
      console.error("[GitHub Monitor]", error.message);
    }
  }

  tick();
  return setInterval(tick, intervalSeconds * 1000);
}
