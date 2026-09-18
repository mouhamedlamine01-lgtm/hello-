"""
Exemple d'orchestrateur multi-agents avec le Claude Agent SDK.

Reprend les memes profils que .claude/agents/el-professor.md et
.claude/agents/code-reviewer.md, mais definis en code plutot qu'en
fichiers Markdown. Un agent principal peut deleguer a l'un des deux
sous-agents selon la tache.

Usage:
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY=...
    python multi_agent.py "Cherche comment le login est implemente"
"""

import anyio
import sys

from claude_agent_sdk import (
    AgentDefinition,
    ClaudeAgentOptions,
    query,
)

AGENTS = {
    "El Professor": AgentDefinition(
        description="Recherche des informations dans le code ou sur le web, sans rien modifier.",
        prompt=(
            "Tu es un agent de recherche. Explore le code ou le web pour "
            "repondre a la question posee. Ne modifie jamais de fichiers. "
            "Resume tes resultats avec fichier:ligne ou les sources trouvees."
        ),
        tools=["Read", "Grep", "Glob", "WebSearch", "WebFetch"],
        model="sonnet",
    ),
    "code-reviewer": AgentDefinition(
        description="Relit un diff ou des fichiers modifies pour trouver des bugs ou failles.",
        prompt=(
            "Tu es un agent de relecture de code. Analyse les changements "
            "fournis sans les modifier. Cherche en priorite les bugs et "
            "failles de securite, puis la qualite. Rends une liste concise "
            "classee par gravite avec fichier:ligne."
        ),
        tools=["Read", "Grep", "Glob", "Bash"],
        model="sonnet",
    ),
}


async def main(prompt: str) -> None:
    options = ClaudeAgentOptions(
        agents=AGENTS,
        system_prompt=(
            "Tu es l'agent principal. Delegue au sous-agent 'El Professor' "
            "pour explorer/chercher, et au sous-agent 'code-reviewer' pour "
            "relire du code deja modifie. Termine par une reponse synthetique."
        ),
    )

    async for message in query(prompt=prompt, options=options):
        print(message)


if __name__ == "__main__":
    task = " ".join(sys.argv[1:]) or "Explique le contenu de ce depot."
    anyio.run(main, task)
