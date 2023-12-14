export type parsedUri = {
  scheme?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  error?: string;
};

/**
 * Parses a mongodb connection uri into different parts.
 *
 * @param {string} uri mongodb connection uri.
 *
 * @returns {parsedUri} Object containing different parts of the uri or an error if uri is invalid.
 */

export const parseUri = (uri: string): parsedUri => {
  const re = /^(.+):\/\/(.+):(.+)@([^:?/]+)(:\d+)?.*$/;

  const output = re.exec(uri);

  if (output) {
    return {
      scheme: output[1],
      user: output[2],
      password: output[3],
      host: output[4],
      port: parseInt(output[5]?.slice(1)),
    };
  } else {
    return {
      error: "Invalid uri format",
    };
  }
};
