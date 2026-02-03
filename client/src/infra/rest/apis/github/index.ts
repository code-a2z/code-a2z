// api/github/index.ts
import { patch, post } from '../..';
import {
  AnalyzeUserPayload,
  AnalyzeUserResponse,
  GetIssueMetricsPayload,
  IssueMetricsResponse,
  GetPRMetricsPayload,
  PRMetricsResponse,
  GetLanguagesPayload,
  LanguagesResponse,
  GetFilesPayload,
  GetUserReposPayload,
  UserReposResponse,
} from './typing';
import { ApiResponse, BaseApiResponse } from '../../typings';

export const analyzeUser = async (payload: AnalyzeUserPayload) => {
  return post<
    AnalyzeUserPayload,
    ApiResponse<AnalyzeUserResponse>
  >('/api/github/analyze-user', true, payload);
};

export const getIssueMetrics = async (payload: GetIssueMetricsPayload) => {
  return post<
    GetIssueMetricsPayload,
    ApiResponse<IssueMetricsResponse>
  >('/api/github/issue-metrics', true, payload);
};

export const getPRMetrics = async (payload: GetPRMetricsPayload) => {
  return post<
    GetPRMetricsPayload,
    ApiResponse<PRMetricsResponse>
  >('/api/github/pr-metrics', true, payload);
};

export const getLanguages = async (payload: GetLanguagesPayload) => {
  return post<
    GetLanguagesPayload,
    ApiResponse<LanguagesResponse>
  >('/api/github/languages', true, payload);
};

export const getFiles = async (payload: GetFilesPayload) => {
  return post<
    GetFilesPayload,
    ApiResponse<any[]>
  >('/api/github/files', true, payload);
};

export const getUserRepos = async (payload: GetUserReposPayload) => {
  return post<
    GetUserReposPayload,
    ApiResponse<UserReposResponse>
  >('/api/github/user-repos', true, payload);
};

export const detectCapabilities = async (payload: {
  files: any[];
  deps?: string[];
}) => {
  return post<
    { files: any[]; deps?: string[] },
    ApiResponse<string[]>
  >('/api/github/detect-capabilities', true, payload);
};
