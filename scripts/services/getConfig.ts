import { types as T, compat } from "../deps.ts";

export const getConfig: T.ExpectedExports.getConfig = compat.getConfig({
  "tor-address": {
    "name": "Tor Address",
    "description": "The Tor address for the main ui.",
    "type": "pointer",
    "subtype": "package",
    "package-id": "cryptpad",
    "target": "tor-address",
    "interface": "main"
  },
  "sandbox-tor-address": {
    "name": "Tor Address",
    "description": "The Tor address for the sandbox ui.",
    "type": "pointer",
    "subtype": "package",
    "package-id": "cryptpad",
    "target": "tor-address",
    "interface": "sandbox"
  },
  "use-tor-instead-of-lan": {
    "name": "Use Tor Instead of Lan",
    "description": "Toggle this on to enable cryptpad to listen over Tor (.onion), and disable listening on .local. Toggle it off to switch back to .local.",
    "type": "boolean",
    "default": false, 
  }
})
