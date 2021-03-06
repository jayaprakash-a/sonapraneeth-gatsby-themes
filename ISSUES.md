# Issues

- root

  - [x] `debug` package not working
  - [x] Add eslint plugin to root
  - [x] `debug` package does not print in some gatsby-node functions (Overwritten streams)
  - [ ] Add comments to all code

- @sonapraneeth/gatsby-plugin-themed-components

  - [x] Styles from `./packages/base/src/gatsby-plugin-theme-ui/fonts.js` are not working
  - [ ] Sidebar is working with navbar in `dev` environment but not in `production` environment

- @sonapraneeth/gatsby-theme-bio

  - [x] warn Deprecation warning - adding inferred resolver for field AuthorInfo.cover. In Gatsby v3, only fields with an explicit directive/extension will get a. (Fixed in [#41dc899](https://github.com/sonapraneeth-a/sonapraneeth-gatsby-themes/commit/41dc8991a92a1b478b4ebbd8aeaa6166853d631d))
  - [ ] Avoid crashing of app due to non-working of static graphql queries

- @sonapraneeth/gatsby-theme-project

  - [x] Tried adding ids for headings in MDX files using gatsby-config.js. (Fixed in [#7cd49db](https://github.com/sonapraneeth-a/sonapraneeth-gatsby-themes/commit/7cd49dbc9a4a1734bcd94a7ec7a5ff68b8b0bf38))
  - [x] Tried adding H1 component. (Fixed in [#2115fca](https://github.com/sonapraneeth-a/sonapraneeth-gatsby-themes/commit/2115fcaa1d3612b39a808031ab1e6eee6223c8e5))
  - [ ] Hooks failing when no project files are present - Unknown field 'allProject' on type 'Query'. Source: document `AllProjectsQuery` file: `GraphQL request`
        File: ..\..\packages\gatsby-theme-project\src\templates\project.js

- @sonapraneeth/gatsby-theme-blog

  - [x] `timeToRead` not resolving through Mdx
  - [x] Add `fileResolverPassthrough` to resolve `modifiedTime` for mdx files
    - Added using fileNode
  - [ ] Hooks failing when no blog files are present - Unknown field 'allBlog' on type 'Query'. Source: document `AllBlogsQuery` file: `GraphQL request`
        File: ..\..\packages\gatsby-theme-blog\src\templates\blog.js

- demo/bio

  - [ ] Update image for author bio in demos
  - [ ] warn Warning: componentWillUpdate has been renamed, and is not recommended for use. See https://fb.me/react-async-component-lifecycle-hooks for details.

- demo/blog

  - [ ] Update image for blog cover in demos
  - [ ] warn Warning: componentWillUpdate has been renamed, and is not recommended for use. See https://fb.me/react-async-component-lifecycle-hooks for details.

- demo/project

  - [ ] Update image for project cover in demos
  - [ ] warn Warning: componentWillUpdate has been renamed, and is not recommended for use. See https://fb.me/react-async-component-lifecycle-hooks for details.

- demo/profile

  - [x] Error: Unable to find plugin "@sonapraneeth/gatsby-theme-profile". Perhaps you need to install its package?
    - Need to add empty file as specified in main
    - warn Warning: componentWillUpdate has been renamed, and is not recommended for use. See https://fb.me/react-async-component-lifecycle-hooks for details.

- demo/all
  - [ ] warn Warning: componentWillUpdate has been renamed, and is not recommended for use. See https://fb.me/react-async-component-lifecycle-hooks for details.
