export const authMessage = {
  success: {
    login: '로그인 성공',
    requestLogin: '로그인 시도',
    sendEmailAuthCode: '인증번호가 발송되었습니다.',
    verifyEmailAuth: '인증에 성공하였습니다.',
  },
  fail: {
    findByEmail: '존재하지 않는 이메일입니다.',
    comparePassword: '패스워드가 일치하지 않습니다.',
    blackList: '해당 계정은 접속이 제한되었습니다.',
    globalAccess: '접속하신 계정은 국내에서만 로그인이 가능합니다.',
    verifyAuthCacheExist: '인증 시간이 만료되었거나, 인증번호가 일치하지 않습니다.',
    confirmAuthCode: '인증 시간이 만료되었거나, 인증번호가 일치하지 않습니다.',
    countOutPassword: '지속적인 패스워드 불일치로 인해 계정이 비활성화 되었습니다.\n나중에 다시 시도해 주세요.',
  },
};
