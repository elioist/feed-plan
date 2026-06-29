import React from 'react';
import { scan } from 'react-scan';
import whyDidYouRender from '@welldone-software/why-did-you-render';

declare global {
  interface Window {
    __FEED_PLAN_RENDER_DEBUG__?: boolean;
  }
}

if (!window.__FEED_PLAN_RENDER_DEBUG__) {
  window.__FEED_PLAN_RENDER_DEBUG__ = true;

  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOwnerReasons: true,
    collapseGroups: true,
    hotReloadBufferMs: 500,
  });

  scan({
    enabled: true,
    showToolbar: true,
    showFPS: true,
    animationSpeed: 'fast',
    trackUnnecessaryRenders: true,
  });
}
