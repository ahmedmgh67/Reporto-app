import React, { useState } from "react";
import { Mutation } from "react-apollo";
import styled from "styled-components";

import { Spacing, Overlay, Container } from "components/Layout";
import { Error } from "components/Text";
import { Button } from "components/Form";
import Avatar from "components/Avatar";

import PostImageUpload from "pages/Home/PostImageUpload";

import { GET_FOLLOWED_POSTS, CREATE_POST } from "graphql/post";
import { GET_AUTH_USER, GET_USER_POSTS } from "graphql/user";

import { useStore } from "store";

import { PROFILE_PAGE_POSTS_LIMIT } from "constants/DataLimit";
import { HOME_PAGE_POSTS_LIMIT } from "constants/DataLimit";
import { MAX_POST_IMAGE_SIZE } from "constants/ImageSize";

import { BigUploadIcon } from "components/icons";

import { useGlobalMessage } from "hooks/useGlobalMessage";
import theme from "theme";

const Root = styled(Container)`
  border: 0;
  border: 1px solid ${p => p.theme.colors.border.main};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${p => p.theme.spacing.sm} 0;
`;

const Textarea = styled.textarea`
  width: 100%;
  margin: 0 ${p => p.theme.spacing.xs};
  padding-left: ${p => p.theme.spacing.sm};
  padding-top: ${p => p.theme.spacing.xs};
  border: 0;
  outline: none;
  resize: none;
  transition: 0.1s ease-out;
  height: ${p => (p.focus ? "80px" : "40px")};
  font-size: ${p => p.theme.font.size.xs};
  background-color: ${p => p.theme.colors.grey[100]};
  border-radius: ${p => p.theme.radius.md};
`;

const ImagePreviewContainer = styled.div`
  width: 150px;
  height: 150px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: ${p => p.theme.shadows.sm};
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Options = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-top: 1px solid ${p => p.theme.colors.border.main};
  padding: ${p => p.theme.spacing.sm} 0;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
`;
const DropDown = styled.select`
  outline: 0;
  height: 36px;
  width: 30%;
  transition: border 0.1s;
  color: black;
  border-radius: ${p => p.theme.radius.sm};
  padding-left: ${p => p.theme.spacing.xs};
  border: 1px solid
    ${p =>
      p.borderColor
        ? p.theme.colors[p.borderColor]
        : p.theme.colors.border.main};
  color: ${p => p.theme.colors.text.secondary};

  &:focus {
    border-color: ${p => p.theme.colors.border.main};
  }
`;

/**
 * Component for creating a post
 */
