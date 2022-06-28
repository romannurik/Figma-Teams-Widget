/** @jsx figma.widget.h */

import { randomFakeUser } from './fake-users';
const { widget } = figma;
const { Input, AutoLayout, Ellipse, Image, Text, useSyncedState, usePropertyMenu, useSyncedMap, useEffect, useWidgetId } = widget;

interface Colors {
  tonal: string;
  fill: string;
}

const COLORS: { [id: string]: Colors } = {
  pink: {
    tonal: '#FCE4EC',
    fill: '#C2185B',
  },
  teal: {
    tonal: '#E0F2F1',
    fill: '#00796B',
  },
  purple: {
    tonal: '#EDE7F6',
    fill: '#512DA8',
  },
  orange: {
    tonal: '#FBE9E7',
    fill: '#BF360C',
  },
  blue: {
    tonal: '#E1F5FE',
    fill: '#0277BD',
  },
  green: {
    tonal: '#F1F8E9',
    fill: '#558B2F',
  },
};

interface Membership {
  team: number;
  name: string;
  photoUrl: string;
}

const RANDOM_FAKE_USER = randomFakeUser();

function TeamsWidget() {
  const [isOnboarding, setOnboarding] = useSyncedState<boolean>('isOnboarding', true);
  const [numTeams, setNumTeams] = useSyncedState<number | null>('numTeams', null);
  const [maxPerTeam, setMaxPerTeam] = useSyncedState<number | null>('maxPerTeam', null);
  const [teamColors, setTeamColors] = useSyncedState<string[] | null>('teamColors', null);
  const memberships = useSyncedMap<Membership>('memberships');
  const teamNames = useSyncedMap<string>('teamNames');

  const currentUser = () => figma.currentUser;

  const widgetNodeId = useWidgetId();

  useEffect(() => {
    if (teamColors === null) {
      setTeamColors(Object.keys(COLORS).sort(() => Math.random() - 0.5));
    }
  });

  usePropertyMenu(
    [
      !isOnboarding && {
        itemType: 'action',
        tooltip: 'Delete all teams',
        propertyName: 'reset',
      },
      !isOnboarding && {
        itemType: 'action',
        tooltip: 'Unjoin team',
        propertyName: 'unjoin',
      }
    ].filter(i => !!i) as WidgetPropertyMenuItem[],
    ({ propertyName }) => {
      switch (propertyName) {
        case 'reset':
          setOnboarding(true);
          setNumTeams(null);
          setMaxPerTeam(null);
          setTeamColors(null);
          for (let k of memberships.keys()) {
            memberships.delete(k);
          }
          for (let k of teamNames.keys()) {
            teamNames.delete(k);
          }
          break;
        case 'unjoin':
          memberships.delete(currentUser()?.id || '');
          break;
      }
    },
  );

  if (numTeams === null) {
    return <Container heading="How many teams?">
      <AutoLayout
        direction="horizontal"
        height="hug-contents"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        spacing={8}>
        <ChoiceButton colors={COLORS.pink} circle label="2" onClick={() => setNumTeams(2)} />
        <ChoiceButton colors={COLORS.pink} circle label="3" onClick={() => setNumTeams(3)} />
        <ChoiceButton colors={COLORS.pink} circle label="4" onClick={() => setNumTeams(4)} />
        <ChoiceButton colors={COLORS.pink} circle label="5" onClick={() => setNumTeams(5)} />
        <ChoiceButton colors={COLORS.pink} circle label="6" onClick={() => setNumTeams(6)} />
      </AutoLayout>
    </Container>;
  }

  if (maxPerTeam === null) {
    return <Container heading="Max people per team?">
      <AutoLayout direction="vertical" spacing={8}>
        <AutoLayout
          direction="horizontal"
          height="hug-contents"
          horizontalAlignItems="center"
          verticalAlignItems="center"
          spacing={8}>
          <ChoiceButton colors={COLORS.teal} circle label="2" onClick={() => setMaxPerTeam(2)} />
          <ChoiceButton colors={COLORS.teal} circle label="3" onClick={() => setMaxPerTeam(3)} />
          <ChoiceButton colors={COLORS.teal} circle label="4" onClick={() => setMaxPerTeam(4)} />
          <ChoiceButton colors={COLORS.teal} circle label="5" onClick={() => setMaxPerTeam(5)} />
          <ChoiceButton colors={COLORS.teal} circle label="6" onClick={() => setMaxPerTeam(6)} />
        </AutoLayout>
        <AutoLayout
          direction="horizontal"
          height="hug-contents"
          horizontalAlignItems="center"
          verticalAlignItems="center"
          spacing={8}>
          <ChoiceButton colors={COLORS.teal} circle label="7" onClick={() => setMaxPerTeam(7)} />
          <ChoiceButton colors={COLORS.teal} circle label="8" onClick={() => setMaxPerTeam(8)} />
          <ChoiceButton width={32 * 3 + 8 * 2}
            colors={COLORS.teal} label="Unlimited" onClick={() => setMaxPerTeam(0)} />
        </AutoLayout>
      </AutoLayout>
    </Container>;
  }

  if (isOnboarding) {
    const randomizeTeams = () => {
      const eligibleUsers = figma.activeUsers.filter(({ id }) => !!id);
      const perTeam = Math.ceil(eligibleUsers.length / numTeams);
      const assignments: { [id: string]: number } = {};

      for (let user of eligibleUsers) {
        while (!(user.id! in assignments)) {
          const team = Math.floor(Math.random() * numTeams);
          const numInTeam = Object.values(assignments).filter(t => t === team).length;
          if (numInTeam < perTeam) {
            assignments[user.id!] = team;
            break;
          }
        }
      }

      for (let [id, team] of Object.entries(assignments)) {
        let user = eligibleUsers.find(u => u.id === id);
        memberships.set(id, {
          team: team,
          name: user!.name,
          photoUrl: user!.photoUrl || '',
        });
      }
    }

    return <Container heading="Teams">
      <AutoLayout
        direction="vertical"
        height="hug-contents"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        spacing={8}>
        <ChoiceButton colors={COLORS.blue} width={32 * 5 + 8 * 4} label="Empty"
          onClick={() => setOnboarding(false)} />
        <ChoiceButton colors={COLORS.blue} width={32 * 5 + 8 * 4} label="Randomized"
          onClick={() => {
            randomizeTeams();
            setOnboarding(false);
          }} />
      </AutoLayout>
    </Container>;
  }

  return <Container heading="Teams">
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="start"
      verticalAlignItems="start"
      spacing={12}>
      {new Array(numTeams).fill(0).map((_, teamNumber) => {
        let colors: Colors = COLORS[teamColors?.[teamNumber] || 'pink'];
        let members: (Membership & { id: string })[] = memberships.entries()
          .filter(([, { team }]) => team === teamNumber)
          .map(([id]) => ({ id, ...memberships.get(id)! }));
        return <AutoLayout
          key={teamNumber}
          direction="vertical"
          width={188}
          height="hug-contents"
          horizontalAlignItems="start"
          verticalAlignItems="center"
          fill={colors.tonal}
          padding={{ vertical: 12, horizontal: 16 }}
          cornerRadius={16}
          spacing={16}>
          <Input
            fontFamily="Inter"
            fontWeight="bold"
            fontSize={16}
            lineHeight={24}
            width="fill-parent"
            height={24}
            inputBehavior='truncate'
            fill={colors.fill}
            placeholder={`Team ${teamNumber + 1}`}
            value={teamNames.get(String(teamNumber)) || `Team ${teamNumber + 1}`}
            onTextEditEnd={ev => teamNames.set(String(teamNumber), ev.characters)} />
          <AutoLayout
            key={teamNumber}
            direction="vertical"
            width="fill-parent"
            spacing={8}>
            {/* Team members */}
            {members.map(({ id, name, photoUrl }) =>
              <AutoLayout key={id} direction="horizontal" spacing={12} width="fill-parent">
                <Image src={photoUrl} width={24} height={24} cornerRadius={100} />
                <Text fontFamily="Inter" fontWeight="medium" fontSize={16} lineHeight={24} fill={colors.fill}>
                  {name}
                </Text>
              </AutoLayout>)}
            {/* Placeholder */}
            {new Array(Math.max(0, (maxPerTeam || 3) - members.length)).fill(0).map((_, i) =>
              <AutoLayout key={i} direction="horizontal" spacing={12} width="fill-parent" opacity={0.2}>
                <Ellipse width={24} height={24} stroke={colors.fill} strokeWidth={2} strokeAlign="inside" />
                <Text fontFamily="Inter" fontWeight="medium" fontSize={16} lineHeight={24} fill={colors.fill}>
                  ——
                </Text>
              </AutoLayout>)}
          </AutoLayout>
          <Button
            color={colors.fill}
            onClick={() => {
              if (!currentUser()?.id) {
                figma.notify("Log in to join a team!", { error: true });
              } else if (maxPerTeam > 0 && members.length >= maxPerTeam) {
                figma.notify("This team is full!", { error: true });
              } else if (members.find(({ id }) => id === currentUser()?.id)) {
                figma.notify("You're already on this team!", { error: true });
              } else {
                memberships.set(currentUser()?.id || "", {
                  team: teamNumber,
                  name: currentUser()?.name || '',
                  photoUrl: currentUser()?.photoUrl || ''
                });
              }
            }}>
            Join
          </Button>
        </AutoLayout>;
      })}
    </AutoLayout>
  </Container>;
}

