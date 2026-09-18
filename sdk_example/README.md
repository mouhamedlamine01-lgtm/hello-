# Exemple multi-agents (Claude Agent SDK)

Ce dossier montre comment definir des sous-agents en code avec le
Claude Agent SDK, en miroir des sous-agents Claude Code definis dans
`.claude/agents/` a la racine du depot :

| Sous-agent      | Fichier Claude Code                 | Equivalent SDK          |
|------------------|--------------------------------------|--------------------------|
| `researcher`     | `.claude/agents/researcher.md`       | `AGENTS["researcher"]`   |
| `code-reviewer`  | `.claude/agents/code-reviewer.md`    | `AGENTS["code-reviewer"]`|

## Difference entre les deux approches

- **`.claude/agents/*.md`** : config lue par le CLI Claude Code. Aucun
  code a ecrire, les sous-agents sont disponibles des que le fichier
  existe.
- **`multi_agent.py`** : un vrai programme independant qui pilote sa
  propre boucle agentique via le SDK. Utile pour integrer ce pattern
  dans une application, un service ou un pipeline en dehors de Claude
  Code.

## Lancer l'exemple

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...
python multi_agent.py "Cherche comment le login est implemente"
```
