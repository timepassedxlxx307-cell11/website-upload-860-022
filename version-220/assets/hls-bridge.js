import { H as Hls } from './video-vendor-dru42stk.js';

window.Hls = Hls;
window.dispatchEvent(new CustomEvent('hls-ready'));
