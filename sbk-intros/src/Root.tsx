import React from 'react';
import {Composition} from 'remotion';
import {WisdomChronicles} from './WisdomChronicles';
import {StoryHour} from './StoryHour';
import {HomeboysPodcast} from './HomeboysPodcast';
import {FPS, DURATION} from './brand';

const common = {fps: FPS, width: 1920, height: 1080, durationInFrames: DURATION};

export const Root: React.FC = () => (
  <>
    <Composition id="WisdomChronicles" component={WisdomChronicles} {...common} />
    <Composition id="StoryHour" component={StoryHour} {...common} />
    <Composition id="HomeboysPodcast" component={HomeboysPodcast} {...common} />
  </>
);
