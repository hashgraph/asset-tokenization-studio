#!/usr/bin/env bash
# Self-heal Claude Code skill wiring from .agents/skills/ into .claude/.
# Idempotent — safe to run on every `npm install` via the prepare hook.
set -euo pipefail

[[ -d .agents/skills ]] || exit 0

mkdir -p .claude/commands .claude/skills

shopt -s nullglob
for skill_dir in .agents/skills/*/; do
  [[ -f "${skill_dir}SKILL.md" ]] || continue
  name="$(basename "$skill_dir")"
  ln -sfn "../../.agents/skills/${name}/SKILL.md" ".claude/commands/${name}.md"
  ln -sfn "../../.agents/skills/${name}"          ".claude/skills/${name}"
done
