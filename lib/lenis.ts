import Lenis from "lenis";

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis) => {
  lenis = instance;
};

export const getLenis = () => lenis;
