/** @jsx jsx */
import {jsx} from "theme-ui";
// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import {Link} from "gatsby";

import {
  Card,
  CardContent,
  CardFooter,
  Styled,
  SFlex,
  FaReadme,
  FaClock,
  Chip,
  getFormattedDate,
} from "@sonapraneeth/gatsby-plugin-themed-components";

/**
 *
 * @param {*} children
 * @return {JSX}
 */
function DetailedBlogCard({blog, ...props}) {
  const timeToRead =
    blog.metadata.timeToRead === null ? "~1" : blog.metadata.timeToRead;
  const publishedDate = getFormattedDate(blog.metadata.publishedTime);
  return (
    <Card>
      <CardContent>
        <SFlex
          sx={{
            flexDirection: "column",
          }}
        >
          <Styled.h2>{blog.title}</Styled.h2>
          <SFlex
            sx={{
              flexDirection: "row",
            }}
          >
            <Chip type={"date"}>
              <b>Published:</b> {publishedDate}
            </Chip>
          </SFlex>
          <p>{blog.excerpt}</p>
        </SFlex>
      </CardContent>
      <CardFooter>
        <SFlex
          sx={{
            justifyContent: "space-around",
            flexWrap: "wrap",
          }}
        >
          <Styled.a
            as={Link}
            to={blog.slug}
            sx={{
              "variant": "link.none",
              "bg": "surface",
              ":hover": {
                bg: "surface",
                color: "text",
              },
              "display": "inline-block",
            }}
          >
            <FaReadme
              sx={{
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
            <span
              sx={{
                verticalAlign: "middle",
                mx: "0.2rem",
              }}
            >
              Continue Reading ...
            </span>
          </Styled.a>
          <p
            sx={{
              m: 0,
            }}
          >
            <FaClock
              sx={{
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
            <span
              sx={{
                verticalAlign: "middle",
                mx: "0.2rem",
              }}
            >
              {timeToRead} min. read
            </span>
          </p>
        </SFlex>
      </CardFooter>
    </Card>
  );
}

DetailedBlogCard.propTypes = {
  blog: PropTypes.any.isRequired,
};

DetailedBlogCard.defaultProps = {};

export default DetailedBlogCard;
