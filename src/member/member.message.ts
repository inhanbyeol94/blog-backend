export const memberRegex = {
  email: /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i,
  password: /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/,
  nickname: /^[가-힣a-zA-Z0-9]+$/,
  phoneNumber: /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/,
  blogAddress: /^[a-z]+[a-z0-9]$/g,
};
export const memberMessage = {
  success: {
    createMember: '회원가입이 완료되었습니다.',
    emailExist: '사용이 가능한 이메일입니다.',
    nicknameExist: '사용이 가능한 닉네임입니다.',
  },
  fail: {
    emailExist: '이미 사용중인 이메일입니다.',
    nicknameExist: '이미 사용중인 닉네임입니다.',
    phonenumberExist: '이미 사용중인 휴대폰번호입니다.',
    emailAuthVerify: '이메일 인증이 완료되지 않았습니다.',
  },
};