const CreatePost = ({ data }) => {
  const [{ auth }] = useStore();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState("Recommendation");
  const [period, setPeriod] = useState("Annual");
  const [industry, setIndustry] = useState("Financials");
  const [reportType, setReportType] = useState("Economic");
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  // console.log(data)
  const message = useGlobalMessage();

  const handleReset = () => {
    setTitle("");
    setImage("");
    setIsFocused(false);
    setError("");
  };
  const handleTypeChange = e => {
    const { name, value } = e.target;
    console.log(value);
    setType(value);
  };
  const handleIndustryChange = e => {
    const { name, value } = e.target;
    console.log(value);
    setType(value);
  };
  const handlePeriodChange = e => {
    const { name, value } = e.target;
    console.log(value);
    setType(value);
  };
  const handleReportTypeChange = e => {
    const { name, value } = e.target;
    console.log(value);
    setReportType(value);
  };

  const handleOnFocus = () => setIsFocused(true);

  const handlePostImageUpload = e => {
    const file = e.target.files[0];
    console.log(file);
    if (!file) return;

    if (file.size >= MAX_POST_IMAGE_SIZE) {
      message.error(
        `File size should be less then ${MAX_POST_IMAGE_SIZE / 1000000}MB`
      );
      return;
    }

    setImage(file);

    setIsFocused(true);
    e.target.value = null;
  };

  const handleTitleChange = e => setTitle(e.target.value);
  // console.log(data)
  const user = data.getUser;
  const handleSubmit = async (e, createPost) => {
    e.preventDefault();
    createPost();
    handleReset();
  };
  return (
    <Mutation
      mutation={CREATE_POST}
      variables={{ input: { type, title, image, authorId: auth.user.id } }}
      refetchQueries={() => [
        {
          query: GET_FOLLOWED_POSTS,
          variables: {
            userId: auth.user.id,
            skip: 0,
            limit: HOME_PAGE_POSTS_LIMIT
          }
        },
        { query: GET_AUTH_USER },
        {
          query: GET_USER_POSTS,
          variables: {
            username: auth.user.username,
            skip: 0,
            limit: PROFILE_PAGE_POSTS_LIMIT
          }
        }
      ]}
    >
      {(createPost, { loading, error: apiError }) => {
        const isShareDisabled = loading || (!loading && !image && !title);

        return (
          <>
            {isFocused && <Overlay onClick={handleReset} />}

            <Root
              zIndex={isFocused ? "md" : "xs"}
              color="white"
              radius="sm"
              padding="sm"
            >
              <form onSubmit={e => handleSubmit(e, createPost)}>
                <Wrapper>
                  <Avatar image={auth.user.image} size={40} />

                  <Textarea
                    type="textarea"
                    name="title"
                    focus={isFocused}
                    value={title}
                    onFocus={handleOnFocus}
                    onChange={handleTitleChange}
                    placeholder="Add a report or a recommendation"
                  />

                  {!isFocused && user.type === "Analyst" && (
                    <PostImageUpload handleChange={handlePostImageUpload} />
                  )}
                </Wrapper>
                {image && (
                  <Spacing bottom="sm">
                    <ImagePreviewContainer>
                      <span
                        style={{
                          textAlign: "center",
                          height: "50%",
                          width: "50%"
                        }}
                      >
                        {image.name}
                      </span>
                      <br />
                      <embed
                        src={URL.createObjectURL(image)}
                        type="application/pdf"
                      />
                      {/* <BigUploadIcon style={{ width: "40", color: theme.colors.success }}/> */}
                      {/* <ImagePreview src={URL.createObjectURL(image)} /> */}
                    </ImagePreviewContainer>
                  </Spacing>
                )}
                {isFocused && (
                  <Options>
                    {user.type === "Analyst" && (
                      <PostImageUpload
                        label="Upload Report"
                        handleChange={handlePostImageUpload}
                      />
                    )}

                    <Buttons>
                      <Button text type="button" onClick={handleReset}>
                        Cancel
                      </Button>
                      <Button disabled={isShareDisabled} type="submit">
                        Share
                      </Button>
                    </Buttons>
                  </Options>
                )}
                ,
                {isFocused && (
                  <Options>
                    {user.type === "Analyst" && (
                      <>
                      Type:
                        <DropDown
                          value={type}
                          name="type"
                          onChange={handleTypeChange}
                        >
                          <option>Recommendation</option>
                          <option>Report</option>
                        </DropDown>
                      </>
                    )}
                    ,
                    {type === "Report" && (
                      <>
                        Industry:
                        <DropDown
                          value={type}
                          autoFocus="true"
                          name="type"
                          onChange={handleIndustryChange}
                        >
                          <option>Financials</option>
                          <option>Utilties</option>
                          <option>Consumer Discretionary</option>
                          <option>Healthcare</option>
                          <option>Technology</option>
                          <option>Telecom</option>
                          <option>Real Estate</option>
                          <option>Financial Statement</option>
                        </DropDown>
                      </>
                    )}
                  </Options>
                )}
                {isFocused && (
                  <Options>
                    {type === "Report" && (
                      <>                        
                        Period:
                        <DropDown
                          value={type}
                          autoFocus="true"
                          name="type"
                          onChange={handlePeriodChange}
                        >
                          <option>Annual</option>
                          <option>Monthly</option>
                          <option>Quarterly </option>
                        </DropDown>
                        Report Type:
                        <DropDown
                          value={type}
                          autoFocus="true"
                          name="type"
                          onChange={handleReportTypeChange}
                        >
                          <option>Economic</option>
                          <option>Financial</option>
                        </DropDown>
                      </>
                    )}
                  </Options>
                )}
                {apiError ||
                  (error && (
                    <Spacing top="xs" bottom="sm">
                      <Error size="xs">
                        {apiError
                          ? "Something went wrong, please try again."
                          : error}
                      </Error>
                    </Spacing>
                  ))}
              </form>
            </Root>
          </>
        );
      }}
    </Mutation>
  );
};

export default CreatePost;
