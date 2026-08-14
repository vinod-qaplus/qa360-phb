let navigateFn = null;

export const setNavigate = (fn) => {
  console.log(fn);
  navigateFn = fn;
};

export const navigateTo = (path, options) => {
  if (navigateFn) {
    navigateFn(path, options);
  }
};