interface ButtonProps extends HasChildrenProps {
  color: string;
  onClick: () => void;
}

function Button({ children, color, onClick }: ButtonProps) {
  return <AutoLayout horizontalAlignItems="center" verticalAlignItems="center"
    padding={{ vertical: 8, horizontal: 24 }}
    fill={color}
    cornerRadius={100}
    onClick={onClick}>
    <Text fill="#FFFFFF" fontFamily="Inter" fontSize={14} lineHeight={20} fontWeight="bold">
      {children!.toString()}
    </Text>
  </AutoLayout>;
}

interface ContainerProps extends HasChildrenProps {
  heading?: string;
}

function Container({ heading, children }: ContainerProps) {
  return <AutoLayout
    direction="vertical"
    horizontalAlignItems="center"
    verticalAlignItems="center"
    height="hug-contents"
    width="hug-contents"
    padding={{ top: heading ? 12 : 16, right: 16, bottom: 16, left: 16 }}
    fill="#FFFFFF"
    cornerRadius={32}
    spacing={12}
    stroke={{ r: 0, g: 0, b: 0, a: 0.05 }}
    strokeWidth={1}
    strokeAlign="outside"
    effect={{
      type: 'drop-shadow',
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 2 },
      blur: 6,
    }}>
    {heading && <Text
      fontFamily="Inter"
      fontWeight="semi-bold"
      fontSize={14}
      lineHeight={20}>
      {heading}
    </Text>}
    {children}
  </AutoLayout>;
}

interface ChoiceButtonProps {
  label: string;
  colors: Colors;
  circle?: boolean;
  width?: number;
  onClick: () => void;
}

function ChoiceButton({ label, width, circle, colors, onClick }: ChoiceButtonProps) {
  return <AutoLayout
    direction="horizontal"
    width={circle ? 32 : (width || 'hug-contents')}
    height={32}
    horizontalAlignItems="center"
    verticalAlignItems="center"
    fill={colors.tonal}
    cornerRadius={100}
    padding={{ horizontal: 20 }}
    onClick={onClick}>
    <Text fontSize={16} lineHeight={24} fontWeight="bold" fill={colors.fill}>
      {label}
    </Text>
  </AutoLayout>
}

export default function () {
  widget.register(TeamsWidget);
}
