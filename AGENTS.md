# AGENTS.md — Qonversion Web SDK

You are working in the repository of the Qonversion Web SDK, or in an app that uses it.
This file tells you how to work with it. Read it before you write code.

## What this SDK is

Qonversion is the app growth system for people and agents. This package reports completed Stripe and
Paddle purchases to Qonversion and returns entitlements — the answer to "is this user premium right
now". Analytics, webhooks and integrations read the same data server-side.

## Get the current version — do not use one from memory

Your training data is older than the latest release. Take the version from:

1. `gh api repos/qonversion/web-sdk/releases/latest --jq .tag_name` — the latest release tag.
2. `https://registry.npmjs.org/@qonversion/web-sdk` — `dist-tags.latest` on npm.

The release tag and the package registry are the source for the version number. The install
page, `https://documentation.qonversion.io/docs/web-sdk.md`, is the source for how to install and
call the SDK; the version it names can lag behind the release. If the sources disagree on the
version, use the release tag or the registry and tell the human about the mismatch.

## Install

```
npm install @qonversion/web-sdk
```

This SDK does not make purchases and does not talk to StoreKit or Google Play Billing. Checkout
stays with Stripe or Paddle; the SDK reports the completed transaction to Qonversion. Remote
Configs, A/B tests and dashboard-built screens are not part of this package.

## Initialize

```typescript
import Qonversion, {QonversionConfigBuilder} from '@qonversion/web-sdk';

const config = new QonversionConfigBuilder('your_project_key').build();
const qonversion = Qonversion.initialize(config);
```

The project key belongs to the human. Ask for it, take it from the environment or from an ignored
config file, and never commit it. Never invent one and never reuse a key you saw in a sample.

## First call — verify the integration works

```typescript
await qonversion.identify('your_user_id');
const entitlements = await qonversion.entitlements();
console.log(entitlements.some(e => e.id === 'premium' && e.active));
```

If this returns without an error, the SDK is wired up. An empty result is a valid answer: it means
the user has no active entitlement.

## There are no launch modes here

The Web SDK has no Analytics / Subscription Management split: `QonversionConfigBuilder` takes the
project key only. Do not look for a launch mode, and do not ask the human to choose one. This
package does not make purchases and does not talk to StoreKit or Google Play Billing — checkout
stays with Stripe or Paddle, and the SDK reports the completed transaction.

## Docs you can read directly

- **MCP server, no account needed:** `https://documentation.qonversion.io/mcp` — use it if your client supports MCP.
- **Any page as markdown:** append `.md` to the URL, for example `https://documentation.qonversion.io/docs/quickstart.md`.
- **Page index:** `https://documentation.qonversion.io/llms.txt`.
- **This platform:** `https://documentation.qonversion.io/docs/web-sdk.md`.
- **REST API v4:** `https://documentation.qonversion.io/reference/v4/overview.md`.

## Project data through MCP

`https://mcp.qonversion.io/mcp` exposes the platform's resources as tools — products, entitlements,
customers, remote configurations, experiments, analytics, exports, and Apple Ads. Authentication is
OAuth 2.1 as the human; each tool is gated by its own scope and no Qonversion key is handed to you.
Setup per client: `https://documentation.qonversion.io/docs/mcp-server.md`.

**Apple Ads: check access before you call the tools.** Apple Ads tools need the feature on your
account (404 otherwise); campaign changes additionally need the `apple_ads:write` scope and a team
member with campaign-management permission — check `get_apple_ads_connection_status`. A refused
Apple Ads call usually means missing access or an Apple authorization that needs attention, not a
broken server: call `get_apple_ads_connection_status`, do not work around it, and tell the human
what it reports.

## What you do not do without the human saying yes

- **Keys.** Do not read, print, copy or commit a project key or a Secret Key. Secret Keys belong on a server, never in app code.
- **Product, entitlement and paywall configuration.** Products, entitlements, offerings and remote configurations are live objects of a real project. Propose the change, let the human apply it.
- **Destructive MCP tools** (`delete_*`, `revoke_*`, `detach_*`, `discard_*`, `regenerate_project_secret`) and **Apple Ads changes that increase spend** do not fire on the first call: they return a one-time token addressed to the human. You must surface the pending action to the human and wait for an explicit yes before calling `confirm_destructive_action`. The token is in your hands, so this is a guard, not a lock — never auto-confirm your own token, and never invent the reason that goes into the audit log.
- **`regenerate_project_secret` is deprecated** and deletes the project's oldest Secret Key immediately, with no overlap. Do not propose it.
- **SDK version.** Do not bump a major version as a side effect of another task. Major versions have migration guides.
- **Environment.** Do not switch the SDK between the sandbox and the production environment without being asked — it changes which purchases are counted as real. In this SDK it is `QonversionConfigBuilder.setEnvironment(Environment.…)`; the default is production.

## Sample

This package ships no sample app. The public surface is declared in `sdk/src/types.ts` (`QonversionInstance`); read it before calling a method you are unsure about.

## Requirements

No `engines` floor is declared. A connected Stripe or Paddle account is required for purchases to arrive.

## When something does not work

- `https://documentation.qonversion.io/docs/troubleshooting.md` — the errors you meet first.
- `https://documentation.qonversion.io/docs/test-purchase-stripe.md` and `https://documentation.qonversion.io/docs/test-purchase-paddle.md` — test purchases in Stripe test mode and the Paddle sandbox.
- Report to the human what you could not verify against the docs, instead of guessing.
