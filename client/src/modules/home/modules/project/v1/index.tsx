import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Avatar, Link as MuiLink } from '@mui/material';
import { getDay } from '../../../../../shared/utils/date';
import { useAtomValue } from 'jotai';
import { SelectedProjectAtom } from './states';
import BannerProjectCard from '../../../v1/components/banner-project-card';
import { ProjectLoadingSkeleton } from '../../../../../shared/components/atoms/skeleton';
import { HomePageProjectsAtom } from '../../../v1/states';
import useProject from './hooks';
import CommentsWrapper from '../../../../../shared/components/organisms/comments-wrapper';
import ProjectInteraction from './components/project-interaction';
import ProjectContent from './components/project-content';
import {
  defaultDarkThumbnail,
  defaultLightThumbnail,
} from '../../../../../shared/constants';
import { useA2ZTheme } from '../../../../../shared/hooks/use-theme';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAllProjectsResponse } from '../../../../../infra/rest/apis/project/typing';
import { OutputBlockData } from '@editorjs/editorjs';
import { CommentsWrapperAtom } from '../../../../../shared/components/organisms/comments-wrapper/states';
import A2ZTypography from '../../../../../shared/components/atoms/typography';
import Header from '../../../../../shared/components/organisms/header';
import A2ZIconButton from '../../../../../shared/components/atoms/icon-button';

const Project = () => {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const { theme: a2zTheme } = useA2ZTheme();
  const selectedProject = useAtomValue(SelectedProjectAtom);
  const similarProjects = useAtomValue(HomePageProjectsAtom);
  const commentsWrapper = useAtomValue(CommentsWrapperAtom);
  const { fetchProject, loading } = useProject();

  useEffect(() => {
    if (project_id) {
      fetchProject(project_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project_id]);

  if (loading || !selectedProject) {
    return <ProjectLoadingSkeleton count={1} />;
  }

  return (
    <>
      {commentsWrapper && <CommentsWrapper />}

      <Header
        leftSideChildren={
          <A2ZIconButton
            props={{
              onClick: () => navigate(-1),
              'aria-label': 'Go back',
            }}
          >
            <ArrowBackIcon />
          </A2ZIconButton>
        }
      />

      <Box
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            maxWidth: 900,
            mx: 'auto',
            py: { xs: 4, md: 8 },
            px: { xs: 2, sm: '5vw', lg: 0 },
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              mb: 6,
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <A2ZTypography
              variant="h5"
              text={selectedProject.title}
              noWrap
              props={{
                sx: {
                  maxWidth:
                    selectedProject.live_url && selectedProject.repository_url
                      ? '60%'
                      : '80%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
              }}
            >
              {selectedProject.live_url && (
                <Button
                  component="a"
                  href={selectedProject.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="primary"
                  startIcon={<OpenInNewIcon />}
                  sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
                >
                  Live URL
                </Button>
              )}

              {selectedProject.repository_url && (
                <Button
                  component="a"
                  href={selectedProject.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="inherit"
                  startIcon={<GitHubIcon />}
                  sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
                >
                  GitHub
                </Button>
              )}
            </Box>
          </Box>

          {/* Banner Image */}
          <Box
            component="img"
            src={
              selectedProject.banner_url
                ? selectedProject.banner_url
                : a2zTheme === 'dark'
                  ? defaultDarkThumbnail
                  : defaultLightThumbnail
            }
            alt={selectedProject.title}
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 2,
              objectFit: 'cover',
            }}
          />

          {/* Author Info + Publish Date */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              my: 6,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar
                src={selectedProject.user_id.personal_info.profile_img}
                alt={selectedProject.user_id.personal_info.fullname}
                sx={{ width: 48, height: 48 }}
              />
              <Box>
                <A2ZTypography
                  variant="body1"
                  text={selectedProject.user_id.personal_info.fullname}
                  props={{ sx: { textTransform: 'capitalize' } }}
                />
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  @
                  <MuiLink
                    component={Link}
                    to={`/user/${selectedProject.user_id.personal_info.username}`}
                    underline="hover"
                    sx={{ color: 'inherit', ml: 0.5 }}
                  >
                    {selectedProject.user_id.personal_info.username}
                  </MuiLink>
                </Box>
              </Box>
            </Box>

            <A2ZTypography
              variant="body2"
              text={`Published on ${getDay(selectedProject.publishedAt)}`}
              props={{
                sx: {
                  color: 'text.secondary',
                  opacity: 0.8,
                  mt: { xs: 2, sm: 0 },
                  ml: { xs: 6, sm: 0 },
                  pl: { xs: 1, sm: 0 },
                },
              }}
            />
          </Box>

          {/* Project Interaction Section */}
          <ProjectInteraction />

          {/* Project Content */}
          <Box sx={{ my: 6 }}>
            {selectedProject.content_blocks &&
              selectedProject.content_blocks[0]?.blocks?.map(
                (block: OutputBlockData, i: number) => (
                  <Box key={i} sx={{ my: { xs: 2, md: 4 } }}>
                    <ProjectContent block={block} />
                  </Box>
                )
              )}
          </Box>

          <ProjectInteraction />

          {/* Similar Projects Section */}
          {similarProjects && similarProjects.length > 0 && (
            <Box sx={{ mt: 10 }}>
              <A2ZTypography
                variant="h6"
                text="Similar Projects"
                props={{ sx: { mb: 5, fontWeight: 500 } }}
              />

              {similarProjects.map(
                (similarProject: getAllProjectsResponse, i: number) => (
                  <BannerProjectCard key={i} project={similarProject} />
                )
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Project;
