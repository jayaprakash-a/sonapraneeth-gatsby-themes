const path = require("path");
const fs = require("fs");
const {createFilePath} = require("gatsby-source-filesystem");
const withDefaults = require("./utils/default-options");
const debug = require("./utils/debug").debugNode;
const slugify = require("slug");
slugify.charmap["+"] = "p";

let options;

// 1. Make sure the necessary directories exist
exports.onPreBootstrap = ({store, reporter}, themeOptions) => {
  const {program} = store.getState();
  // Options created using default and provided options
  options = withDefaults(themeOptions);
  debug(`Options: ${JSON.stringify(options, null, 2)}`);
  const directories = [path.join(program.directory, options.contentPath)];
  directories.map((directoryPath) => {
    reporter.info(`Looking for ${directoryPath} directory`);
    if (!fs.existsSync(directoryPath)) {
      reporter.info(`Creating the ${directoryPath} directory`);
      // Reference: https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
      fs.mkdirSync(directoryPath, {recursive: true});
    }
  });
};

const mdxResolverPassthrough = (fieldName) => async (
  source,
  args,
  context,
  info,
) => {
  const type = info.schema.getType("Mdx");
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent,
  });
  const resolver = type.getFields()[fieldName].resolve;
  const result = await resolver(mdxNode, args, context, {
    fieldName,
  });
  return result;
};

exports.createSchemaCustomization = ({actions, schema}) => {
  actions.createTypes(`
    interface IBlog {
      id: ID!
      title: String!
      excerpt: String!
      slug: String!
      fileAbsolutePath: String!
      cover: File @fileByRelativePath
      body: String!
      metadata: BlogMetadata
    }
    type Blog implements IBlog & Node {
      id: ID!
      title: String!
      excerpt: String!
      slug: String!
      fileAbsolutePath: String!
      cover: File @fileByRelativePath
      body: String!
      metadata: BlogMetadata
    }
    type BlogMetadata {
      isFeatured: Boolean!
      publishedTime: Date! @dateformat
      lastModifiedTime: Date @dateformat
      isDraft: Boolean!
      showSharing: Boolean!
      showTOC: Boolean!
      tableOfContents: JSON
      tags: [String!]!
      timeToRead: Int
    }
  `);
  actions.createTypes(
    schema.buildObjectType({
      name: "Blog",
      fields: {
        body: {
          type: "String!",
          resolve: mdxResolverPassthrough("body"),
        },
        excerpt: {
          type: "String!",
          args: {
            pruneLength: {
              type: "Int",
              defaultValue: 140,
            },
          },
          resolve: mdxResolverPassthrough("excerpt"),
        },
      },
    }),
  );
  actions.createTypes(
    schema.buildObjectType({
      name: "BlogMetadata",
      fields: {
        timeToRead: {
          type: "Int",
          resolve: mdxResolverPassthrough("timeToRead"),
        },
        tableOfContents: {
          type: "JSON",
          args: {
            maxDepth: {
              type: "Int",
              defaultValue: 3,
            },
          },
          resolve: mdxResolverPassthrough("tableOfContents"),
        },
      },
    }),
  );
};

