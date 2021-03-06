/** @jsx jsx */
import {jsx} from "@sonapraneeth/gatsby-plugin-themed-components";
// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

import {
  Styled,
  SContainer,
} from "@sonapraneeth/gatsby-plugin-themed-components";
import {HomeWidget} from "@sonapraneeth/gatsby-theme-bio";

AboutBanner.propTypes = {
  data: PropTypes.any.isRequired,
};

AboutBanner.defaultProps = {};

/**
 * Home layout - Used in home page
 * @return {JSX} Rendered children for the AboutBanner
 */
function AboutBanner({data}) {
  return (
    <div
      sx={{
        bg: "banner.about",
        // padding: "1rem",
      }}
    >
      <SContainer>
        <Styled.h1>About</Styled.h1>
        <HomeWidget author={data.author} details={data.mdx} />
      </SContainer>
    </div>
  );
}

export default AboutBanner;
