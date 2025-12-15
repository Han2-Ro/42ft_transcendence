import { defineConfig } from 'vite';    // or vue(), svelte(), etc.
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [ tailwindcss()],
	server: {
    	port: 3000
  	}
})