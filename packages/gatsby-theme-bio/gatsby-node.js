const path = require("path");
const fs = require("fs");
const withDefaults = require("./utils/default-options");
const debug = require("./utils/debug").debugNode;

let options;

// 1. Make sure the necessary directories exist
exports.onPreBootstrap = ({store, reporter}, themeOptions) => {
  const {program} = store.getState();
  // Options created using default and provided options
  options = withDefaults(themeOptions);
  reporter.info(`Options: ${JSON.stringify(options, null, 2)}`);
  const directories = [
    path.join(program.directory, options.dataPath),
    path.join(program.directory, options.homePath),
    path.join(program.directory, options.assetsPath),
  ];
  directories.map((directoryPath) => {
    reporter.info(`Looking for ${directoryPath} directory`);
    if (!fs.existsSync(directoryPath)) {
      reporter.info(`Creating the ${directoryPath} directory`);
      // Reference: https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
      fs.mkdirSync(directoryPath, {recursive: true});
    }
  });
};

exports.createSchemaCustomization = ({actions}) => {
  actions.createTypes(`
    interface IAuthor {
      id: ID!
      name: String!
      description: String!
      cover: File!
      username: Username!
    }
    type Username {
      linkedin: String!
      facebook: String!
      twitter: String!
      github: String!
      email: String!
    }
    type Author implements IAuthor & Node {
      id: ID!
      name: String!
      description: String!
      cover: File! @fileByRelativePath
      username: Username!
    }
  `);
};

exports.sourceNodes = (
  {actions, createContentDigest, createNodeId},
  themeOptions,
) => {
  options = withDefaults(themeOptions);
  debug("Schema customization");
  const {createNode} = actions;
  createNode({
    options,
    id: createNodeId("@sonapraneeth/gatsby-theme-bio >>> Options"),
    package: "@sonapraneeth/gatsby-theme-bio",
    parent: null,
    children: [],
    internal: {
      type: "Options",
      contentDigest: createContentDigest(JSON.stringify(options)),
      content: JSON.stringify(options),
      description: "Bio Options",
    },
  });
};

exports.onCreateNode = (
  {node, actions, getNode, createNodeId, createContentDigest, reporter},
  themeOptions,
) => {
  options = withDefaults(themeOptions);
  if (options.author === null || options.author === "") {
    reporter.panic(
      "Author option is empty. Please provide a valid author " +
        "name in package options",
    );
  }
  const {createNode} = actions;
  if (node.internal.type !== "AuthorYaml") {
    return;
  }
  // Create source field (according to contentPath)
  const fileNode = getNode(node.parent);
  const source = fileNode.sourceInstanceName;
  if (node.internal.type === "AuthorYaml" && source === "data") {
    const author = {
      name: node.name || "",
      description: node.description || "",
      cover: node.cover || "",
      username: {
        linkedin: node.username.linkedin || "",
        facebook: node.username.facebook || "",
        twitter: node.username.twitter || "",
        github: node.username.github || "",
        email: node.username.email || "",
      },
    };
    createNode({
      ...author,
      // Required fields.
      id: createNodeId(`${node.id} >>> Author`),
      parent: node.id,
      children: [],
      internal: {
        type: "Author",
        contentDigest: createContentDigest(JSON.stringify(author)),
        content: JSON.stringify(author),
        description: "Author Info",
      },
    });
  }
};

exports.createPages = async ({actions, graphql, reporter}, themeOptions) => {
  options = withDefaults(themeOptions);
  const query = `
  query MainAuthor {
    author(name: {eq: "${options.author}"}) {
      id
    }
  }`;
  const result = await graphql(query);
  if (result.data !== null && result.data.author === null) {
    reporter.panic(
      `Unable to retrieve data for author (${options.author}). ` +
        "Please provide name which has been used in " +
        `data files (Path: ${options.dataPath})`,
    );
  }
  reporter.info(`Creating page at ${options.baseUrl}`);
  actions.createPage({
    path: options.baseUrl,
    component: require.resolve("./src/templates/home.js"),
    context: {
      id: result.data.author.id,
    },
  });
};