// Create fields for post slugs and source
// This will change with schema customization with work
exports.onCreateNode = (
  {node, actions, getNode, createNodeId, createContentDigest},
  themeOptions,
) => {
  // Options created using default and provided options
  options = withDefaults(themeOptions);
  const {createNode, createParentChildLink} = actions;
  // Make sure it's an MDX node
  if (node.internal.type !== "Mdx") {
    return;
  }

  // Create source field (according to contentPath)
  const fileNode = getNode(node.parent);
  const source = fileNode.sourceInstanceName;
  if (node.internal.type === "Mdx" && source === options.contentPath) {
    const slug = createFilePath({
      node: fileNode,
      getNode,
      basePath: options.contentPath,
    });
    let blogUrl = slug;
    const [, year, month, date, title] = blogUrl.match(
      /^\/([\d]{4})-([\d]{2})-([\d]{2})-{1}(.+)\/$/,
    );
    blogUrl = `${options.baseUrl}/${year}/${month}/${date}/${slugify(title)}/`;
    blogUrl = blogUrl.replace(/\/\//, "/");
    const frontmatter = JSON.parse(JSON.stringify(node.frontmatter));
    const blogCover = "cover" in frontmatter ? frontmatter.cover : null;
    debug(`Blog cover: ${blogCover}`);
    const blogTags = "tags" in frontmatter ? frontmatter.tags : [];
    const blogData = {
      title: frontmatter.title || "",
      slug: blogUrl,
      fileAbsolutePath: node.fileAbsolutePath,
      cover: blogCover,
      metadata: {
        parent: node.id,
        publishedTime: frontmatter.publishedTime,
        lastModifiedTime: fileNode.modifiedTime,
        isDraft: frontmatter.isDraft || false,
        showSharing: frontmatter.showSharing || false,
        showTOC:
          frontmatter.showTOC !== undefined && frontmatter.showTOC !== null ?
            frontmatter.showTOC :
            true,
        tags: blogTags,
      },
    };
    createNode({
      ...blogData,
      // Required fields.
      id: createNodeId(`${node.id} >>> Blog`),
      parent: node.id,
      children: [],
      internal: {
        type: "Blog",
        contentDigest: createContentDigest(JSON.stringify(blogData)),
        content: JSON.stringify(blogData),
        description: "Blog Posts",
      },
    });
    createParentChildLink({parent: fileNode, child: node});
  }
};

exports.createPages = async ({actions, graphql, reporter}, themeOptions) => {
  // Options created using default and provided options
  options = withDefaults(themeOptions);
  debug(`Options: ${JSON.stringify(options, null, 2)}`);
  const fields = `
    id
    title
    excerpt
    slug
    fileAbsolutePath
    cover {
      childImageSharp {
        fluid(maxWidth: 1280) {
          base64
          aspectRatio
          src
          srcSet
          srcWebp
          srcSetWebp
          sizes
        }
      }
    }
    metadata {
      publishedTime
      lastModifiedTime
      timeToRead  
    }
  `;
  const queryProd = `
  query AllBlogsQuery {
    allBlog(
      sort: {fields: metadata___publishedTime, order: DESC},
      filter: {metadata___isDraft: {eq: false}}
    ) {
      edges {
        node {
          ${fields}
        }
      }
    }
  }`;
  const queryDev = `
  query AllBlogsQuery {
    allBlog(
      sort: {fields: metadata___publishedTime, order: DESC},
    ) {
      edges {
        node {
          ${fields}
        }
      }
    }
  }`;
  let result = null;
  if (process.env.NODE_ENV !== "production") {
    result = await graphql(queryDev);
  } else {
    result = await graphql(queryProd);
  }
  const blogs = result.data.allBlog.edges;
  debug(`Number of blogs: ${blogs.length}`);
  debug(`Creating base blog page at ${options.baseUrl}`);
  actions.createPage({
    path: options.baseUrl,
    component: require.resolve("./src/templates/blogs-list.js"),
    context: {
      blogs,
    },
  });
  if (blogs.length == 0) {
    reporter.panic(`
      There does not seem to be any mdx file present in
      '${options.contentPath}' directory. Hence blog
      pages would not be created. Please add some mdx
      files in '${options.contentPath}' directory`);
  }
  debug(`Blogs in ${process.env.NODE_ENV} env`);
  debug(JSON.stringify(blogs, null, 2));
  if (blogs.length > 0) {
    blogs.map((blog) => {
      debug(`Creating blog page for '${blog.node.title}'`);
      actions.createPage({
        path: blog.node.slug,
        component: require.resolve("./src/templates/blog.js"),
        context: {
          id: blog.node.id,
        },
      });
    });
  }
};
