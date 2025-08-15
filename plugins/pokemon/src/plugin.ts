import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const pokemonPlugin = createPlugin({
  id: 'pokemon',
  routes: {
    root: rootRouteRef,
  },
});

export const PokemonPage = pokemonPlugin.provide(
  createRoutableExtension({
    name: 'PokemonPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
