<!-- PRPM_MANIFEST_START -->

<skills_system priority="1">
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills (loaded into main context):
- Use the <path> from the skill entry below
- Invoke: Bash("cat <path>")
- The skill content will load into your current context
- Example: Bash("cat .openskills/backend-architect/SKILL.md")

Usage notes:
- Skills share your context window
- Do not invoke a skill that is already loaded in your context
</usage>

<available_skills>

<skill activation="lazy">
<name>prpm-json-best-practices-skill</name>
<description>Best practices for structuring prpm.json package manifests with required fields, tags, organization, and multi-package management</description>
<path>.openskills/prpm-json-best-practices-skill/SKILL.md</path>
</skill>

</available_skills>
</skills_system>

<!-- PRPM_MANIFEST_END -->
