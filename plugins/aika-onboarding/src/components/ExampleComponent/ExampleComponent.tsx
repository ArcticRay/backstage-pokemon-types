import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { ExampleFetchComponent } from '../ExampleFetchComponent';

export const ExampleComponent = () => (
  <Page themeId="tool">
    <Header
      title="Welcome to your Pokemon Team Analysis Tool!"
      subtitle="Let's Begin!"
    >
      <HeaderLabel label="Owner" value="ArcticRay" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Pokemon Team">
        <SupportButton>Support.</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="Your Pokemon Team">
            <ExampleFetchComponent />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
