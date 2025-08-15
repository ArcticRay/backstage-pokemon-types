import { createDevApp } from '@backstage/dev-utils';
import { pokemonPlugin, PokemonPage } from '../src/plugin';

createDevApp()
  .registerPlugin(pokemonPlugin)
  .addPage({
    element: <PokemonPage />,
    title: 'Root Page',
    path: '/pokemon',
  })
  .render();
