import type {
  AvatarFullConfig,
  EarSize,
  EyeBrowStyle,
  EyeStyle,
  GlassesStyle,
  HairStyle,
  HatStyle,
  MouthStyle,
  NoseStyle,
  Sex,
  ShirtStyle,
} from 'react-nice-avatar';
import {genConfig} from 'react-nice-avatar';
import Alea from 'alea'; // alea is a tiny random seeded prng
import {uniqueNamesGenerator, adjectives, animals, names} from 'unique-names-generator';

export function addressToAvatarConfig(address: string) {
  const randoms = Alea(address.toLowerCase());

  function choose<T>(choices: T[]): T {
    return choices[Math.floor(randoms.next() * choices.length)];
  }

  const sex = choose<Sex>(['man', 'woman']);
  const config: AvatarFullConfig = {
    sex,
    earSize: choose<EarSize>(['big', 'small']),
    eyeStyle: choose<EyeStyle>(['circle', 'oval', 'smile']),
    noseStyle: choose<NoseStyle>(['long', 'round', 'short']),
    mouthStyle: choose<MouthStyle>(['laugh', 'peace', 'smile']),
    shirtStyle: choose<ShirtStyle>(['hoody', 'polo', 'short']),
    glassesStyle: choose<GlassesStyle>(['none', 'round', 'square']),
    hairStyle: choose<HairStyle>(sex == 'man' ? ['mohawk', 'normal', 'thick'] : ['womanLong', 'womanShort']),
    eyeBrowStyle: choose<EyeBrowStyle>(sex == 'man' ? ['up'] : ['upWoman']),
    hatStyle: choose<HatStyle>(['beanie', 'none', 'none', 'none', 'none']),
    // dark & light tan
    faceColor: choose<string>(['#f9c9b6', '#ac6651']),
    // https://www.pinterest.com/pin/805229608391900287/?mt=login
    hairColor: choose<string>(['#d6c4c2', '#504444', '#2c222b', '#a7856a', '#8d4a43']),
    // random colors from https://yeun.github.io/open-color/ (Open Color)
    hatColor: choose<string>(['#e67700', '#087f5b', '#364fc7', '#c92a2a', '#495057']),
    shirtColor: choose<string>(['#e67700', '#087f5b', '#364fc7', '#c92a2a', '#495057']),
    bgColor: choose<string>(['#ffd43b', '#ff922b', '#94d82d', '#22b8cf', '#339af0', '#ff6b6b', '#adb5bd']),
    isGradient: true,
  };
  return genConfig(config);
}

export function addressToUsername(address: string): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals, names],
    separator: ' ',
    seed: address.toLowerCase(),
    style: 'capital',
  });
}
