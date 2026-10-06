#!/usr/bin/env node
// CLI mínima para a Meta Marketing API (conta de anúncios do Rotina Clínica).
// Lê META_ACCESS_TOKEN e META_AD_ACCOUNT_ID de meta-ads/.env (nunca commitado).
//
// Uso:
//   node meta.mjs check                         -> valida token e conta
//   node meta.mjs campaigns                     -> lista campanhas
//   node meta.mjs insights [preset] [level]     -> gasto/resultados (default last_30d, campaign)
//   node meta.mjs get    <path> [k=v ...]       -> GET genérico   (ex: get act/adsets fields=name,status)
//   node meta.mjs post   <path> [k=v ...]       -> POST genérico  (cria/edita)
//   node meta.mjs delete <path>
// Em <path>, "act" é substituído por act_<META_AD_ACCOUNT_ID>.
// Valores de orçamento são em centavos (R$ 50,00 = 5000).

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    for (const line of readFileSync(join(here, ".env"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv();

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = (process.env.META_AD_ACCOUNT_ID || "").replace(/^act_/, "");
const VERSION = process.env.META_API_VERSION || "v26.0";
const BASE = `https://graph.facebook.com/${VERSION}`;

if (!TOKEN || TOKEN.startsWith("COLE_")) {
  console.error("META_ACCESS_TOKEN ausente em meta-ads/.env");
  process.exit(1);
}

const resolvePath = (p) => p.replace(/^\/?act(?=\/|$)/, `act_${ACCOUNT}`).replace(/^\/?/, "/");

function parseKv(args) {
  const out = {};
  for (const a of args) {
    const i = a.indexOf("=");
    if (i > 0) out[a.slice(0, i)] = a.slice(i + 1);
  }
  return out;
}

async function call(method, path, params = {}) {
  const url = new URL(BASE + resolvePath(path));
  const init = { method };
  if (method === "GET" || method === "DELETE") {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set("access_token", TOKEN);
  } else {
    const body = new URLSearchParams({ ...params, access_token: TOKEN });
    init.body = body;
  }
  const res = await fetch(url, init);
  const json = await res.json();
  if (json.error) {
    const e = json.error;
    throw new Error(`${e.type || "Erro"} ${e.code}${e.error_subcode ? "/" + e.error_subcode : ""}: ${e.error_user_msg || e.message}`);
  }
  return json;
}

async function getAll(path, params) {
  const rows = [];
  let page = await call("GET", path, { limit: "200", ...params });
  rows.push(...(page.data || []));
  while (page.paging?.next) {
    const res = await fetch(page.paging.next);
    page = await res.json();
    if (page.error) throw new Error(page.error.message);
    rows.push(...(page.data || []));
  }
  return rows;
}

const brl = (cents) => (cents == null ? "-" : `R$ ${(Number(cents) / 100).toFixed(2).replace(".", ",")}`);

const [cmd, ...rest] = process.argv.slice(2);

try {
  switch (cmd) {
    case "check": {
      const me = await call("GET", "/me", { fields: "id,name" });
      console.log("Token de:", me.name, `(${me.id})`);
      if (!ACCOUNT) { console.log("META_AD_ACCOUNT_ID não definido"); break; }
      const acc = await call("GET", "act", {
        fields: "name,account_status,currency,timezone_name,amount_spent,business{name}",
      });
      console.log(JSON.stringify(acc, null, 2));
      break;
    }
    case "campaigns": {
      const rows = await getAll("act/campaigns", {
        fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,created_time",
      });
      for (const c of rows)
        console.log([c.id, c.effective_status, c.objective, brl(c.daily_budget ?? c.lifetime_budget), c.name].join(" | "));
      console.log(`\n${rows.length} campanhas`);
      break;
    }
    case "insights": {
      const [preset = "last_30d", level = "campaign"] = rest;
      const rows = await getAll("act/insights", {
        level,
        date_preset: preset,
        fields: `${level}_name,spend,impressions,reach,clicks,ctr,cpc,cpm,actions`,
      });
      console.log(JSON.stringify(rows, null, 2));
      break;
    }
    case "get":
      console.log(JSON.stringify(await call("GET", rest[0], parseKv(rest.slice(1))), null, 2));
      break;
    case "post":
      console.log(JSON.stringify(await call("POST", rest[0], parseKv(rest.slice(1))), null, 2));
      break;
    case "delete":
      console.log(JSON.stringify(await call("DELETE", rest[0]), null, 2));
      break;
    default:
      console.log("Comandos: check | campaigns | insights [preset] [level] | get|post|delete <path> [k=v ...]");
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
