# Brand Compliance Audit

You are running an automated Brand Compliance Audit on a Walmart Interface Extension.

Base: appQEoIBTyXXXN5q8
Your agent ID: chris-claude-code (running on behalf of brand audit)

## Step 1: Read the skill prompt

Fetch the Brand Compliance Audit skill record to get the audit criteria:

```bash
curl -s "https://api.airtable.com/v0/appQEoIBTyXXXN5q8/tblAquuYVNaacMpzJ/recZebvN1PI8HRGcm" \
  -H "Authorization: Bearer $AIRTABLE_PAT" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(d['fields'].get('Prompt Fragment','(no prompt fragment found)'))
"
```

## Step 2: Read the source files

```bash
find . -name '*.js' -o -name '*.tsx' -o -name '*.ts' | grep -v node_modules | grep -v '.min.' | head -20
```

Read the relevant frontend component files — focus on anything rendering UI, colors, text, or logos.

## Step 3: Run the audit

Apply the Brand Compliance Audit criteria from Step 1 against the code from Step 2.

Check at minimum:
- **Colors**: exact hex values — Walmart Blue #0071CE, Spark Yellow #FFC220. Flag any off-brand blues or yellows.
- **Typography**: EverydaySans font referenced where applicable. Flag if generic system fonts used for brand headers.
- **Language**: associates not employees. Flag any instance of "employees", "workers", "staff".
- **Tone**: no consultant-speak ("leverage", "synergize", "utilize"). Flag instances.
- **Spark logo**: if used, must use official SVG/PNG from brand assets. Flag any recreated or placeholder sparks.

Format each finding as one of:
- `PASS` — criterion met
- `FLAG` — violation found (include file:line and exact value)
- `SUGGEST` — not a violation but worth improving

## Step 4: Write findings to Session Queue

```bash
TODAY=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
REPO=$(basename $(git remote get-url origin) .git)

curl -s -X POST "https://api.airtable.com/v0/appQEoIBTyXXXN5q8/tbloJIF3rfDPzj09p" \
  -H "Authorization: Bearer $AIRTABLE_PAT" \
  -H "Content-Type: application/json" \
  -d "{
    \"records\": [{
      \"fields\": {
        \"Title\": \"Brand Compliance Audit — $REPO — $(date +%Y-%m-%d)\",
        \"Type\": \"QUESTION\",
        \"Status\": \"Ready\",
        \"To\": \"bennett\",
        \"Author\": \"chris-claude-code\",
        \"Content\": \"[INSERT FULL AUDIT FINDINGS HERE — replace this placeholder with actual findings from Step 3, formatted with PASS/FLAG/SUGGEST per criterion]\",
        \"Shipped At\": \"$TODAY\"
      }
    }],
    \"typecast\": true
  }" | python3 -c "import json,sys; d=json.load(sys.stdin); print('QUESTION created:', d['records'][0]['id'])"
```

Replace `[INSERT FULL AUDIT FINDINGS HERE]` with your actual audit output before running the curl.

If there are zero violations, set Content to: "Brand Compliance Audit PASSED — no violations found in $REPO on $(date +%Y-%m-%d)."
