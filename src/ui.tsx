// TODO: This file is no longer used, remove it!

import { Button, Container, render, Textbox, useInitialFocus, VerticalSpace } from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { h } from 'preact';
import { useState } from 'preact/hooks';

function Plugin(props: { teamName: string, teamColor: string, placeholder: string }) {
  const [text, setText] = useState(props.teamName);
  return <Container style={{ '--color-accent': props.teamColor }}>
    <VerticalSpace space='small' />
    <Textbox
      {...useInitialFocus()}
      placeholder={props.placeholder}
      onValueInput={setText}
      value={text} />
    <VerticalSpace space='small' />
    <Button fullWidth onClick={() => emit('UPDATE_TEAM_NAME', text)}>
      Update team name
    </Button>
    <VerticalSpace space='small' />
  </Container>;
}

export default render(Plugin)
