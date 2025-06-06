// lib/constants.ts

export const MOBILE_BREAKPOINT = 768;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 다 허용하지만 길이 2~6자리로 제한
export const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|co\.kr|or\.kr|go\.kr|ac\.kr)$/;

export const DEFAULT_SORT = 'createdAt:desc'; // 생성일 내림차순 (최신 순)
export const DEFAULT_PARENTID = 'hszid9zo4inokoj1jd7lpc1v'; // 스낵 categoryId
export const DEFAULT_CATEGORYID = 'd8031i1djxm1hh5rpmpv2smc'; // 과자 categoryId

export const LANDING_CATCHPHRASE = [
  '쉽고 빠르게 구매를 요청해보세요',
  '다양한 품목도 한 눈에 파악해요',
  '내가 원하는 간식을, 원하는 만큼!',
  '관리자와 유저 모두 이용 가능해요',
];
