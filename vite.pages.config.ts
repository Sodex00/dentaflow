import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {resolve} from "node:path";
export default defineConfig({root:"github-pages",base:"/dentaflow/",publicDir:"../public",plugins:[react()],build:{outDir:"../dist-pages",emptyOutDir:true,rollupOptions:{input:{main:resolve(__dirname,"github-pages/index.html"),admin:resolve(__dirname,"github-pages/admin/index.html")}}}});
