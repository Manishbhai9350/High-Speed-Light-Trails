import { defineConfig } from "vite"
import GLSL from 'vite-plugin-glsl'

export default defineConfig({
    plugins:[GLSL()]
})