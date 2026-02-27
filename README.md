# React + TypeScript + Vite

If you want to run locally
`npm run dev`
then 
`http://localhost:5173`


if it is the first time, then you must run
`npm install` first

To clean up with eslint, run
`npm run lint:fix`

TODO: Not listed in any particular order
1. Refactor message parts into their own components
2. When switching servers, should open up a channel in that server 
    a. discord does last channel you opened but opening default general channel is okay for first step
    b. actually is it last channel opened or last channel opened in the session? Ie is this cached
3. implement scrolling and caching for messages
4. invites to servers -- not just everyone can see all the servers
5. different permissions in servers
    a. already have server owner as the person who created it
6. more user personalitization
    a. display name vs uuid, maybe implement @ing as part of effort
7. global emotes?
    a. limit to 25 total maybe? limited in amount of pictures we can store
8. sending pictures?
    a. again very limited amount of images we can store :/ could delete old images as we get close to the limit
       would rather prioritize space for user pfp and server pfp
9. deleting your own messages
10. admins being able to delete other peoples messages
11. moving the order of the servers
    a. unique to user
12. Editing own messages
13. Deleting servers with correct permissions 











This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
