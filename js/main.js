import { load } from './state.js';
import { render } from './ui/core.js';
import { initCl4p } from './cl4p.js';

load();
initCl4p();
render();
