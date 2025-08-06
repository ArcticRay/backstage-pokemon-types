import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const aikaOnboardingPlugin = createPlugin({
  id: 'aika-onboarding',
  routes: {
    root: rootRouteRef,
  },
});

export const AikaOnboardingPage = aikaOnboardingPlugin.provide(
  createRoutableExtension({
    name: 'AikaOnboardingPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
