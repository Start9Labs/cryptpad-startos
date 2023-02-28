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
  "lan-address": {
    "name": "Tor Address",
    "description": "The Tor address for the main ui.",
    "type": "pointer",
    "subtype": "package",
    "package-id": "cryptpad",
    "target": "lan-address",
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
  },
  "admin-public-key": {
    "type": "string",
    "nullable": true,
    "name": "Admin user public key",
    "description": "The public key of the admin user. This can be found on your user's settings page after logging in.",
    // "masked": true,
    // "pattern": "^[a-zA-Z0-9_]+$",
    // "pattern-description":
      // "Must be alphanumeric (can contain underscore).",
  },
  "admin-email": {
    "type": "string",
    "nullable": true,
    "name": "Admin user email address",
    "description": "The email address of the admin user.",
    // "masked": true,
    // "pattern": "^[a-zA-Z0-9_]+$",
    // "pattern-description":
      // "Must be alphanumeric (can contain underscore).",
  },
  "max-upload-size": {
    "type": "number",
    "nullable": true,
    "name": "Max upload size (MB)",
    "description": "This sets the maximum size of any one file uploaded to the server. Anything larger than this size will be rejected. Defaults to 20MB if no value is provided.",
    "units": "MiB",
    "integral": true,
    "range": "[0,*)",
  },
})
