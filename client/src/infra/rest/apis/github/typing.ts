export interface AnalyzeUserPayload{
    username: string;
}
export interface AnalyzeUserResponse{
    repos: Array<{
        repo:string;
        languages: string[];
        capabilities: string[];
        avgPRMergeTime: number | null;
        avgIssueResolutionTime: number | null;
    } >;
}
export interface GetIssueMetricsPayload{
    owner: string;
    repo: string;
}

export interface IssueMetricsResponse{
    issue: Array<{
        issue: number;
        resolutionHours: number;
    }>;
}

export interface GetPRMetricsPayload{
    owner : string;
    repo: string ;
}

export interface PRMetricsResponse{
    prs:Array<{
        prnumber:number;
        mergetimehours:number;
    }>;
}

export interface GetLanguagesPayload{
    owner:string;
    repo:string;
}

export interface LanguagesResponse {
  [language: string]: number;
}

export interface GetFilesPayload {
  owner: string;
  repo: string;
}

export interface GetUserReposPayload {
  username: string;
}

export interface UserReposResponse {
  repos: Array<{
    owner: { login: string };
    name: string;
  }>;
}