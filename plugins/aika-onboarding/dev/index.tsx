import { createDevApp } from '@backstage/dev-utils';
import { aikaOnboardingPlugin, AikaOnboardingPage } from '../src/plugin';

createDevApp()
  .registerPlugin(aikaOnboardingPlugin)
  .addPage({
    element: <AikaOnboardingPage />,
    title: 'Root Page',
    path: '/aika-onboarding',
  })
  .render();
