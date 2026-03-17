
Set `shaheen.com` as the custom domain using the built-in Domains screen you already have open.

What to do
1. In the current Domains screen, add:
   - `shaheen.com`
   - `www.shaheen.com`
2. Choose `shaheen.com` as the Primary domain.
3. At your domain provider, add these DNS records:
   - A record: `@` → `185.158.133.1`
   - A record: `www` → `185.158.133.1`
   - TXT record: `_lovable` → use the exact verification value shown in the setup flow
4. Remove conflicting DNS records before saving:
   - old A records for `@` or `www`
   - any AAAA records
   - any proxied setup during verification if you use Cloudflare (set to DNS only)
5. Make sure the project is published. A custom domain will not go live until the site is published.

If it has been stuck before
- Remove the old/stuck domain entry first, then add it again fresh.
- Recheck the TXT value exactly.
- Wait for DNS propagation.
- If status becomes:
  - `Verifying`: DNS is still propagating
  - `Setting up`: SSL is being created
  - `Ready`: domain is connected and will become live when published
  - `Failed` / `Offline`: DNS still has a conflict and needs correction

Important checks
- You need a paid plan for custom domains.
- Add both root and `www` versions separately.
- Do not keep any previous hosting records active for the same hostnames.

Desktop and mobile path
- Desktop: top left project name → Settings → Domains
- Mobile: project name at the top → Settings → Domains

Suggested implementation approach
- First connect `shaheen.com`
- Then connect `www.shaheen.com`
- Set `shaheen.com` as primary
- Publish/update the project after the domain shows ready

Technical details
```text
Required DNS
@      A      185.158.133.1
www    A      185.158.133.1
_lovable TXT  lovable_verify=...
```

If you want, the safest next step is:
- remove any previous `shaheen.com` entry
- reconnect it cleanly
- copy the exact TXT value from the setup dialog into your DNS provider
