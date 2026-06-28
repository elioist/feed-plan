import { useRouterState } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { TargetAndTransition, Transition } from 'motion/react';
import { useSettingStore } from '~/store/modules/setting';
import styles from './styles.module.scss';

type PageTransitionName = '' | 'fade' | 'slide-bottom' | 'slide-left' | 'slide-top';

interface RouteTransitionProps extends PropsWithChildren {
  refreshToken: number;
}

const baseTransition: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
};

const transitionInitialStates: Record<Exclude<PageTransitionName, ''>, TargetAndTransition> = {
  fade: {
    opacity: 0,
  },
  'slide-bottom': {
    opacity: 0,
    y: 10,
  },
  'slide-left': {
    opacity: 0,
    x: -10,
  },
  'slide-top': {
    opacity: 0,
    y: -10,
  },
};

const visibleState: TargetAndTransition = {
  opacity: 1,
  x: 0,
  y: 0,
};

function getTransitionName(value: string): PageTransitionName {
  if (
    value === 'fade' ||
    value === 'slide-bottom' ||
    value === 'slide-left' ||
    value === 'slide-top'
  ) {
    return value;
  }

  return '';
}

export function RouteTransition({ children, refreshToken }: RouteTransitionProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const pageTransition = useSettingStore((state) => state.pageTransition);
  const shouldReduceMotion = useReducedMotion();
  const transitionName = getTransitionName(pageTransition);
  const transitionKey = `${pathname}:${refreshToken}`;
  const initialState = shouldReduceMotion
    ? transitionInitialStates.fade
    : transitionName
      ? transitionInitialStates[transitionName]
      : false;

  if (!transitionName) {
    return (
      <div key={transitionKey} className={styles.view} data-page-transition="none">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      key={transitionKey}
      animate={visibleState}
      className={styles.view}
      data-page-transition={transitionName}
      initial={initialState}
      transition={baseTransition}
    >
      {children}
    </motion.div>
  );
}
