import { matches, types as T, util, YAML } from "../deps.ts";

const { shape, string } = matches;

const noPropertiesFound: T.ResultType<T.Properties> = {
  result: {
    version: 2,
    data: {
      "Not Ready": {
        type: "string",
        value: "Could not find properties. Cryptpad might still be starting...",
        qr: false,
        copyable: false,
        masked: false,
        description: "Properties could not be found",
      },
    },
  },
} as const;

const configMatcher = shape({
  "tor-address": string,
  "lan-address": string,
});

export const properties: T.ExpectedExports.properties = async ( effects: T.Effects ) => {
  if (
    await util.exists(effects, {
      volumeId: "main",
      path: "start9/config.yaml",
    }) === false
  ) {
    return noPropertiesFound;
  }
  const config = configMatcher.unsafeCast(YAML.parse(
    await effects.readFile({
      path: "start9/config.yaml",
      volumeId: "main",
    }),
  ));
  const properties: T.ResultType<T.Properties> = {
    result: {
      version: 2,
      data: {
        "Cryptpad Admin (Tor)": {
          type: "string",
          value: `http://${config["tor-address"]}/admin`,
          description: "Use this link to enter Cryptpad Admin Panel over Tor.",
          copyable: true,
          qr: false,
          masked: false,
        },
        "Cryptpad Admin (Lan)": {
          type: "string",
          value: `https://${config["lan-address"]}/admin`,
          description: "Use this link to enter Cryptpad Admin Panel over Lan.",
          copyable: true,
          qr: false,
          masked: false,
        },
        "Cryptpad Checkup (Tor)": {
          type: "string",
          value: `https://${config["tor-address"]}/checkup`,
          description: "Use this link to enter Cryptpad Checkup over Lan.",
          copyable: true,
          qr: false,
          masked: false,
        },
        "Cryptpad Checkup (Lan)": {
          type: "string",
          value: `https://${config["lan-address"]}/checkup`,
          description: "Use this link to enter Cryptpad Checkup over Lan.",
          copyable: true,
          qr: false,
          masked: false,
        },
      }
    }
  } as const;
  return properties;
};
