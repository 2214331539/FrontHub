import json,pathlib
from urllib.parse import urlsplit
root=pathlib.Path(__file__).resolve().parents[1]
rows=[]; cat=None; seen=set(); ids=set()
metadata_path=root/'tools/catalog-meta.json'
metadata=json.loads(metadata_path.read_text(encoding='utf-8')) if metadata_path.exists() else {}
for line_number,l in enumerate((root/'tools/catalog.txt').read_text(encoding='utf-8').splitlines(),1):
 l=l.strip()
 if not l: continue
 if l.startswith('# '):cat=l[2:].strip();continue
 parts=l.split('|')
 if len(parts)!=4 or not cat: raise ValueError(f'Invalid catalog row {line_number}: {l}')
 name,url,tags,summary=parts
 parsed=urlsplit('https://'+url)
 normalized=parsed.hostname.removeprefix('www.').lower()+parsed.path.rstrip('/')
 identifier=url.replace('/','_').replace('.','_').lower()
 if normalized in seen or identifier in ids: raise ValueError(f'Duplicate catalog row {line_number}: {url}')
 if not all(parts) or not parsed.hostname or parsed.query or parsed.fragment or parsed.username: raise ValueError(f'Invalid catalog URL at row {line_number}: {url}')
 seen.add(normalized);ids.add(identifier)
 row={'id':identifier,'name':name,'url':'https://'+url,'domain':parsed.hostname,'category':cat,'tags':tags.split(','),'summary':summary}
 row.update({k:v for k,v in metadata.get(identifier,{}).items() if k in ['addedAt','reviewedAt','referenceUrl','batchId','kind']})
 if row.get('kind','homepage') not in ['homepage','template','docs','visualization','app','experiment','collection']: raise ValueError(f'Invalid resource kind: {identifier}')
 rows.append(row)
official={
'Twenty':'https://github.com/twentyhq/twenty/tree/main/packages/twenty-website',
'Unkey':'https://github.com/unkeyed/marketing-site',
'Outline':'https://github.com/outline/website',
'Payload':'https://github.com/payloadcms/website',
'Plausible':'https://github.com/plausible/website',
'Novu':'https://github.com/novuhq/website',
}
product={
'Obsidian':'https://github.com/obsidianmd/obsidian-releases',
'Zotero':'https://github.com/zotero/zotero',
'AFFiNE':'https://github.com/toeverything/AFFiNE',
'Anytype':'https://github.com/anyproto/anytype-ts',
'Logseq':'https://github.com/logseq/logseq',
'Hugging Face':'https://github.com/huggingface',
'Dify':'https://github.com/langgenius/dify',
'LangChain':'https://github.com/langchain-ai/langchain',
'Flowise':'https://github.com/FlowiseAI/Flowise',
'AnythingLLM':'https://github.com/Mintplex-Labs/anything-llm',
'Ollama':'https://github.com/ollama/ollama',
'Supabase':'https://github.com/supabase/supabase',
'GitLab':'https://gitlab.com/gitlab-org/gitlab',
'PostHog':'https://github.com/PostHog/posthog',
'Trigger.dev':'https://github.com/triggerdotdev/trigger.dev',
'Inngest':'https://github.com/inngest/inngest',
'Better Auth':'https://github.com/better-auth/better-auth',
'Tailscale':'https://github.com/tailscale/tailscale',
'Warp':'https://github.com/warpdotdev',
'Zed':'https://github.com/zed-industries/zed',
'Bun':'https://github.com/oven-sh/bun',
'Deno':'https://github.com/denoland/deno',
'Astro':'https://github.com/withastro/astro',
'Next.js':'https://github.com/vercel/next.js',
'Svelte':'https://github.com/sveltejs/svelte',
'Nuxt':'https://github.com/nuxt/nuxt',
'Tailwind CSS':'https://github.com/tailwindlabs/tailwindcss',
'shadcn/ui':'https://github.com/shadcn-ui/ui',
'Strapi':'https://github.com/strapi/strapi',
'OpenStatus':'https://github.com/openstatusHQ/openstatus',
'Medusa':'https://github.com/medusajs/medusa',
'Umami':'https://github.com/umami-software/umami',
'Langfuse':'https://github.com/langfuse/langfuse',
'Excalidraw':'https://github.com/excalidraw/excalidraw',
'tldraw':'https://github.com/tldraw/tldraw',
'Plane':'https://github.com/makeplane/plane',
'n8n':'https://github.com/n8n-io/n8n',
'Cal.com':'https://github.com/calcom/cal.com',
'Khan Academy':'https://github.com/Khan/khan-exercises',
'GeoGebra':'https://github.com/geogebra',
'Moodle':'https://github.com/moodle/moodle',
'Open edX':'https://github.com/openedx/edx-platform',
'Dub':'https://github.com/dubinc/dub',
'Buffer':'https://github.com/bufferapp',
'Polar':'https://github.com/polarsource/polar',
'Raindrop.io':'https://github.com/raindropio',
}
featured=['Linear','Raycast','Craft','Vercel','Cursor','Figma','Framer','Stripe','Perplexity','Readwise','Twenty','Unkey','Outline','Payload','Granola','Elicit','Obsidian','Zed','Screen Studio','Railway','Resend','Teenage Engineering','Plausible','Dub','Nothing','Attio','ResearchRabbit','Tana','PostHog','Supabase','Anthropic','Physical Intelligence','BitMiracle','Awwwards']
for i,x in enumerate(rows):
 n=x['name']
 if n in official:x['source']={'type':'website','url':official[n]}
 elif n in product:x['source']={'type':'product','url':product[n]}
 else:x['source']={'type':'unknown','url':''}
 source=metadata.get(x['id'],{}).get('source')
 if source:
  if source.get('type') not in ['website','product'] or urlsplit(source.get('url','')).scheme != 'https': raise ValueError(f'Invalid source: {x["id"]}')
  x['source']=source
 x['featured']=n in featured
 x['rank']=featured.index(n) if n in featured else 500+i
