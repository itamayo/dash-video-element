import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json'

export default {
  input: 'index.js',
  output: {
    file: pkg.main,
    format: 'umd',
    name:"dash-video-element"
  },
  plugins: [
    resolve(),
    commonjs(),
    terser(),
  ]
};
