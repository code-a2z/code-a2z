export const PASSWORD_REGEX: RegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const EMAIL_REGEX: RegExp =
  /^\w{3,}([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const URL_REGEX: RegExp =
  /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-.,@?^=%&:/~+#]*)?$/;
