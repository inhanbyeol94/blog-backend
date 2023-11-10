export const responseMessageOnly = (message: string) => {
  return { message };
};

export const responseResultOnly = (result: boolean) => {
  return { result };
};

export const responseAccessTokenOnly = (accessToken: string) => {
  return { accessToken };
};

export const responseTokenAndMemberId = (accessToken: string, refreshToken: string, memberId: string) => {
  return { accessToken, refreshToken, memberId };
};

export const responseTokenOnly = (accessToken: string, refreshToken: string) => {
  return { accessToken, refreshToken };
};

export const responseDataOnly = <T>(data: T) => {
  return data;
};

export const responseArrayDataOnly = <T>(data: T[]) => {
  return data;
};

export const responseArrayDataAndCount = <T>(data: T[], count: number) => {
  return { data, count };
};