# manual art themes
colors={
'Linear':['#0c0d11','#9c94fc','#e1defb'], 'Raycast':['#120d15','#f74d5e','#f5dfe5'],
'Craft':['#f5f2ea','#db875e','#292621'],'Vercel':['#050505','#ffffff','#bebebe'],
'Cursor':['#131816','#d8dcce','#f6f5ee'],'Figma':['#f2ede9','#f05445','#171717'],
'Framer':['#0d101a','#9b6af8','#ffffff'],'Stripe':['#edf0ff','#665fff','#171c56'],
'Perplexity':['#f9f7f1','#248a8e','#141e1e'],'Readwise':['#fbf8f3','#f39a51','#272322'],
'Twenty':['#f8fafc','#26272d','#5a6983'],'Unkey':['#0c0c11','#e7d3ff','#f3f2f8'],
'Outline':['#f8f8f7','#4388ea','#303139'],'Payload':['#101013','#e7e4f3','#bfb8cd'],
'Granola':['#f9f5ef','#db996f','#282523'],'Elicit':['#fbfcff','#5668ef','#1b203d'],
'Obsidian':['#111018','#a68af4','#f4f0ff'],'Zed':['#141716','#cdeac0','#f2faf4'],
'Screen Studio':['#f8fafb','#8372ff','#1e2135'],'Railway':['#121119','#9c8ce8','#f4efff'],
'Resend':['#0b0c0f','#eaeaea','#9c9da4'],'Nothing':['#eeeeea','#181818','#d83c41'],
'BitMiracle':['#12181b','#d3e2df','#f1f5f2'],'Apple':['#f7f7f7','#1a1a1a','#444444'],
'Teenage Engineering':['#e2e2dc','#fb5a21','#232321'],'Anthropic':['#f0ebe3','#423c35','#b88457'],
'Dub':['#f6f6f4','#17181a','#5f57ff'],'PostHog':['#f7f3ee','#fa773c','#201b1d'],
'Supabase':['#101615','#4dce9c','#e7f4ea'],'Awwwards':['#e9ecee','#191919','#929191'],
'Physical Intelligence':['#ffffff','#141414','#627d83'],
}
for x in rows:
 if x['name'] in colors:x['palette']=colors[x['name']]
out='/* Generated catalogue; edit tools/catalog.txt then run python3 tools/make_catalog.py */\nwindow.SITE_DATA = '+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n'
(root/'src/catalog.js').write_text(out,encoding='utf-8')
print('Generated',len(rows),'websites',len(out),'bytes')
